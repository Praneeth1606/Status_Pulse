import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    if (eventType === "organizationInvitation.created") {
      const { id, organization_id, email_address } = evt.data;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          clerkId: id,
        },
      });

      if (existingUser) {
        // Update existing user's organization
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            orgId: organization_id,
          },
        });
      } else {
        // Create new user with actual data from the invitation
        await prisma.user.create({
          data: {
            clerkId: id,
            email: email_address,
            firstName: "", // These will be updated when the user completes their profile
            lastName: "",
            orgId: organization_id,
          },
        });
      }
    }
    if (eventType === "organization.created") {
      const { id, name, slug } = evt.data;

      await prisma.organization.create({
        data: {
          id,
          name,
          slug,
        },
      });
    }

    if (eventType === "organization.updated") {
      const { id, name, slug } = evt.data;

      await prisma.organization.update({
        where: { id },
        data: {
          name,
          slug,
        },
      });
    }

    if (eventType === "organization.deleted") {
      const { id } = evt.data;

      // Delete all related data in a transaction
      await prisma.$transaction([
        prisma.incident.deleteMany({ where: { orgId: id } }),
        prisma.maintenance.deleteMany({ where: { orgId: id } }),
        prisma.service.deleteMany({ where: { orgId: id } }),
        prisma.user.deleteMany({ where: { orgId: id } }),
        prisma.organization.delete({ where: { id } }),
      ]);
    }

    if (eventType === "organizationMembership.created") {
      const { organization, public_user_data } = evt.data;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          clerkId: public_user_data.user_id,
        },
      });

      if (existingUser) {
        // Update existing user's organization
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            orgId: organization.id,
          },
        });
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            clerkId: public_user_data.user_id,
            email: `${public_user_data.user_id}@placeholder.com`, // Temporary email until user updates it
            firstName: public_user_data.first_name || "",
            lastName: public_user_data.last_name || "",
            orgId: organization.id,
          },
        });
      }
    }

    if (eventType === "organizationMembership.deleted") {
      const { organization, public_user_data } = evt.data;

      await prisma.user.deleteMany({
        where: {
          clerkId: public_user_data.user_id,
          orgId: organization.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
