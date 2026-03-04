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
          "655021000659@mail.rmutk.ac.th", 
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
  async jwt({ token, user, account }) {
    // ถ้าเป็นการ Login ครั้งแรก
    if (user) {
      const adminEmails = [
        "655021000014@mail.rmutk.ac.th", 
       // "655021000659@mail.rmutk.ac.th"
      ];
      // ตรวจสอบทั้งกรณี Credentials และ Google
      token.role = adminEmails.includes(user.email ?? "") ? "admin" : "user";
    }
    return token;
  },
  async session({ session, token }) {
    console.log("Token in session callback:", token); // เช็คว่าใน token มี role ไหม
    if (session.user) {
      session.user.role = token.role;
    }
    return session;
  },

    async redirect({ url, baseUrl }) {
      // ถ้า url คือหน้าแรก ให้ส่งไปที่หน้าหลักของ user/admin
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/user`; 
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", 
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };