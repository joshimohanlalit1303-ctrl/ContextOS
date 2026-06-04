"use server";

import { db } from "@/lib/db";
import { sdkWaitlist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { redirect } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function joinWaitlist(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase();
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const useCase = formData.get("useCase") as string;

  if (!email) {
    return { error: "Email is required to join the waitlist." };
  }

  const existing = await db.query.sdkWaitlist.findFirst({
    where: eq(sdkWaitlist.email, email)
  });

  if (existing) {
    if (existing.grantedAccess) {
      redirect("/login");
    }
    return { success: true };
  }

  try {
    await db.insert(sdkWaitlist).values({
      email,
      name: name || "Anonymous Developer",
      company: company || null,
      useCase: useCase || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error joining waitlist:", error);
    // Handle unique constraint or other db errors gracefully
    return { error: "Failed to join waitlist. You might already be on it!" };
  }
}

export async function getWaitlist() {
  try {
    const list = await db.select().from(sdkWaitlist).orderBy(sdkWaitlist.createdAt);
    return { success: true, data: list };
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return { error: "Failed to fetch waitlist" };
  }
}

export async function grantWaitlistAccess(id: string) {
  try {
    const [entry] = await db.update(sdkWaitlist)
      .set({ grantedAccess: true, grantedAt: new Date() })
      .where(eq(sdkWaitlist.id, id))
      .returning();
      
    if (entry && process.env.RESEND_API_KEY) {
      const res = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: entry.email,
        subject: 'You are off the waitlist! 🎉',
        html: `
          <h2>Welcome to Libro!</h2>
          <p>Hi ${entry.name},</p>
          <p>We've officially granted you access to the Libro developer preview.</p>
          <p>You can now log into your dashboard and generate your API keys.</p>
          <br />
          <a href="http://localhost:3000/login" style="padding: 10px 20px; background-color: black; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        `
      });
      console.log("Resend API Response:", res);
    } else {
      console.log(`[Mock Email] Invite sent to ${entry?.email}! (No RESEND_API_KEY found)`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error granting access:", error);
    return { error: "Failed to grant access" };
  }
}
