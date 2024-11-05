/* eslint-disable react-hooks/exhaustive-deps */
import { updateSprintStatus } from "@/actions/sprints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetch } from "@/hooks/use-fetch";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const SpringManager = ({
  activeSprint,
  setActiveSprint,
  sprints,
  projectId,
}) => {
  const [sprintStatus, setSprintStatus] = useState(activeSprint?.status);

  const router = useRouter();
  const {
    data: updatedSprintStatus,
    fn: updateSprintStatusFn,
    loading,
  } = useFetch(updateSprintStatus);
  const startDate = activeSprint?.startDate;
  const endDate = activeSprint?.endDate;
  const now = new Date();

  //   -- when can pe sprint started
  const canStart =
    isBefore(now, endDate) &&
    isAfter(now, startDate) &&
    activeSprint?.status === "PLANNED";

  const canEnd = activeSprint?.status === "ACTIVE";

  const handleSprintStatusChange = async (newStatus) => {
    updateSprintStatusFn(activeSprint?.id, newStatus);
  };

  useEffect(() => {
    if (updatedSprintStatus?.success) {
      setActiveSprint(updatedSprintStatus?.sprint);
      router.refresh();
    }
  }, [updatedSprintStatus?.success]);

  const handleSprintChange = (value) => {
    const selectedSprint = sprints.find((s) => s?.id === value);
    setActiveSprint(selectedSprint);
    setSprintStatus(selectedSprint?.status);
  };

  const getSprintStatus = () => {
    if (activeSprint?.status === "COMPLETED") {
      return "Sprint Ended";
    }
    // -- no of days after sprint started
    if (activeSprint?.status === "ACTIVE" && isAfter(now, endDate)) {
      return `Overdue by ${formatDistanceToNow(endDate)}`;
    }
    // -- no of days remaining to start a sprint
    if (activeSprint?.status === "PLANNED" && isBefore(now, startDate)) {
      return `Starts by ${formatDistanceToNow(startDate)}`;
    }

    return null;
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <Select value={activeSprint?.id} onValueChange={handleSprintChange}>
          <SelectTrigger className="w-full bg-slate-950">
            <SelectValue placeholder="Select a Sprint" />
          </SelectTrigger>
          <SelectContent>
            {sprints.map((sprint) => {
              return (
                <SelectItem key={sprint?.id} value={sprint?.id}>
                  {sprint?.name} ({format(sprint?.startDate, "MMM d,yyyy")}) to
                  ({format(sprint?.endDate, "MMM d,yyyy")})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {canStart && (
          <Button
            onClick={() => handleSprintStatusChange("ACTIVE")}
            className="bg-green-900 text-white hover:text-black"
          >
            Start Sprint
          </Button>
        )}
        {canEnd && (
          <Button
            onClick={() => handleSprintStatusChange("COMPLETED")}
            variant="destructive"
          >
            End Sprint
          </Button>
        )}
      </div>
      {loading && <BarLoader width={"100%"} className="mt-2" color="#36d7b7" />}
      {getSprintStatus() && <Badge className="mt-3">{getSprintStatus()}</Badge>}
    </>
  );
};

export default SpringManager;
