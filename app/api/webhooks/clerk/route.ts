import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { createUser } from "@/actions/user.action";
import { NextResponse } from "next/server";
import { ClerkClient } from "@clerk/clerk-sdk-node";

interface UserCreatedData {
  id: string;
  email_addresses: { email_address: string }[];
  image_url: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET to .env.local");
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

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Verification error", { status: 400 });
  }

  const { id, email_addresses, image_url, first_name, last_name, username } =
    evt.data as UserCreatedData;

  if (evt.type === "user.created") {
    const user = {
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      username: username || "",
      photo: image_url || "",
      firstName: first_name || "",
      lastName: last_name || "",
    };

    try {
      const newUser = await createUser(user);
      if (newUser) {
        const client = clerkClient as unknown as ClerkClient;
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
        return NextResponse.json({ message: "New user created", user: newUser });
      }
    } catch (error) {
      console.error("Error creating user or updating metadata:", error);
      return new Response("Error processing user creation", { status: 500 });
    }
  }

  console.log(`Unhandled event type: ${evt.type}`);
  return new Response("Webhook event unhandled", { status: 200 });
}
