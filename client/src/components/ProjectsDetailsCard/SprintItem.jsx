import { useState } from "react";
import DeleteSprintModal from "./DeleteSprintModal";
import { FaCircleChevronDown } from "react-icons/fa6";
import moment from "moment/moment";

export default function SprintItem({
  sprint,
  handleOnlySprintClick,
  handleDeleteSprintWithTasks,
  sprintStatusOptions,
}) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const badgeColor = {
    active: "bg-green-100 text-green-700",
    planned: "bg-blue-100 text-blue-700",
    completed: "bg-gray-200 text-gray-700",
    "on hold": "bg-orange-100 text-orange-700",
  }[sprintStatusOptions?.find(s => s.value === sprint.status)?.label?.toLowerCase()] || "bg-gray-100 text-gray-700";

  const safeDate = (d) => (d ? moment(new Date(d)).format("DD MMM YYYY") : "-");

  return (
    <>
      <div
        className="bg-white border rounded-xl shadow-sm cursor-pointer transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-2 items-center">
            <h3 className="font-semibold">{sprint.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ml-2 ${badgeColor}`}
            >
              {sprintStatusOptions?.find(s => s.value === sprint.status)?.label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Tasks: {sprint.tasks}
            </span>
            <FaCircleChevronDown
              size={20}
              className={`transition-transform text-green-600 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Expand Content */}
        {expanded && (
          <div className="px-4 pb-4 border-t text-sm text-gray-700 space-y-2">
            <p>
              <strong>Goal:</strong> {sprint.goal || "—"}
            </p>

            <p>
              <strong>Duration:</strong> {safeDate(sprint.start_date)} — {safeDate(sprint.end_date)}
            </p>

            <p>
              <strong>Tasks Linked:</strong> {sprint.tasks}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
                className="px-3 py-1 text-red-600 border border-red-400 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteSprintModal
        open={open}
        onClose={() => setOpen(false)}
        sprint={sprint}
        handleOnlySprintClick={async () => {
          await handleOnlySprintClick({ sprint });
          setOpen(false);
        }}
        handleDeleteSprintWithTasks={async () => {
          await handleDeleteSprintWithTasks({ sprint });
          setOpen(false);
        }}
      />
    </>
  );
}
