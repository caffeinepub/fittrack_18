import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, ScanBarcode, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQRScanner } from "../qr-code/useQRScanner";

interface FoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface OpenFoodFactsProduct {
  product?: {
    product_name?: string;
    nutriments?: {
      "energy-kcal_100g"?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
    };
  };
  status?: number;
}

interface FoodBarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodFound: (food: FoodData) => void;
}

export default function FoodBarcodeScanner({
  open,
  onOpenChange,
  onFoodFound,
}: FoodBarcodeScannerProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [scanStatus, setScanStatus] = useState<"scanning" | "found" | "error">(
    "scanning",
  );
  const hasProcessedRef = useRef(false);

  const scanner = useQRScanner({
    facingMode: "environment",
    scanInterval: 200,
    maxResults: 1,
  });

  const {
    startScanning,
    stopScanning,
    clearResults,
    qrResults,
    videoRef,
    canvasRef,
    isLoading,
    isScanning,
    error,
    retry,
  } = scanner;

  // Start/stop scanning when sheet opens/closes
  useEffect(() => {
    if (open) {
      hasProcessedRef.current = false;
      setScanStatus("scanning");
      startScanning();
    } else {
      stopScanning();
      clearResults();
      hasProcessedRef.current = false;
    }
  }, [open, startScanning, stopScanning, clearResults]);

  // Process barcode results
  useEffect(() => {
    if (
      !open ||
      hasProcessedRef.current ||
      isFetching ||
      qrResults.length === 0
    )
      return;

    const barcode = qrResults[0].data;

    // Only process numeric-looking barcodes (EAN/UPC) — ignore QR code URLs etc.
    const isBarcode = /^\d{8,14}$/.test(barcode);
    if (!isBarcode) return;

    hasProcessedRef.current = true;
    fetchFoodData(barcode);
    // biome-ignore lint/correctness/useExhaustiveDependencies: fetchFoodData is defined below and stable
  }, [qrResults, open, isFetching]);

  async function fetchFoodData(barcode: string) {
    setIsFetching(true);
    setScanStatus("scanning");

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );

      if (!res.ok) {
        throw new Error("Network error");
      }

      const data: OpenFoodFactsProduct = await res.json();

      if (!data.product || data.status === 0) {
        toast.error("Product not found. Try scanning again.", {
          description: `Barcode: ${barcode}`,
        });
        hasProcessedRef.current = false;
        clearResults();
        setIsFetching(false);
        return;
      }

      const p = data.product;
      const nutriments = p.nutriments ?? {};

      const food: FoodData = {
        name: p.product_name ?? `Product ${barcode}`,
        calories: Math.round(nutriments["energy-kcal_100g"] ?? 0),
        protein: Math.round((nutriments.proteins_100g ?? 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g ?? 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g ?? 0) * 10) / 10,
      };

      setScanStatus("found");
      stopScanning();

      // Brief success pause before closing
      setTimeout(() => {
        onFoodFound(food);
        onOpenChange(false);
        setIsFetching(false);
        setScanStatus("scanning");
      }, 600);
    } catch {
      toast.error("Could not fetch product info. Try again.");
      hasProcessedRef.current = false;
      clearResults();
      setIsFetching(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="nutrition.barcode_scanner.sheet"
        side="bottom"
        className="h-[85vh] bg-background border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display font-bold text-foreground flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-primary" />
              Scan Food Barcode
            </SheetTitle>
            <Button
              data-ocid="nutrition.barcode_scanner.close_button"
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground -mr-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Point the camera at the barcode on your food packaging
          </p>
        </SheetHeader>

        {/* Camera viewfinder */}
        <div className="flex-1 relative overflow-hidden bg-black mx-4 mb-4 rounded-xl">
          {/* Live camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Loading camera */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-white/70 font-body">
                Starting camera…
              </p>
            </div>
          )}

          {/* Camera error state */}
          {error && !isLoading && (
            <div
              data-ocid="nutrition.barcode_scanner.error_state"
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 p-6 text-center"
            >
              <ScanBarcode className="w-10 h-10 text-destructive/60" />
              <div>
                <p className="text-sm text-white font-body font-semibold">
                  {error.message}
                </p>
                {error.type === "permission" && (
                  <p className="text-xs text-white/50 font-body mt-1">
                    Allow camera access in your browser settings
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => retry()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Scan overlay frame */}
          {!error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Corner brackets */}
              <div className="relative w-56 h-36">
                {/* Top-left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary rounded-tl-sm" />
                {/* Top-right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary rounded-tr-sm" />
                {/* Bottom-left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary rounded-bl-sm" />
                {/* Bottom-right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary rounded-br-sm" />

                {/* Animated scan line */}
                <AnimatePresence>
                  {isScanning && !isFetching && (
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-primary/70 rounded-full"
                      initial={{ top: "10%" }}
                      animate={{ top: "90%" }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.8,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Fetching overlay */}
          <AnimatePresence>
            {isFetching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3"
              >
                {scanStatus === "found" ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
                    >
                      <ZoomIn className="w-6 h-6 text-primary" />
                    </motion.div>
                    <p className="text-sm text-white font-body font-semibold">
                      Product found!
                    </p>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-white/80 font-body">
                      Looking up product…
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom hint */}
          {!error && !isFetching && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-xs text-white/70 font-body">
                  {isScanning
                    ? "Align barcode within the frame"
                    : "Starting scanner…"}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
