"use client";

/*
 * Offer to save (or update) the admin's password in the browser's password
 * manager after the server has accepted it: Chrome / Edge show "Save
 * password?" (Google Password Manager), Android offers to save to Google.
 * Safari and Firefox don't support this request; they still offer to save
 * from the form itself (username / current-password / new-password fields).
 * Never blocks signing in: anything unsupported or slow is skipped.
 */

type PasswordCredentialInit = { id: string; password: string; name?: string };
type PasswordCredentialCtor = new (init: PasswordCredentialInit) => Credential;

/** Holds the email and password just sent, until the server answers (one per form, via useState). */
export function createSentCredentials() {
  let email = "";
  let password = "";
  return {
    set: (e: string, p: string) => {
      email = e;
      password = p;
    },
    /** Offer to save them, then forget the password. */
    offer: async (fallbackEmail = "") => {
      await offerToSavePassword(email || fallbackEmail, password);
      password = "";
    },
  };
}

export async function offerToSavePassword(email: string, password: string) {
  const Ctor = (window as unknown as { PasswordCredential?: PasswordCredentialCtor }).PasswordCredential;
  if (!Ctor || !navigator.credentials?.store || !email || !password) return;
  try {
    await Promise.race([
      navigator.credentials.store(new Ctor({ id: email, password, name: email })),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch {
    // Declined, blocked, or not allowed here (e.g. not https): carry on.
  }
}
