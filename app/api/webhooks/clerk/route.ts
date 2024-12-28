import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import type { ClerkClient } from "@clerk/clerk-sdk-node";
import { createUser } from "@/actions/user.action";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const data = evt.data;
    const { id, email_addresses, image_url, first_name, last_name, username } = data;

    const user = {
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      username: username || "",
      photo: image_url || "",
      firstName: first_name || "",
      lastName: last_name || "",
    };

    console.log("Creating user:", user);

    try {
      const newUser = await createUser(user);

      if (newUser) {
        const client = clerkClient as unknown as ClerkClient; // Assert the correct type
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });

        console.log("User metadata updated in Clerk:", newUser._id);
        return NextResponse.json({ message: "New user created", user: newUser });
      }
    } catch (error) {
      console.error("Error creating user or updating metadata:", error);
      return new Response("Error processing user creation", { status: 500 });
    }
  }

  console.log(`Unhandled webhook event type: ${eventType}`);
  return new Response("Webhook event unhandled", { status: 200 });
}
