import { useState } from "react";
import { Button } from "@mui/material";
import DeleteSprintModal from "./DeleteSprintModal";

export default function SprintItem({ sprint }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border border-gray-300 rounded-lg p-3 flex justify-between items-center">
        <div className="font-medium">{sprint.name}</div>

        <div className="text-sm text-gray-500">Tasks: {sprint.tasks}</div>

        <Button
          variant="outlined"
          color="error"
          size="small"
          className="ml-3"
          onClick={() => setOpen(true)}
        >
          Delete
        </Button>
      </div>

      <DeleteSprintModal
        open={open}
        onClose={() => setOpen(false)}
        sprint={sprint}
      />
    </>
  );
}
