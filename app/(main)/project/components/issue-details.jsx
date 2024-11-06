/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useEffect, useState } from "react";

import statuses from "@/data/status.json";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useFetch } from "@/hooks/use-fetch";
import { deleteIssue, updateIssue } from "@/actions/issues";
import UserAvatar from "./user-avatar";
import MDEditor from "@uiw/react-md-editor";
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const IssueDetails = ({
  isOpen,
  issue,
  onClose,
  onDelete,
  onUpdate,
  borderCol,
}) => {
  const [status, setStatus] = useState(issue?.status);
  const [priority, setPriority] = useState(issue?.priority);

  const { user } = useUser();
  const { membership } = useOrganization();

  const canChange =
    user?.id === issue.reporter.clerkUserId || membership.role === "org:admin";

  const {
    data: updatedIssue,
    fn: updateIssueFn,
    loading: updateIssueLoading,
    error: errorUpdatingIssue,
  } = useFetch(updateIssue);

  const {
    data: deletedIssue,
    loading: issueDeleteLoading,
    error: errorDeletingIssue,
    fn: deleteIssueFn,
  } = useFetch(deleteIssue);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);

    updateIssueFn(issue?.id, { status: newStatus, priority: priority });
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);

    updateIssueFn(issue?.id, { status: status, priority: newPriority });
  };

  const handleDelete = () => {
    window.alert("Are you sure you want to delete this issue?");
    deleteIssueFn(issue?.id)
  };

  useEffect(() => {

    if(deletedIssue){
      onClose()
      onDelete()
    }

    if (updatedIssue) {
      onUpdate(updatedIssue);
    }
  }, [updatedIssue,deletedIssue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">{issue.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={handlePriorityChange}
              disabled={!canChange}
            >
              <SelectTrigger className={`border ${borderCol} rounded`}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-semibold">Description</h4>
            <MDEditor.Markdown
              className="rounded px-2 py-1"
              source={issue.description ? issue.description : "--"}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Assignee</h4>
              <UserAvatar user={issue.assignee} />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Reporter</h4>
              <UserAvatar user={issue.reporter} />
            </div>
          </div>

          {canChange && (
            <Button
              onClick={handleDelete}
              disabled={issueDeleteLoading}
              variant="destructive"
            >
              {issueDeleteLoading ? "Deleting..." : "Delete Issue"}
            </Button>
          )}

          {(errorDeletingIssue || errorUpdatingIssue) && (
            <p className="text-red-500">
              {errorDeletingIssue?.message || errorUpdatingIssue?.message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetails;
