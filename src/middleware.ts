import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protect employer routes
    if (pathname.startsWith("/employer") && token?.role !== "EMPLOYER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // Protect admin routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect talent portal: client user routes
    if (pathname.startsWith("/talent/client") && token?.role !== "CLIENT_USER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // Protect talent portal: candidate routes
    if (pathname.startsWith("/talent/candidate") && token?.role !== "CANDIDATE" && token?.role !== "JOB_SEEKER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // Protect talent portal: recruiter routes (everything under /talent not already matched above)
    if (pathname.startsWith("/talent") && !pathname.startsWith("/talent/client") && !pathname.startsWith("/talent/candidate")) {
      if (token?.role !== "RECRUITER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes — always allow
        if (
          pathname === "/" ||
          pathname.startsWith("/jobs") ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/contracting") ||
          pathname.startsWith("/recruitment") ||
          pathname.startsWith("/employers") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/jobs") ||
          pathname.startsWith("/api/contact") ||
          pathname.startsWith("/api/content") ||
          pathname.startsWith("/HR-Advisory") ||
          pathname.startsWith("/Payroll-Compliance") ||
          pathname.startsWith("/p/") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/images") ||
          pathname.startsWith("/icons") ||
          pathname.includes(".")
        ) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
