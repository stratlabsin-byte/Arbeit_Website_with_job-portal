import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Admin routes only ADMIN can access (RECRUITER is blocked)
const adminOnlyPaths = [
  "/admin/content",
  "/admin/jobs",
  "/admin/users",
  "/admin/companies",
  "/admin/inquiries",
  "/admin/analytics",
  "/admin/settings",
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // ── Legacy /talent/* redirects ──
    // Client portal: /talent/client -> /portal/client
    if (pathname === "/talent/client" || pathname.startsWith("/talent/client/")) {
      const newPath = pathname.replace("/talent/client", "/portal/client");
      return NextResponse.redirect(new URL(newPath, req.url));
    }
    // Candidate portal: /talent/candidate -> /portal/candidate
    if (pathname === "/talent/candidate" || pathname.startsWith("/talent/candidate/")) {
      const newPath = pathname.replace("/talent/candidate", "/portal/candidate");
      return NextResponse.redirect(new URL(newPath, req.url));
    }
    // Recruiter pages: /talent/* -> /admin/*
    if (pathname.startsWith("/talent")) {
      const newPath = pathname.replace("/talent", "/admin");
      return NextResponse.redirect(new URL(newPath, req.url));
    }

    // ── Protect employer routes ──
    if (pathname.startsWith("/employer") && token?.role !== "EMPLOYER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }

    // ── Protect /admin routes ──
    if (pathname.startsWith("/admin")) {
      // Check if it's an admin-only path
      const isAdminOnly = adminOnlyPaths.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );

      if (isAdminOnly) {
        // Only ADMIN allowed
        if (token?.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
        }
      } else {
        // ADMIN and RECRUITER allowed
        if (token?.role !== "ADMIN" && token?.role !== "RECRUITER") {
          return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
        }
      }
    }

    // ── Protect /portal/client routes ──
    if (pathname.startsWith("/portal/client")) {
      if (token?.role !== "CLIENT_USER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
      }
    }

    // ── Protect /portal/candidate routes ──
    if (pathname.startsWith("/portal/candidate")) {
      if (
        token?.role !== "CANDIDATE" &&
        token?.role !== "JOB_SEEKER" &&
        token?.role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
      }
    }

    // ── Protect dashboard routes ──
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons|uploads|.*\\..*).*)"],
};
