"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const createProject = async (data) => {
  //   --- get the userId and organizationId
  //  if not found throw an error
  //  get the membershipList of organizations
  // and check for the user if he is the admin or not
  //  if user is not the admin throw an error
  // create the project
  const { userId, orgId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  // Check if user belongs to this organization
  const { data: membershipList } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userMembership = membershipList.find(
    (member) => member.publicUserData.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can create projects");
  }

  try {
    const project = await db?.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Error creating project: " + error.message);
  }
};

export const getProjects = async () => {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const loggedInUser = await db?.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!loggedInUser) {
    throw new Error("User not found");
  }

  const projects = await db?.project.findMany({
    where: {
      organizationId: orgId,
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
};

export const deleteProject = async (projectId) => {
  // --- check if userId , orgId is present or not
  // --- check the orgRole of the user because only admin has authority to delete project
  // --- get the project from the project Id
  // --- check if the project organization matched to the current organization
  // --- finally delete the project
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorize");
  }

  if (orgRole !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }

  const project = await db?.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have permission to delete it"
    );
  }

  await db?.project.delete({
    where: {
      id: projectId,
    },
  });

  return { success: true };
};

export const getSingleProject = async (projectId) => {
  // -- check if userId and orgId is present
  // -- find project with projectId and also include project related sprints
  // -- if project is not found return null
  // -- if project is found check the project organization is same as current organization
  // -- if yes then return project else return null

  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const loggedInUser = await db?.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!loggedInUser) {
    throw new Error("User not found");
  }

  const project = await db?.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    return null
  }

  // Verify project belongs to the organization
  if (project.organizationId !== orgId) {
    return null;
  }

  return project;
};
