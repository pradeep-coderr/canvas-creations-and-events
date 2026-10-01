"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { alertSoundEnabled, playChime, setAlertSoundEnabled } from "@/lib/admin/alert-sound";

const noSubscribe = () => () => {};

/**
 * Settings → Push notifications → Alert sound (this device). The chime plays
 * for new alerts while the admin is open on screen; closed or in the
 * background, the device's own notification sound is used instead.
 */
export function AlertSoundSetting() {
  const id = useId();
  // The saved choice (this browser), on by default; the server renders "on".
  const saved = useSyncExternalStore(noSubscribe, alertSoundEnabled, () => true);
  const [choice, setOn] = useState<boolean | null>(null);
  const on = choice ?? saved;
  const [note, setNote] = useState<string | null>(null);

  return (
    <fieldset className="mt-8 grid gap-3 border-t border-border pt-6">
      <legend className="sr-only">Alert sound</legend>
      <p className="text-sm font-semibold">Alert sound (this device)</p>
      <div className="flex items-center gap-3">
        <Checkbox
          id={`${id}-sound`}
          checked={on}
          onCheckedChange={(v) => {
            const next = v === true;
            setOn(next);
            setAlertSoundEnabled(next);
            setNote(next ? "Sound on." : "Sound off: alerts while the admin is open will be silent.");
          }}
        />
        <Label htmlFor={`${id}-sound`}>Play a chime for new alerts while the admin is open</Label>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void playChime();
            setNote("If you didn't hear it, check this device's volume and that this tab isn't muted.");
          }}
        >
          <Volume2 data-icon="inline-start" aria-hidden="true" />
          Play test sound
        </Button>
      </div>
      <p className="max-w-prose text-sm text-muted-foreground">
        When the admin is closed or in the background, notifications use this phone&apos;s or computer&apos;s own
        notification sound (set in the device&apos;s settings).
      </p>
      <p role="status" className="text-sm text-muted-foreground empty:hidden">
        {note ?? ""}
      </p>
    </fieldset>
  );
}
