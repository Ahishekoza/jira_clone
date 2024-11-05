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

/**
 *
 * @param {String} sprintId
 * @param {String} updatedStatus
 */

export const updateSprintStatus = async (sprintId, newStatus) => {
  // --check user, organization and userRole:- only admins can start / complete sprints
  // --check if sprint is not getting started before the mentioned startDate
  // --check if sprint is  active  because only active sprints can be completed

  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { project: true },
    });

    if (!sprint) {
      throw new Error("Sprint not found");
    }

    if (sprint.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    if (orgRole !== "org:admin") {
      throw new Error("Only Admin can make this change");
    }

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      throw new Error("Cannot start sprint outside of its date range");
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      throw new Error("Can only complete an active sprint");
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status: newStatus },
    });

    return { success: true, sprint: updatedSprint };
  } catch (error) {
    throw new Error(error.message);
  }
};
