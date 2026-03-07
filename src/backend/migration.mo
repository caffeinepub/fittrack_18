import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type OldActor = {
    foodEntriesMap : Map.Map<Principal, List.List<{ name : Text; calories : Float; protein : Float; carbs : Float; fat : Float; date : Text }>>;
    workoutSessionsMap : Map.Map<Principal, List.List<{ name : Text; date : Text; duration : Float; exercises : [{ name : Text; sets : Nat; reps : Nat; weight : Float }] }>>;
    bodyWeightEntriesMap : Map.Map<Principal, List.List<{ date : Text; weight : Float }>>;
    configuration : ?Stripe.StripeConfiguration;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewActor = {
    foodEntriesMap : Map.Map<Principal, List.List<{ name : Text; calories : Float; protein : Float; carbs : Float; fat : Float; date : Text }>>;
    workoutSessionsMap : Map.Map<Principal, List.List<{ name : Text; date : Text; duration : Float; exercises : [{ name : Text; sets : Nat; reps : Nat; weight : Float }] }>>;
    bodyWeightEntriesMap : Map.Map<Principal, List.List<{ date : Text; weight : Float }>>;
    configuration : ?Stripe.StripeConfiguration;
    userProfiles : Map.Map<Principal, { name : Text; displayName : ?Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, { name : Text }, { name : Text; displayName : ?Text }>(
      func(_principal, oldProfile) {
        { oldProfile with displayName = null };
      }
    );
    { old with userProfiles = newUserProfiles };
  };
};
