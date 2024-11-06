import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import UserAvatar from "./user-avatar";
import { formatDistanceToNow } from "date-fns";
import IssueDetails from "./issue-details";

import { useRouter } from "next/navigation";

const priorityColor = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

const IssueCard = ({ issue, onUpdate, onDelete }) => {
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIssueDelete = () => {
    router.refresh();
    onDelete();
  };

  const handleIssueUpdate = (updatedIssue) => {
    router.refresh();
    onUpdate(updatedIssue);
  };

  return (
    <>
      <div>
        <Card
          onClick={() => setIsDialogOpen(true)}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader
            className={`border-t-2 ${
              priorityColor[issue?.priority]
            } rounded-lg`}
          >
            <CardTitle>{issue?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={"outline"}>{issue?.priority}</Badge>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-3">
            <UserAvatar user={issue?.assignee} />
            <div className="text-xs text-gray-500 w-full">
              Created {created}
            </div>
          </CardFooter>
        </Card>
      </div>

      {isDialogOpen && (
        <IssueDetails
          isOpen={isDialogOpen}
          issue={issue}
          onClose={() => setIsDialogOpen(false)}
          onDelete={handleIssueDelete}
          onUpdate={handleIssueUpdate}
          borderCol={priorityColor[issue?.priority]}
        />
      )}
    </>
  );
};

export default IssueCard;
