"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 *
 * @param {String} projectId
 * @param {Issue Object} data
 */
export async function createIssue(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.findUnique({
    where: {
      id: data.sprintId,
    },
  });

  if (sprint?.status === "PLANNED") {
    throw new Error("Only Active Sprints can create issues");
  }

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });

  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null, // Add this line
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

export const getIssuesForSprint = async (sprintId) => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issues = await db.issue.findMany({
    where: { sprintId: sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
};

export const updateIssuesOrder = async (updatedIssues) => {
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  await db.$transaction(async (prisma) => {
    // Update Single Issue
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue?.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      });
    }
  });

  return { success: true };
};

export const deleteIssue = async (issueId) => {
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issue = await db.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      reporter: true,
    },
  });

  if (issue?.reporter.clerkUserId !== userId) {
    throw new Error("You don't have permission to delete this issue");
  }

  await db.issue.delete({
    where: {
      id: issueId,
    },
  });

  return { success: true };
};

export const updateIssue = async (issueId, data) => {
  const { userId, orgId } = auth();
  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const issue = await db.issue.findUnique({
      where: {
        id: issueId,
      },
      include: {
        project: true,
      },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    const updatedIssue = await db?.issue.update({
      where: {
        id: issueId,
      },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error) {
    throw new Error("Error updating issue: " + error.message);
  }
};
