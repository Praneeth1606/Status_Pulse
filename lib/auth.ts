"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

export async function checkOrganizationAccess() {
  const { orgId, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!orgId) {
    redirect("/create-organization");
  }

  // Verify user belongs to the organization
  const user = await prisma.user.findFirst({
    where: {
      clerkId: userId,
      orgId: orgId,
    },
  });

  if (!user) {
    redirect("/create-organization");
  }

  return { orgId, userId };
}

export async function validateOrganizationAccess(orgId: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findFirst({
    where: {
      clerkId: userId,
      orgId: orgId,
    },
  });

  if (!user) {
    redirect("/");
  }

  return true;
}

export async function getOrganizationAccess() {
  const { orgId, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!orgId) {
    redirect("/create-organization");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: {
        where: { clerkId: userId },
      },
    },
  });

  if (!organization || organization.users.length === 0) {
    redirect("/create-organization");
  }

  return { organization, userId };
}

export async function requireOrganizationAccess() {
  const { organization } = await getOrganizationAccess();
  return organization;
}
