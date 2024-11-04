import { getSingleProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import React from "react";
import SprintCreationForm from "../components/create-sprint";

const SingleProject = async ({ params }) => {
  const { projectId } = params;
  const project = await getSingleProject(projectId);
  if (!project) {
    notFound();
  }
  return (
    <div className="container mx-auto">
      {/* Sprint Creation form  */}
      <SprintCreationForm
        projectTitle={project?.name}
        projectId={project?.id}
        projectKey={project?.key}
        sprintKey={project?.sprints.length + 1}
      />
      {/* Sprint Display Dashboard */}
      {project?.sprints.length > 0 ? (
        <>
          <p>Projects created</p>
        </>
      ) : (
        <>
          <div>Create a Sprint from above button</div>
        </>
      )}
    </div>
  );
};

export default SingleProject;
