import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/google";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login" };

export default async function LoginPage({ searchParams }) {
  const { redirect: back, error } = await searchParams;
  const next = safeNext(back);
  const user = await getCurrentUser();
  if (user) redirect(next || (user.role === "business_owner" ? "/dashboard" : "/"));

  return <LoginForm next={next} error={error} />;
}
