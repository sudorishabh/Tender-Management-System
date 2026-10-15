import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { randomBytes } from "crypto";
import { hashPassword } from "@/lib/server/utils";
import { db } from "@/server/db";
import { usersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getClientIp, isRateLimited } from "@/lib/server/rateLimit";
import { SIGN_IN_RATE_LIMITED_ERROR } from "@/lib/auth/types";

const SIGN_IN_ATTEMPTS = { perEmail: 10, perIp: 50 };
const SIGN_IN_WINDOW_MS = 15 * 60 * 1000;

// Hash of a random password that nobody knows, checked for unknown emails
const dummyPasswordHash = hashPassword(randomBytes(16).toString("hex"));

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // store token in cookie (JWT) — cookie + JWT style
    // The cookie is renewed while the app is in use, so this works as an idle
    // timeout instead of NextAuth's default of 30 days
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const { email, password } = credentials;

        // Slow down password guessing against one account or from one address
        const ip = getClientIp(new Headers(req?.headers));
        if (
          isRateLimited(
            `sign-in:email:${email.toLowerCase()}`,
            SIGN_IN_ATTEMPTS.perEmail,
            SIGN_IN_WINDOW_MS
          ) ||
          isRateLimited(`sign-in:ip:${ip}`, SIGN_IN_ATTEMPTS.perIp, SIGN_IN_WINDOW_MS)
        ) {
          throw new Error(SIGN_IN_RATE_LIMITED_ERROR);
        }

        const userRow = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);
        const user = userRow[0];
        if (!user) {
          // Spend the same bcrypt time as a wrong password, so response times
          // don't reveal which emails have accounts
          await compare(password, await dummyPasswordHash);
          return null;
        }

        const valid = await compare(password, user.password);
        if (!valid) return null;

        // NextAuth requires an object with at least an id or name/email
        return {
          id: String(user.user_id),
          email: user.email,
          name: user.full_name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // on initial signin, `user` is defined
      if (user) {
        token.role =
          (user as { role?: "vendor" | "admin" | "super_admin" }).role ??
          token.role;
        token.name = user.name ?? token.name;
        return token;
      }

      // Re-read the account on every session check, so a deleted user loses
      // access and a role change applies straight away instead of lasting as
      // long as the cookie. Throwing makes NextAuth clear the session.
      const [account] = await db
        .select({ role: usersTable.role, full_name: usersTable.full_name })
        .from(usersTable)
        .where(eq(usersTable.user_id, Number(token.sub)))
        .limit(1);

      if (!account) {
        throw new Error("Session user no longer exists");
      }

      token.role = account.role;
      token.name = account.full_name;
      return token;
    },
    async session({ session, token }) {
      // attach role and name to session object available on client/server
      (session.user as { id?: string; role?: unknown; name?: string | null }) =
        {
          ...session.user,
          id: token.sub,
          role: token.role,
          name: token.name as string | null,
        };
      return session;
    },
  },
  cookies: {
    // You can configure cookie name / options here
    sessionToken: {
      name: process.env.NEXTAUTH_COOKIE_NAME || "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
