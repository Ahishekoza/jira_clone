"use client";

import { deleteProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/use-fetch";
import { useOrganization } from "@clerk/nextjs";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const DeleteProject = ({ projectId }) => {
  const { membership } = useOrganization();
  const router = useRouter();

  const {
    loading: isDeleting,
    error,
    fn: deleteProjectFn,
    data: deleted,
  } = useFetch(deleteProject);
  const isAdmin = membership?.role === "org:admin";

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectFn(projectId);
    }
  };

  useEffect(() => {
    if (deleted?.success) {
      toast.error("Project deleted successfully");
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleted?.success]);

  if (!isAdmin) return null;

  return (
    <>
      {" "}
      <Button
        variant="ghost"
        size="sm"
        className={`${isDeleting ? "animate-pulse" : ""}`}
        onClick={handleDeleteProject}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </>
  );
};

export default DeleteProject;
