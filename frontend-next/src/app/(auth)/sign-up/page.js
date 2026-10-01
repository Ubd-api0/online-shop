import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/google";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign Up" };

export default async function SignupPage({ searchParams }) {
  const next = safeNext((await searchParams).redirect);
  const user = await getCurrentUser();
  if (user) redirect(next || (user.role === "business_owner" ? "/dashboard" : "/"));

  return <SignupForm next={next} />;
}
