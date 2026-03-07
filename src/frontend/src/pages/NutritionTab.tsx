import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Beef,
  Droplets,
  Flame,
  Loader2,
  Plus,
  ScanBarcode,
  Search,
  Trash2,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import FoodBarcodeScanner from "../components/FoodBarcodeScanner";
import {
  useAddFoodEntry,
  useDailyTotals,
  useDeleteFoodEntry,
  useFoodEntriesByDate,
} from "../hooks/useQueries";

const TARGETS = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

function today() {
  return new Date().toISOString().split("T")[0];
}

interface FoodOption {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const COMMON_FOODS: FoodOption[] = [
  {
    name: "Chicken Breast (100g)",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
  },
  {
    name: "White Rice (100g)",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
  },
  { name: "Whole Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  {
    name: "Greek Yogurt (100g)",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
  },
  { name: "Oatmeal (100g dry)", calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: "Salmon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Broccoli (100g)", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  {
    name: "Sweet Potato (100g)",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
  },
  { name: "Almonds (30g)", calories: 173, protein: 6, carbs: 6, fat: 15 },
  { name: "Protein Shake", calories: 120, protein: 25, carbs: 3, fat: 1.5 },
  {
    name: "Peanut Butter (2 tbsp)",
    calories: 188,
    protein: 8,
    carbs: 6,
    fat: 16,
  },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Milk (240ml)", calories: 149, protein: 8, carbs: 12, fat: 8 },
  { name: "Tuna (100g)", calories: 132, protein: 29, carbs: 0, fat: 1 },
];

interface AddFoodForm {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

const emptyForm: AddFoodForm = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

export default function NutritionTab() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [open, setOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [form, setForm] = useState<AddFoodForm>(emptyForm);
  const [dialogView, setDialogView] = useState<"select" | "form">("select");
  const [foodSearch, setFoodSearch] = useState("");

  const foodQuery = useFoodEntriesByDate(selectedDate);
  const totalsQuery = useDailyTotals(selectedDate);
  const addMutation = useAddFoodEntry();
  const deleteMutation = useDeleteFoodEntry();

  const totals = totalsQuery.data ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const entries = foodQuery.data ?? [];

  // Build history foods from today's entries, deduped against common foods by name
  const historyFoods: FoodOption[] = useMemo(() => {
    const commonFoodNames = new Set(
      COMMON_FOODS.map((f) => f.name.toLowerCase()),
    );
    const seen = new Set<string>();
    return entries
      .filter((e) => {
        const key = e.name.toLowerCase();
        if (seen.has(key) || commonFoodNames.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((e) => ({
        name: e.name,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
      }));
  }, [entries]);

  // Filter all foods based on search query
  const searchQuery = foodSearch.trim().toLowerCase();
  const filteredHistory = historyFoods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery),
  );
  const filteredCommon = COMMON_FOODS.filter((f) =>
    f.name.toLowerCase().includes(searchQuery),
  );

  function handleDialogOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset dialog state on close
      setDialogView("select");
      setFoodSearch("");
      setForm(emptyForm);
    }
  }

  function handleSelectFood(food: FoodOption) {
    setForm({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    });
    setDialogView("form");
  }

  function handleEnterManually() {
    setForm(emptyForm);
    setDialogView("form");
  }

  function handleBackToSelect() {
    setDialogView("select");
    setFoodSearch("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry = {
      date: selectedDate,
      name: form.name.trim(),
      calories: Number.parseFloat(form.calories) || 0,
      protein: Number.parseFloat(form.protein) || 0,
      carbs: Number.parseFloat(form.carbs) || 0,
      fat: Number.parseFloat(form.fat) || 0,
    };
    if (!entry.name) {
      toast.error("Please enter a food name");
      return;
    }
    addMutation.mutate(entry, {
      onSuccess: () => {
        toast.success(`${entry.name} added!`);
        setForm(emptyForm);
        setOpen(false);
      },
      onError: () => toast.error("Failed to add food entry"),
    });
  }

  function handleDelete(name: string) {
    deleteMutation.mutate(
      { date: selectedDate, name },
      {
        onSuccess: () => toast.success("Entry removed"),
        onError: () => toast.error("Failed to remove entry"),
      },
    );
  }

  function handleFoodFound(food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) {
    setForm({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    });
    setDialogView("form");
    setOpen(true);
  }

  function pct(val: number, target: number) {
    return Math.min(Math.round((val / target) * 100), 100);
  }

  // Compute a flat indexed list for data-ocid markers (history first, then common)
  const allVisibleFoods = [...filteredHistory, ...filteredCommon];

  return (
    <section className="p-4 space-y-5">
      {/* Barcode Scanner */}
      <FoodBarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onFoodFound={handleFoodFound}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-2xl text-foreground">
          Nutrition
        </h2>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="nutrition.scan_barcode.button"
            size="sm"
            variant="outline"
            className="gap-1.5 font-display font-bold border-border text-foreground hover:bg-primary/10 hover:border-primary/50"
            onClick={() => setScannerOpen(true)}
          >
            <ScanBarcode className="w-4 h-4" />
            Scan
          </Button>
          <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button
                data-ocid="nutrition.add_button"
                size="sm"
                className="gap-1.5 font-display font-bold shadow-glow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Food
              </Button>
            </DialogTrigger>

            <DialogContent
              data-ocid="nutrition.add_food.dialog"
              className="bg-popover border-border max-w-sm mx-auto"
            >
              <AnimatePresence mode="wait" initial={false}>
                {dialogView === "select" ? (
                  <motion.div
                    key="select-view"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                  >
                    <DialogHeader>
                      <DialogTitle className="font-display font-bold text-foreground">
                        Choose a Food
                      </DialogTitle>
                    </DialogHeader>

                    {/* Search input */}
                    <div className="relative mt-3">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        data-ocid="nutrition.food_search.input"
                        placeholder="Search foods..."
                        value={foodSearch}
                        onChange={(e) => setFoodSearch(e.target.value)}
                        className="bg-input border-border pl-8 text-sm"
                        autoComplete="off"
                      />
                    </div>

                    {/* Food list */}
                    <div
                      className="overflow-y-auto mt-3 space-y-1 pr-0.5"
                      style={{ maxHeight: "300px" }}
                    >
                      {/* History section */}
                      {filteredHistory.length > 0 && (
                        <div>
                          <div className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground px-1 py-1.5">
                            History
                          </div>
                          {filteredHistory.map((food, i) => {
                            const globalIndex = i + 1;
                            return (
                              <button
                                key={`history-${food.name}`}
                                data-ocid={`nutrition.food_select.item.${globalIndex}`}
                                type="button"
                                onClick={() => handleSelectFood(food)}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors flex items-center justify-between gap-3 group"
                              >
                                <span className="font-body text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {food.name}
                                </span>
                                <span className="text-xs text-muted-foreground font-body whitespace-nowrap flex-shrink-0">
                                  <span className="text-calories">
                                    {food.calories} kcal
                                  </span>
                                  {" · "}
                                  <span className="text-protein">
                                    {food.protein}g P
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Common foods section */}
                      {filteredCommon.length > 0 && (
                        <div>
                          <div className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground px-1 py-1.5">
                            Common Foods
                          </div>
                          {filteredCommon.map((food, i) => {
                            const globalIndex = filteredHistory.length + i + 1;
                            return (
                              <button
                                key={`common-${food.name}`}
                                data-ocid={`nutrition.food_select.item.${globalIndex}`}
                                type="button"
                                onClick={() => handleSelectFood(food)}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors flex items-center justify-between gap-3 group"
                              >
                                <span className="font-body text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {food.name}
                                </span>
                                <span className="text-xs text-muted-foreground font-body whitespace-nowrap flex-shrink-0">
                                  <span className="text-calories">
                                    {food.calories} kcal
                                  </span>
                                  {" · "}
                                  <span className="text-protein">
                                    {food.protein}g P
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Empty search state */}
                      {allVisibleFoods.length === 0 && (
                        <div className="flex flex-col items-center py-8 text-center">
                          <UtensilsCrossed className="w-8 h-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground font-body">
                            No foods match "{foodSearch}"
                          </p>
                          <p className="text-xs text-muted-foreground/60 font-body mt-0.5">
                            Enter manually below
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Enter manually */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        data-ocid="nutrition.food_manual.button"
                        type="button"
                        variant="outline"
                        className="w-full font-body text-sm border-border hover:bg-muted/50"
                        onClick={handleEnterManually}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Enter manually
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18 }}
                  >
                    <DialogHeader>
                      <div className="flex items-center gap-2">
                        <button
                          data-ocid="nutrition.food_form.back_button"
                          type="button"
                          onClick={handleBackToSelect}
                          className="p-1 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="Back to food selection"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <DialogTitle className="font-display font-bold text-foreground">
                          Add Food Entry
                        </DialogTitle>
                      </div>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="food-name"
                          className="text-sm font-body text-muted-foreground"
                        >
                          Food Name
                        </Label>
                        <Input
                          id="food-name"
                          data-ocid="nutrition.name.input"
                          placeholder="e.g. Grilled Chicken Breast"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          className="bg-input border-border"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="food-calories"
                            className="text-sm font-body text-calories"
                          >
                            Calories (kcal)
                          </Label>
                          <Input
                            id="food-calories"
                            data-ocid="nutrition.calories.input"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            value={form.calories}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                calories: e.target.value,
                              }))
                            }
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="food-protein"
                            className="text-sm font-body text-protein"
                          >
                            Protein (g)
                          </Label>
                          <Input
                            id="food-protein"
                            data-ocid="nutrition.protein.input"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            value={form.protein}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                protein: e.target.value,
                              }))
                            }
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="food-carbs"
                            className="text-sm font-body text-carbs"
                          >
                            Carbs (g)
                          </Label>
                          <Input
                            id="food-carbs"
                            data-ocid="nutrition.carbs.input"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            value={form.carbs}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, carbs: e.target.value }))
                            }
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="food-fat"
                            className="text-sm font-body text-fat"
                          >
                            Fat (g)
                          </Label>
                          <Input
                            id="food-fat"
                            data-ocid="nutrition.fat.input"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            value={form.fat}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, fat: e.target.value }))
                            }
                            className="bg-input border-border"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          data-ocid="nutrition.add_food.submit_button"
                          className="w-full font-display font-bold shadow-glow-sm"
                          disabled={addMutation.isPending}
                        >
                          {addMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Food"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Picker */}
      <div className="flex items-center gap-3">
        <Label
          htmlFor="nutrition-date"
          className="text-sm font-body text-muted-foreground whitespace-nowrap"
        >
          View date:
        </Label>
        <Input
          id="nutrition-date"
          data-ocid="nutrition.date.input"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-card border-border max-w-xs font-body"
        />
      </div>

      {/* Daily Totals Summary */}
      {totalsQuery.isLoading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground font-body mb-3 font-semibold uppercase tracking-wider">
            Daily Totals
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-24">
                <Flame className="w-3.5 h-3.5 text-calories flex-shrink-0" />
                <span className="text-xs font-body text-foreground">
                  Calories
                </span>
              </div>
              <Progress
                value={pct(totals.calories, TARGETS.calories)}
                className="flex-1 h-2 bg-muted/40 progress-calories"
              />
              <span className="text-xs font-display font-bold text-calories w-16 text-right">
                {Math.round(totals.calories).toLocaleString()} kcal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-24">
                <Beef className="w-3.5 h-3.5 text-protein flex-shrink-0" />
                <span className="text-xs font-body text-foreground">
                  Protein
                </span>
              </div>
              <Progress
                value={pct(totals.protein, TARGETS.protein)}
                className="flex-1 h-2 bg-muted/40 progress-protein"
              />
              <span className="text-xs font-display font-bold text-protein w-16 text-right">
                {Math.round(totals.protein)}g
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-24">
                <Wheat className="w-3.5 h-3.5 text-carbs flex-shrink-0" />
                <span className="text-xs font-body text-foreground">Carbs</span>
              </div>
              <Progress
                value={pct(totals.carbs, TARGETS.carbs)}
                className="flex-1 h-2 bg-muted/40 progress-carbs"
              />
              <span className="text-xs font-display font-bold text-carbs w-16 text-right">
                {Math.round(totals.carbs)}g
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 w-24">
                <Droplets className="w-3.5 h-3.5 text-fat flex-shrink-0" />
                <span className="text-xs font-body text-foreground">Fat</span>
              </div>
              <Progress
                value={pct(totals.fat, TARGETS.fat)}
                className="flex-1 h-2 bg-muted/40 progress-fat"
              />
              <span className="text-xs font-display font-bold text-fat w-16 text-right">
                {Math.round(totals.fat)}g
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Food Entries */}
      <div>
        <div className="text-xs font-body text-muted-foreground font-semibold uppercase tracking-wider mb-3">
          Food Log
        </div>

        {foodQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div
            data-ocid="nutrition.food_entry.empty_state"
            className="flex flex-col items-center py-12 bg-card border border-border rounded-xl"
          >
            <UtensilsCrossed className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-body">
              No food logged for this day
            </p>
            <p className="text-xs text-muted-foreground/60 font-body mt-1">
              Tap "Add Food" to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={`${entry.date}-${entry.name}`}
                  data-ocid={`nutrition.food_entry.item.${i + 1}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-semibold text-sm text-foreground truncate">
                      {entry.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-calories font-body font-medium">
                        {Math.round(entry.calories)} kcal
                      </span>
                      <span className="text-xs text-protein font-body">
                        P: {Math.round(entry.protein)}g
                      </span>
                      <span className="text-xs text-carbs font-body">
                        C: {Math.round(entry.carbs)}g
                      </span>
                      <span className="text-xs text-fat font-body">
                        F: {Math.round(entry.fat)}g
                      </span>
                    </div>
                  </div>
                  <Button
                    data-ocid={`nutrition.food_entry.delete_button.${i + 1}`}
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => handleDelete(entry.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
