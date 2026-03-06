import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function StripeSetup() {
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,CA,GB,AU");
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    Promise.all([actor.isCallerAdmin(), actor.isStripeConfigured()])
      .then(([admin, configured]) => {
        setIsAdmin(admin);
        setIsConfigured(configured);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsConfigured(false);
      });
  }, [actor, isFetching]);

  if (!isAdmin || isConfigured === null) return null;

  async function handleSave() {
    if (!actor) return;
    if (!secretKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    const allowedCountries = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    setIsSaving(true);
    try {
      await actor.setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      setIsConfigured(true);
      setIsExpanded(false);
      toast.success("Stripe configuration saved!");
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-4 mb-4 rounded-xl border border-border bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-body font-medium text-foreground">
            Stripe Setup {isConfigured ? "✓" : "(not configured)"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              Stripe Secret Key
            </Label>
            <Input
              type="password"
              placeholder="sk_live_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="font-mono text-sm"
              data-ocid="stripe.key_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              className="font-mono text-sm"
              data-ocid="stripe.countries_input"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="w-full bg-primary text-primary-foreground font-body"
            data-ocid="stripe.save_button"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Stripe Config"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
