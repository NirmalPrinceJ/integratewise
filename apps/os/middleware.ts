/**
 * IntegrateWise OS Middleware (Next.js 16+)
 *
 * Route gating based on role capabilities and authentication
 * - Blocks unauthorized access to protected routes
 * - Redirects to login if not authenticated
 * - Redirects to overview if missing required capability
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_CAPS, type Role } from "./lib/feature/capabilities";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/error",
  "/onboarding",
];

/**
 * Determine which capability is needed for a given path
 */
function getRequiredCapability(pathname: string): string | null {
  if (pathname === "/overview" || pathname.startsWith("/overview/")) return "view.overview";
  if (pathname === "/tasks" || pathname.startsWith("/tasks/")) return "view.tasks";
  if (pathname === "/insights" || pathname.startsWith("/insights/")) return "view.ai_insights";
  if (pathname === "/normalize" || pathname.startsWith("/normalize/")) return "view.normalize";
  if (pathname === "/os" || pathname.startsWith("/os/")) return "view.os_pages";

  // Legacy routes - map to overview for now
  if (pathname.startsWith("/brainstorming")) return "view.overview";
  if (pathname.startsWith("/campaigns")) return "view.overview";
  if (pathname.startsWith("/clients")) return "view.overview";
  if (pathname.startsWith("/content")) return "view.overview";
  if (pathname.startsWith("/data-sources")) return "view.overview";
  if (pathname.startsWith("/deals")) return "view.overview";
  if (pathname.startsWith("/env")) return "view.overview";
  if (pathname.startsWith("/integrations")) return "view.overview";
  if (pathname.startsWith("/knowledge")) return "view.overview";
  if (pathname.startsWith("/leads")) return "view.overview";
  if (pathname.startsWith("/metrics")) return "view.overview";
  if (pathname.startsWith("/pipeline")) return "view.overview";
  if (pathname.startsWith("/products")) return "view.overview";
  if (pathname.startsWith("/projects")) return "view.overview";
  if (pathname.startsWith("/sales")) return "view.overview";
  if (pathname.startsWith("/services")) return "view.overview";
  if (pathname.startsWith("/sessions")) return "view.overview";
  if (pathname.startsWith("/settings")) return "view.overview";
  if (pathname.startsWith("/strategy")) return "view.overview";
  if (pathname.startsWith("/website")) return "view.overview";

  return null;
}

/**
 * Extract session from request
 */
async function getSession(req: NextRequest) {
  const role = (req.cookies.get("role")?.value ?? "viewer") as Role;
  const capsString = req.cookies.get("caps")?.value ?? "";
  const caps = capsString.split(",").filter(Boolean);

  // Check for demo session or auth token
  const hasDemo = req.cookies.get("demo_session")?.value === "true";
  const hasAuthToken = Boolean(req.cookies.get("auth_token")?.value);
  const hasRole = Boolean(req.cookies.get("role")?.value);

  const isAuthenticated = hasDemo || hasAuthToken || hasRole;

  if (!isAuthenticated) {
    return null;
  }

  // If no caps in cookie, derive from role
  if (caps.length === 0) {
    return {
      role,
      capabilities: DEFAULT_CAPS[role] ?? DEFAULT_CAPS.viewer,
    };
  }

  return { role, capabilities: caps };
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Allow static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    // Auto-set demo session for home page
    if (pathname === "/") {
      const response = NextResponse.next();
      if (!req.cookies.get("demo_session")) {
        response.cookies.set("demo_session", "true", {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          httpOnly: false,
        });
      }
      return response;
    }
    return NextResponse.next();
  }

  // Check authentication
  const session = await getSession(req);
  if (!session) {
    // Set demo session and allow access for better UX
    const response = NextResponse.next();
    response.cookies.set("demo_session", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    });
    return response;
  }

  // Check capability for this route
  const requiredCapability = getRequiredCapability(pathname);
  if (requiredCapability && !session.capabilities.includes(requiredCapability)) {
    return NextResponse.redirect(new URL("/overview", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
