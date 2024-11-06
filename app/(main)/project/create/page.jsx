"use client";

import { OrganizationSwitcher, useOrganization, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/app/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/use-fetch";
import { createProject } from "@/actions/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import OrgSwitcher from "@/components/org-switcher";

const CreateProject = () => {
  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const [admin, setAdmin] = useState(false);
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema)
  });

  useEffect(() => {
    if (isOrgLoaded && isUserLoaded) {
      setAdmin(membership?.role === "org:admin");
    }
  }, [isOrgLoaded, isUserLoaded, membership]);

  const {
    data: project,
    loading,
    error,
    fn: createProjectFn,
  } = useFetch(createProject);

  const onSubmit = async (data) => {
    console.log("create page console", data);
    if (!admin) {
      toast.error("Only Admin can create a project");
      return;
    }
    createProjectFn(data);
  };

  useEffect(() => {
    if (project) router.push(`/project/${project.id}`);
  }, [loading]);

  if (!isOrgLoaded || !isUserLoaded) {
    return null;
  }
  if (!admin) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-2xl gradient-title">
          Oops! Only Admins can create projects.
        </span>
        <OrgSwitcher />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-10 ">
      <h1 className="text-center gradient-title text-6xl mb-8">
        Create New Project
      </h1>
      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input
            id="name"
            className="bg-slate-950"
            placeholder="Project Name"
            {...register("name")}
          />
          {errors.name && (
            <p className=" text-red-300 text-sm mt-1">{errors?.name.message}</p>
          )}
        </div>
        <div>
          <Input
            id="key"
            className="bg-slate-950"
            placeholder="Project Key (Ex: RCYT)"
            {...register("key")}
          />
          {errors.key && (
            <p className=" text-red-300 text-sm mt-1">{errors?.key.message}</p>
          )}
        </div>
        <div>
          <Textarea
            id="description"
            {...register("description")}
            className="bg-slate-950 h-28"
            placeholder="Project Description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <Button
          disabled={loading}
          type="submit"
          className="bg-blue-500 text-white"
        >
          {loading ? "Creating..." : "Create Project"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error.message}</p>}
      </form>
    </div>
  );
};

export default CreateProject;
