import { useState } from "react";
import { guestPersonalizationKey } from "@/lib/invitations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldClass, selectFieldClass } from "@/components/ui/field-styles";

const GROUPS = [
  "VIP",
  "Family Zone",
  "Colleagues",
  "Bride's Friends",
  "Groom's Family",
  "General",
] as const;

export type NewGuestInput = {
  name: string;
  email: string | null;
  personalizationKey: string;
  group: string;
  note: string;
};

interface GuestsAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: NewGuestInput) => Promise<void>;
}

export function GuestsAddDialog({ open, onOpenChange, onSave }: GuestsAddDialogProps) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<string>("General");
  const [plusOnes, setPlusOnes] = useState("0");
  const [table, setTable] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setGroup("General");
    setPlusOnes("0");
    setTable("");
    setPhone("");
    setError(null);
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Guest name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const noteParts = [
        Number(plusOnes) > 0 ? `+${plusOnes} guest` : null,
        table.trim() || null,
        phone.trim() || null,
      ].filter(Boolean);

      await onSave({
        name: trimmed,
        email: phone.trim() || null,
        personalizationKey: guestPersonalizationKey(trimmed),
        group,
        note: noteParts.length > 0 ? noteParts.join(" · ") : "Personalized link ready",
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save guest.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md gap-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">Add New Guest</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <Label className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Guest Full Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raditya Wicaksono"
              className={fieldClass}
            />
          </div>
          <div>
            <Label className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Circle / Category
            </Label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className={selectFieldClass}
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Plus-Ones
              </Label>
              <Input
                type="number"
                min={0}
                max={5}
                value={plusOnes}
                onChange={(e) => setPlusOnes(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <Label className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Table # (Optional)
              </Label>
              <Input
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="e.g. Table 04"
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              WhatsApp / Phone
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 812..."
              className={fieldClass}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save Attendee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
