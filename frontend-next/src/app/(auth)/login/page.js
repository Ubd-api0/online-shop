import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "business_owner" ? "/dashboard" : "/");

  return <LoginForm />;
}
