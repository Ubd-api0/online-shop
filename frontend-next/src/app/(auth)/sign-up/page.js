import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Sign Up" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "business_owner" ? "/dashboard" : "/");

  return <SignupForm />;
}
