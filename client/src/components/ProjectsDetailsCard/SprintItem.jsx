import { useState } from "react";
import DeleteSprintModal from "./DeleteSprintModal";
import { FaCircleChevronDown } from "react-icons/fa6";
import moment from "moment/moment";

export default function SprintItem({
  sprint,
  handleOnlySprintClick,
  handleDeleteSprintWithTasks,
  sprintStatusOptions,
  onTaskClick,
  onAddTask,
}) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const safeDate = (d) => (d ? moment(new Date(d)).format("DD MMM YYYY") : "-");

  const statusLabel =
    sprintStatusOptions?.find((s) => s.value === sprint.status)?.label ||
    "Unknown";

  const badgeColor = {
    active: "bg-green-100 text-green-700",
    planned: "bg-blue-100 text-blue-700",
    completed: "bg-gray-200 text-gray-700",
    "on hold": "bg-orange-100 text-orange-700",
  }[statusLabel.toLowerCase()] || "bg-gray-100 text-gray-700";

  return (
    <>
      <div
        className="bg-white border rounded-xl shadow-sm cursor-pointer transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-2 items-center">
            <h3 className="font-semibold">{sprint.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ml-2 ${badgeColor}`}>
              {statusLabel}
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

        {expanded && (
          <div className="px-4 pb-4 border-t text-sm text-gray-700 space-y-3">
            <p><strong>Goal:</strong> {sprint.goal || "—"}</p>

            <p>
              <strong>Duration:</strong> {safeDate(sprint.start_date)} —{" "}
              {safeDate(sprint.end_date)}
            </p>

            {/* Add Task Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTask && onAddTask();
              }}
              className="px-3 py-1 text-blue-600 border border-blue-400 rounded-md hover:bg-blue-50"
            >
              + Add Task
            </button>

            <div>
              <strong>Tasks:</strong>
              {sprint.tasksData?.length ? (
                <div className="mt-2 space-y-1">
                  {sprint.tasksData.map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick && onTaskClick(task);
                      }}
                      className="px-3 py-2 border rounded-md hover:bg-gray-50 cursor-pointer transition text-gray-700 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {task.entry_name || "Task"}
                      </span>

                      <span className="text-xs text-blue-600">View →</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-1">No tasks linked</p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="mt-2 px-3 py-1 text-red-600 border border-red-400 rounded-md hover:bg-red-50"
            >
              Delete Sprint
            </button>
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
