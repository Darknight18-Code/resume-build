import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Profile() {
  const authResponse = await auth();  // Wait for the auth result
  const { userId } = authResponse;    // Destructure userId from the response

  // Redirect if user is not authenticated
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <h1 className="text-2xl">{user?.username || "User"}</h1>
      <UserProfile />
    </div>
  );
}
