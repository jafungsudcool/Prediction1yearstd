import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],

  pages: {
    signIn: "/",   // URL ไม่ใช่ไฟล์
  },

  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile && account) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.email = (profile as any).email; 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.name = (profile as any).name;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        email: token.email as string,
        name: token.name as string,
      };
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";  // หลังล็อกอินให้เด้งไป dashboard
    },
  },
});
