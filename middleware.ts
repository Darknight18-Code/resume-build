import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher(["/client"]);

export default clerkMiddleware(async (auth, req) => {
  // Ensure authentication for protected routes
  const authResponse = await auth();  // Await the auth response
  if (isProtectedRoute(req) && !authResponse.userId) {
    // If no userId found, block access and redirect
    return new Response("Unauthorized", { status: 401 });
  }
  return; // Proceed to the next handler if authenticated
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
