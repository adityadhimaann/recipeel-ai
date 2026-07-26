import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: false,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://recipeel-ai.vercel.app",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Auto-verify email in database to eliminate email confirmation prompt
            await db
              .update(schema.user)
              .set({ emailVerified: true })
              .where(eq(schema.user.id, user.id));

            // Auto-create profile with onboarded: false
            await db
              .insert(schema.profiles)
              .values({
                id: user.id,
                email: user.email,
                name: user.name || user.email.split("@")[0],
                onboarded: false,
              })
              .onConflictDoNothing();
          } catch (e) {
            console.error("Failed to auto-create profile or verify email for user:", e);
          }
        },
      },
    },
  },
});
