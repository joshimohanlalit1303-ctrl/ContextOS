import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login?message=You must be logged in to view the admin dashboard");
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  
  if (!adminEmails.includes(user.email)) {
    redirect("/");
  }

  return <>{children}</>;
}
