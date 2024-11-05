"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const getOrganization = async (slug) => {
  // check if user is logged In
  // if not throw an error of Unauthorization
  // check if user is present in the DB
  // if not throw an error of USER NOT IN DB
  // now check if the organization is present
  // if yes then check the organization memberlist to find the organization logging person is present in the organization
  // if yes then return organization

  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the organization details
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  // Check if user belongs to this organization
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  // If user is not a member, return null
  if (!userMembership) {
    return null;
  }

  return organization;
};

export const getMembersListInTheOrganization = async () => {
  const { userId, orgId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { data: MemebersList } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const memberIds = MemebersList.map((member) => member.publicUserData.userId);

  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        in: memberIds,
      },
    },
  });

  return users;
};
