import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// --- Module Augmentation ---
declare module "next-auth" {
  interface Session {
    user: {
      role?: string; // บังคับให้มีใน Session เสมอ
    } & DefaultSession["user"];
  }

  interface User {
    role?: string; // บังคับให้มีใน User object
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string; // บังคับให้มีใน Token
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const userEmail = credentials.email.toLowerCase().trim();
        const adminEmails = [
          "655021000014@mail.rmutk.ac.th", 
        ].map(email => email.toLowerCase().trim());

        const role = adminEmails.includes(userEmail) ? "admin" : "user";
        return {
          id: "u-" + Date.now(),
          email: credentials.email,
          role: role,
        };
      },
    }),
  ],

callbacks: {
  async jwt({ token, user }) {
    if (user) {
      const adminEmails = ["655021000014@mail.rmutk.ac.th"];
      token.role = adminEmails.includes(user.email ?? "") ? "admin" : "user";
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.role = token.role;
    }
    return session;
  },

async redirect({ url, baseUrl }) {
  // ไม่ต้องระบุหน้า /dashboard หรือ /user ที่นี่
  // ให้ส่งกลับไปที่หน้าแรก (Root) เพื่อให้ Middleware ทำงาน
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  else if (new URL(url).origin === baseUrl) return url;
  
  return baseUrl; 
},
},

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", 
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };