import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  // Await the auth response to get the authenticated user's info
  const authResponse = await auth(); // Make sure to await the result
  const { userId } = authResponse;   // Extract userId after awaiting

  // Fetch current user details
  const user = await currentUser();

  // If no userId, return an unauthorized response
  if (!userId) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  // If authenticated, return user details
  return NextResponse.json(
    {
      message: "Authenticated",
      data: { userId: userId, username: user?.username },
    },
    { status: 200 }
  );
}
