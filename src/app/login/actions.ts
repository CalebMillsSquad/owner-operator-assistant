"use server";

import { redirect } from "next/navigation";

import { signInOperator, signOutOperator } from "@/lib/auth";

export async function loginOperatorAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const email = String(formData.get("email") ?? "");
  const next = String(formData.get("next") ?? "/audit-log");
  const result = await signInOperator(email, password);

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.message ?? "Invalid operator password.")}&next=${encodeURIComponent(next)}`);
  }

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/audit-log");
}

export async function logoutOperatorAction() {
  await signOutOperator();
  redirect("/login");
}
