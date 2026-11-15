"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/schemas";

export interface LoginState {
  error: string | null;
}

/** Only same-site paths are allowed as a return address, so the login page can't be used to redirect elsewhere. */
function safeNext(value: FormDataEntryValue | null): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and your password." };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: safeNext(formData.get("next")) });
  } catch (error) {
    if (error instanceof AuthError) return { error: "That email and password don't match." };
    throw error; // the redirect itself is thrown by signIn and must propagate
  }
  return { error: null };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
