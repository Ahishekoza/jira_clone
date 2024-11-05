/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { getMembersListInTheOrganization } from "@/actions/organizations";
import { issueSchema } from "@/app/lib/validators";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetch } from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { BarLoader } from "react-spinners";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { createIssue } from "@/actions/issues";
import { toast } from "sonner";

const CreateIssueDrawer = ({
  isOpen,
  onClose,
  sprintId,
  projectId,
  orgId,
  handleIssueCreation,
  status,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
    },
  });

  const {
    data: issue,
    error,
    loading: createIssueLoading,
    fn: createIssueFn,
  } = useFetch(createIssue);

  const {
    data: users,
    loading: userLoading,
    fn: getMembersListInTheOrganizationFn,
  } = useFetch(getMembersListInTheOrganization);

  const onSubmit = async (data) => {
    await createIssueFn(projectId, {
      ...data,
      sprintId: sprintId,
      status: status,
    });
  };
  useEffect(() => {
    if (issue) {
      reset(), onClose();
      toast.success("Successfully created Issue");
    }
  }, [issue]);
  useEffect(() => {
    if (isOpen) {
      getMembersListInTheOrganizationFn();
    }
  }, [isOpen]);

  return (
    <div>
      <Drawer open={isOpen} onClose={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          {userLoading && <BarLoader width={"100%"} color="#36d7b7" />}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium mb-1"
              >
                Assignee
              </label>
              <Controller
                control={control}
                name="assigneeId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user?.id} value={user?.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigneeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <MDEditor value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="prority"
                className="block text-sm font-medium mb-1"
              >
                Prority
              </label>
              <Controller
                control={control}
                name="prority"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Prority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.prority.message}
                </p>
              )}
            </div>
            {error && <p className="text-red-500 mt-2">{error.message}</p>}
            <Button
              type="submit"
              disabled={createIssueLoading}
              className="w-full"
            >
              {createIssueLoading ? "Creating..." : "Create Issue"}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CreateIssueDrawer;
