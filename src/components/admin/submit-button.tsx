"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/**
 * Submit button for a plain <form action={serverAction}>: shows the shared
 * pending state while React is actually submitting that form.
 */
export function SubmitButton({
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" pending={pending} pendingLabel={pendingLabel} {...props} />;
}
