import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      const email = data.user.email;
      const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';

      if (email) {
        // UPSERT the user in our local Postgres database
        let existingUser = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (!existingUser) {
          const insertedUsers = await db.insert(users).values({
            email,
            name,
          }).returning();
          
          existingUser = insertedUsers[0];

          // Create default organization
          const [newOrg] = await db.insert(organizationMembers.schema ? db._.schema.organizations : require('@/lib/db/schema').organizations).values({
            name: `${name || email.split('@')[0]}'s Workspace`,
            slug: `workspace-${Date.now()}`
          }).returning();

          // Link user to org
          await db.insert(require('@/lib/db/schema').organizationMembers).values({
            organizationId: newOrg.id,
            userId: existingUser.id,
            role: 'owner'
          });

          // Create default project
          await db.insert(require('@/lib/db/schema').projects).values({
            organizationId: newOrg.id,
            name: 'Default Project'
          });
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalhost = process.env.NODE_ENV === 'development';
      
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
