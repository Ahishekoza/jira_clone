"use client";
import React, { useEffect, useState } from "react";
import SpringManager from "./sprint-manager";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import status from "@/data/status.json";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import CreateIssueDrawer from "./create-issue";
import { useFetch } from "@/hooks/use-fetch";
import { getIssuesForSprint } from "@/actions/issues";
import IssueCard from "./issue-card";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const SprintBoard = ({ sprints, projectId, orgId }) => {
  const [currentActiveSprint, setCurrentActiveSprint] = useState(
    sprints.find((sprint) => sprint.status === "ACTIVE" || sprints[0])
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const {
    loading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch(getIssuesForSprint);

  /**
   * Fetching the issues for the specified sprint
   */
  useEffect(() => {
    if (currentActiveSprint.id) {
      fetchIssues(currentActiveSprint.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveSprint.id]);

  /**
   *
   * @param {Object} result
   *
   * @flow:-
   * check if the status of the currentActiveSprint
   * "PLANNED" and "COMPLETED" sprints cannot be dragged and droped
   * fetch the destination and source from the result
   * check if issue cardu= is dragged and drop to the same destination as of source
   *
   */
  const onDragEnd = async (result) => {
    if (currentActiveSprint.status === "PLANNED") {
      toast.warning("Start the sprint to update board");
      return;
    }
    if (currentActiveSprint.status === "COMPLETED") {
      toast.warning("Cannot update board after sprint end");
      return;
    }

    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newOrderedData = [...issues];

    const sourceList = newOrderedData.filter(
      (list) => list.status === source.droppableId
    );

    const destinationList = newOrderedData.filter(
      (list) => list.status === destination.droppableId
    );

    // --- same colum but different rows ie reorder the column data
    if (source.droppableId === destination.droppableId) {
      const reorderedCards = reorder(
        sourceList,
        source.index,
        destination.index
      );
      reorderedCards.forEach((card, i) => {
        card.order = i;
      });
    } else {
      const [movedCard] = sourceList.splice(sourceList.index,1)

      movedCard.status = destination.droppableId

      destinationList.splice(destination.index,0,movedCard)

      sourceList.forEach((card, i) => {
        card.order = i;
      });

      // update the order for each card in destination list
      destinationList.forEach((card, i) => {
        card.order = i;
      });
    }
    const sortedOrderCard = newOrderedData.sort((a, b) => a.order - b.order);
    setIssues(sortedOrderCard);

    console.log(sortedOrderCard);
    console.log(source,destination);


    // --- api Call for order updation
  };

  const handleAddIssue = (status) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  };

  const handleIssueCreation = (data) => {};

  return (
    <div>
      {/* Spring Manager */}
      <SpringManager
        activeSprint={currentActiveSprint}
        setActiveSprint={setCurrentActiveSprint}
        sprints={sprints}
        projectId={projectId}
      />
      {issuesLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}

      {/* Kanban board to display  the sprints */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
          {status.map((column) => (
            <Droppable key={column.key} droppableId={column.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  <h3 className="font-semibold mb-2 text-center">
                    {column.name}
                  </h3>
                  {/* Issues */}
                  {issues
                    ?.filter((issue) => issue.status === column.key)
                    .map((issue, index) => {
                      return (
                        <Draggable
                          key={issue.id}
                          index={index}
                          draggableId={issue.id}
                        >
                          {(provided) => {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <IssueCard issue={issue} />
                              </div>
                            );
                          }}
                        </Draggable>
                      );
                    })}

                  {provided.placeholder}
                  {column.key === "TODO" &&
                    currentActiveSprint?.status !== "COMPLETED" && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => handleAddIssue(column.key)}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Issue
                      </Button>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* --Issue Creation Drawer */}
      <CreateIssueDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentActiveSprint?.id}
        projectId={projectId}
        orgId={orgId}
        status={selectedStatus}
        handleIssueCreation={handleIssueCreation}
      />
    </div>
  );
};

export default SprintBoard;
