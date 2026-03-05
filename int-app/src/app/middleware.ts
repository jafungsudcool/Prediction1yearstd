import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("Middleware checking path:", path);
 //   console.log("Token role in Middleware:", token?.role);
    console.log("Token role:", token?.role);

    // 1. ถ้า Login แล้วและอยู่ที่หน้า Root (/) หรือหน้า Login
    if (path === "/" || path === "/") {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/user", req.url));
    }

    // 2. ถ้าไม่ใช่ Admin แต่พยายามเข้า Dashboard
    if (path.startsWith("/dashboard") && token?.role !== "admin") {
      console.log("Denied access to dashboard, redirecting to /user");
      return NextResponse.redirect(new URL("/user", req.url));
    }

    // 3. ถ้าเป็น Admin แต่หลงมาหน้า User
    if (path.startsWith("/user") && token?.role === "admin") {
      console.log("Admin detected on /user, redirecting to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      // ตรวจสอบว่ามี Token หรือไม่
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/", // หรือหน้า login ของคุณ
    },
  }
);

export const config = {
  // มั่นใจว่า matcher ครอบคลุมทุกหน้าที่ต้องการดัก
  matcher: ["/", "/dashboard/:path*", "/user/:path*"],
};