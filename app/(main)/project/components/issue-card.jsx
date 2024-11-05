import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import UserAvatar from "./user-avatar";
import { formatDistanceToNow } from "date-fns";

const priorityColor = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};


const IssueCard = ({ issue }) => {
  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <div>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className={`border-t-2 ${priorityColor[issue?.priority]} rounded-lg`}>
          <CardTitle>{issue?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={"outline"}>{issue?.priority}</Badge>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-3">
          <UserAvatar user={issue?.assignee} />
          <div className="text-xs text-gray-500 w-full">Created {created}</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IssueCard;
