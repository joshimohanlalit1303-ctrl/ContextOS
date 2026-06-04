import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizations, organizationMembers, projects, sdkWaitlist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const waitlistEntry = await db.query.sdkWaitlist.findFirst({
    where: eq(sdkWaitlist.email, user.email!),
  });

  if (!waitlistEntry || !waitlistEntry.grantedAccess) {
    redirect("/pending");
  }

  // Sync user to Drizzle database and provision default Org & Project if they don't exist
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email!),
  });

  if (!dbUser) {
    // 1. Create User
    const [newUser] = await db.insert(users).values({
      email: user.email!,
      name: user.user_metadata?.full_name || "Developer",
    }).returning();
    dbUser = newUser;

    // 2. Create Organization
    const [newOrg] = await db.insert(organizations).values({
      name: `${dbUser.name}'s Org`,
      slug: `org-${Date.now()}`,
    }).returning();

    // 3. Add User to Organization
    await db.insert(organizationMembers).values({
      organizationId: newOrg.id,
      userId: dbUser.id,
      role: "owner",
    });

    // 4. Create default Project
    await db.insert(projects).values({
      organizationId: newOrg.id,
      name: "Production",
    });
  }

  return (
    <>
      {children}
    </>
  );
}
