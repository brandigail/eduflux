import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      const { role, userId } = token as JWT;
      if (role && userId) {
        session.user.role = role;
        session.user.id = userId;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
