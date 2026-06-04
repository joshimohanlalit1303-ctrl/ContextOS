import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, organizations, organizationMembers, projects, sdkWaitlist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#f5f5f7] flex text-black font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white/50 backdrop-blur-xl p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-10 group">
            <span className="font-bold text-xl text-black tracking-tighter">Libro</span>
          </Link>

          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-black transition-colors font-medium">
              Overview
            </Link>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</div>
            <Link href="/dashboard/api-keys" className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-black transition-colors font-medium">
              API Keys
            </Link>
          </nav>
        </div>

        <form action="/login" method="POST">
          <button formAction={async () => {
             "use server";
             const supabase = await createClient();
             await supabase.auth.signOut();
             redirect("/login");
          }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors font-medium">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative">
         <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold border border-accent/20">
                {dbUser.name?.charAt(0).toUpperCase()}
             </div>
             <span className="text-sm font-medium text-gray-700">{dbUser.email}</span>
         </div>
         <div className="max-w-5xl mx-auto pt-8">
            {children}
         </div>
      </main>
    </div>
  );
}
