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
  Beef,
  Droplets,
  Flame,
  Loader2,
  Plus,
  ScanBarcode,
  Trash2,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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
    setOpen(true);
  }

  function pct(val: number, target: number) {
    return Math.min(Math.round((val / target) * 100), 100);
  }

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
          <Dialog open={open} onOpenChange={setOpen}>
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
              <DialogHeader>
                <DialogTitle className="font-display font-bold text-foreground">
                  Add Food Entry
                </DialogTitle>
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
                        setForm((p) => ({ ...p, calories: e.target.value }))
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
                        setForm((p) => ({ ...p, protein: e.target.value }))
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
