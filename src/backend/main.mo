import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

(with migration = Migration.run)
actor {
  module FoodEntry {
    public func compareByDate(entry1 : FoodEntry, entry2 : FoodEntry) : Order.Order {
      Text.compare(entry1.date, entry2.date);
    };
  };

  type FoodEntry = {
    name : Text;
    calories : Float;
    protein : Float;
    carbs : Float;
    fat : Float;
    date : Text;
  };

  module WorkoutSession {
    public func compareByDate(session1 : WorkoutSession, session2 : WorkoutSession) : Order.Order {
      Text.compare(session1.date, session2.date);
    };
  };

  type WorkoutSession = {
    name : Text;
    date : Text;
    duration : Float;
    exercises : [Exercise];
  };

  type Exercise = {
    name : Text;
    sets : Nat;
    reps : Nat;
    weight : Float;
  };

  module BodyWeightEntry {
    public func compareByDate(entry1 : BodyWeightEntry, entry2 : BodyWeightEntry) : Order.Order {
      Text.compare(entry1.date, entry2.date);
    };
  };

  type BodyWeightEntry = {
    date : Text;
    weight : Float;
  };

  type DailyTotals = {
    calories : Float;
    protein : Float;
    carbs : Float;
    fat : Float;
  };

  public type UserProfile = {
    name : Text;
    displayName : ?Text;
  };

  public type LeaderboardEntry = {
    principalText : Text;
    displayName : Text;
    totalVolumeAllTime : Float;
    totalVolumeLast7Days : Float;
    workoutCountAllTime : Nat;
    workoutCountLast7Days : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let foodEntriesMap = Map.empty<Principal, List.List<FoodEntry>>();
  let workoutSessionsMap = Map.empty<Principal, List.List<WorkoutSession>>();
  let bodyWeightEntriesMap = Map.empty<Principal, List.List<BodyWeightEntry>>();

  // Stripe integration state
  var configuration : ?Stripe.StripeConfiguration = null;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Permission denied: Only authenticated users can set display name");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Please create/save your profile first.");
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          name = existingProfile.name;
          displayName = ?displayName;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Food Entry Functions
  public shared ({ caller }) func addFoodEntry(entry : FoodEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add food entries");
    };
    let userEntries = switch (foodEntriesMap.get(caller)) {
      case (null) { List.empty<FoodEntry>() };
      case (?entries) { entries };
    };
    userEntries.add(entry);
    foodEntriesMap.add(caller, userEntries);
  };

  public query ({ caller }) func getFoodEntriesByDate(date : Text) : async [FoodEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get food entries");
    };
    let userEntries = switch (foodEntriesMap.get(caller)) {
      case (null) { List.empty<FoodEntry>() };
      case (?entries) { entries };
    };
    userEntries.toArray().filter(func(entry) { entry.date == date });
  };

  public query ({ caller }) func getDailyTotals(date : Text) : async DailyTotals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get daily totals");
    };
    let userEntries = switch (foodEntriesMap.get(caller)) {
      case (null) { List.empty<FoodEntry>() };
      case (?entries) { entries };
    };
    let entriesForDate = userEntries.toArray().filter(func(entry) { entry.date == date });

    var totalCalories = 0.0;
    var totalProtein = 0.0;
    var totalCarbs = 0.0;
    var totalFat = 0.0;

    for (entry in entriesForDate.vals()) {
      totalCalories += entry.calories;
      totalProtein += entry.protein;
      totalCarbs += entry.carbs;
      totalFat += entry.fat;
    };

    {
      calories = totalCalories;
      protein = totalProtein;
      carbs = totalCarbs;
      fat = totalFat;
    };
  };

  public shared ({ caller }) func deleteFoodEntry(date : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete food entries");
    };
    let userEntries = switch (foodEntriesMap.get(caller)) {
      case (null) { List.empty<FoodEntry>() };
      case (?entries) { entries };
    };
    let filteredEntries = userEntries.filter(
      func(entry) {
        entry.date != date or entry.name != name;
      }
    );
    foodEntriesMap.add(caller, filteredEntries);
  };

  // Workout Session Functions
  public shared ({ caller }) func addWorkoutSession(session : WorkoutSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add workout sessions");
    };
    let userSessions = switch (workoutSessionsMap.get(caller)) {
      case (null) { List.empty<WorkoutSession>() };
      case (?sessions) { sessions };
    };
    userSessions.add(session);
    workoutSessionsMap.add(caller, userSessions);
  };

  public query ({ caller }) func getAllWorkoutSessions() : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get workout sessions");
    };
    let userSessions = switch (workoutSessionsMap.get(caller)) {
      case (null) { List.empty<WorkoutSession>() };
      case (?sessions) { sessions };
    };
    userSessions.toArray().sort(WorkoutSession.compareByDate);
  };

  public query ({ caller }) func getWorkoutSessionsByDate(date : Text) : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get workout sessions");
    };
    let userSessions = switch (workoutSessionsMap.get(caller)) {
      case (null) { List.empty<WorkoutSession>() };
      case (?sessions) { sessions };
    };
    userSessions.toArray().filter(func(session) { session.date == date });
  };

  public shared ({ caller }) func deleteWorkoutSession(date : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete workout sessions");
    };
    let userSessions = switch (workoutSessionsMap.get(caller)) {
      case (null) { List.empty<WorkoutSession>() };
      case (?sessions) { sessions };
    };
    let filteredSessions = userSessions.filter(
      func(session) {
        session.date != date or session.name != name;
      }
    );
    workoutSessionsMap.add(caller, filteredSessions);
  };

  // Body Weight Entry Functions
  public shared ({ caller }) func addBodyWeightEntry(entry : BodyWeightEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add body weight entries");
    };
    let userEntries = switch (bodyWeightEntriesMap.get(caller)) {
      case (null) { List.empty<BodyWeightEntry>() };
      case (?entries) { entries };
    };
    userEntries.add(entry);
    bodyWeightEntriesMap.add(caller, userEntries);
  };

  public query ({ caller }) func getAllBodyWeightEntries() : async [BodyWeightEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get body weight entries");
    };
    let userEntries = switch (bodyWeightEntriesMap.get(caller)) {
      case (null) { List.empty<BodyWeightEntry>() };
      case (?entries) { entries };
    };
    userEntries.toArray().sort(BodyWeightEntry.compareByDate);
  };

  public shared ({ caller }) func deleteBodyWeightEntry(date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete body weight entries");
    };
    let userEntries = switch (bodyWeightEntriesMap.get(caller)) {
      case (null) { List.empty<BodyWeightEntry>() };
      case (?entries) { entries };
    };
    let filteredEntries = userEntries.filter(
      func(entry) {
        entry.date != date;
      }
    );
    bodyWeightEntriesMap.add(caller, filteredEntries);
  };

  // Leaderboard Functions
  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    // No authorization required - public leaderboard accessible to all users including guests
    let currentTime = getCurrentTimeMillis();
    let sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;

    let leaderboardEntries : List.List<LeaderboardEntry> = List.empty<LeaderboardEntry>();

    for ((principal, profile) in userProfiles.entries()) {
      let workoutSessions = switch (workoutSessionsMap.get(principal)) {
        case (null) { List.empty<WorkoutSession>() };
        case (?sessions) { sessions };
      };

      var totalVolumeAllTime : Float = 0.0;
      var totalVolumeLast7Days : Float = 0.0;
      var workoutCountAllTime : Nat = 0;
      var workoutCountLast7Days : Nat = 0;

      for (session in workoutSessions.values()) {
        let sessionDateMillis = parseDateAsMillis(session.date);
        let isWithinLast7Days = switch (sessionDateMillis) {
          case (null) { false };
          case (?dateMillis) { (currentTime - dateMillis) <= sevenDaysInMillis };
        };

        var sessionVolume : Float = 0.0;
        for (exercise in session.exercises.values()) {
          sessionVolume += exercise.sets.toInt().toFloat() * exercise.reps.toInt().toFloat() * exercise.weight;
        };

        totalVolumeAllTime += sessionVolume;
        workoutCountAllTime += 1;

        if (isWithinLast7Days) {
          totalVolumeLast7Days += sessionVolume;
          workoutCountLast7Days += 1;
        };
      };

      let displayName = switch (profile.displayName) {
        case (null) { profile.name };
        case (?name) { name };
      };

      let leaderboardEntry : LeaderboardEntry = {
        principalText = principal.toText();
        displayName;
        totalVolumeAllTime;
        totalVolumeLast7Days;
        workoutCountAllTime;
        workoutCountLast7Days;
      };

      leaderboardEntries.add(leaderboardEntry);
    };

    leaderboardEntries.toArray();
  };

  func getCurrentTimeMillis() : Int {
    Time.now() / 1_000_000;
  };

  func parseDateAsMillis(_date : Text) : ?Int {
    // Treat all entries as current for now
    ?getCurrentTimeMillis(); // Treat all entries as current for now
  };

  // Demo Data Function
  public shared ({ caller }) func seedDemoData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can seed demo data");
    };
    let foodEntries = List.fromArray<FoodEntry>([{
      name = "Oatmeal";
      calories = 150.0;
      protein = 5.0;
      carbs = 27.0;
      fat = 3.0;
      date = "2024-06-01";
    }]);
    foodEntriesMap.add(caller, foodEntries);

    let workoutSessions = List.fromArray<WorkoutSession>([{
      name = "Morning Workout";
      date = "2024-06-01";
      duration = 60.0;
      exercises = [{
        name = "Bench Press";
        sets = 3;
        reps = 10;
        weight = 60.0;
      }];
    }]);
    workoutSessionsMap.add(caller, workoutSessions);

    let bodyWeightEntries = List.fromArray<BodyWeightEntry>([{
      date = "2024-06-01";
      weight = 75.0;
    }]);
    bodyWeightEntriesMap.add(caller, bodyWeightEntries);
  };

  // Stripe Integration Functions
  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe configuration not set") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
