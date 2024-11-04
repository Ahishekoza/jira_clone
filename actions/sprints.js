"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 *
 * @param {string} projectId
 * @param {object} data
 *
 * @return {object} createdSprint
 */

export const createSprint = async (projectId, data) => {
  // -- flow -- check user & orgId  -- get the project from the server -- cross check the organization
  // -- create a new sprint

  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const project = await db?.project.findUnique({
    where: {
      id: projectId,
    },
  });


  if (!project || project.organizationId !== orgId) {
    return null;
  }

  try {
    const newSprint = await db?.sprint.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "PLANNED",
        projectId: projectId,
      },
    });

    return newSprint;
  } catch (error) {
    throw new Error("Error creating sprint: " + error.message);
  }
};
