import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { apiLogs, projects, users, organizationMembers } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { format } from "date-fns";

export default async function ApiLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email!),
  });

  if (!dbUser) redirect("/login");

  const orgMembers = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, dbUser.id),
  });

  const activeProjects = await db.query.projects.findMany({
    where: inArray(projects.organizationId, orgMembers.map(om => om.organizationId)),
  });
  const projectIds = activeProjects.map(p => p.id);

  let logs: any[] = [];
  if (projectIds.length > 0) {
    logs = await db.query.apiLogs.findMany({
      where: inArray(apiLogs.projectId, projectIds),
      orderBy: [desc(apiLogs.createdAt)],
      limit: 50,
    });
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-100px)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">API Logs</h1>
        <p className="text-muted">Real-time Stripe-style logging of all ContextOS API requests.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-muted border-b border-white/10 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Endpoint</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No API logs found. Make a request using your API Key.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${log.statusCode >= 400 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {log.statusCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white/80">{log.method}</td>
                    <td className="px-6 py-4 font-mono text-xs text-white/80">{log.endpoint}</td>
                    <td className="px-6 py-4 text-muted">{format(new Date(log.createdAt), "MMM d, HH:mm:ss")}</td>
                    <td className="px-6 py-4 text-muted">{log.durationMs}ms</td>
                    <td className="px-6 py-4 text-right">
                       {/* Ideally this opens a slide-over pane. We use a simple detail button for MVP */}
                       <button className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity font-medium">View Payload</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
