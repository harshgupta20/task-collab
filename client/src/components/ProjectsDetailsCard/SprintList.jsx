import { useEffect, useState } from "react";
import SprintItem from "./SprintItem";
import { toast } from "sonner";
import {
    addData,
    bulkUpdate,
    customQueryCollection,
    deleteByQuery,
    deleteData,
    getCollection,
} from "../../firebase/firestore";
import { useNavigate } from "react-router";
import CreateTaskDialog from "./CreateTaskDialog";

export default function SprintList({ projectData }) {
    const [sprints, setSprints] = useState([]);
    const [sprintName, setSprintName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sprintGoal, setSprintGoal] = useState("");
    const [status, setStatus] = useState(null);
    const [sprintStatusOptions, setSprintStatusOptions] = useState([]);
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState(null);

    const navigate = useNavigate();

    const fetchSprints = async () => {
        try {
            const response = await customQueryCollection("project_sprints", [
                ["project_id", "==", projectData.id],
            ]);
            const taskResult = await customQueryCollection("project_entry", [
                ["project_id", "==", projectData.id],
            ]);

            setSprints(
                response.map((sprint) => ({
                    ...sprint,
                    tasks: taskResult.filter(
                        (task) => task.entry_sprint_id === sprint.id
                    ).length,
                    tasksData: taskResult.filter(
                        (task) => task.entry_sprint_id === sprint.id
                    ),
                }))
            );
        } catch (error) {
            toast.warning(error?.message || "Failed to fetch sprints");
            console.error("Error fetching sprints:", error);
        }
    };

    const handleAddSprint = async () => {
        if (!sprintName.trim()) {
            toast.error("Sprint name is required");
            return;
        }

        if (!startDate || !endDate) {
            toast.error("Start & end date required");
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            toast.error("End date must be after start date");
            return;
        }

        try {
            await addData("project_sprints", {
                project_id: projectData.id,
                name: sprintName.trim(),
                goal: sprintGoal.trim() || "",
                start_date: startDate,
                end_date: endDate,
                status,
            });

            toast.success("Sprint added successfully");
            setSprintName("");
            setSprintGoal("");
            setStartDate("");
            setEndDate("");
            setStatus(
                sprintStatusOptions?.find(
                    (status) => status?.label?.toLowerCase() === "active"
                )?.value || ""
            );

            fetchSprints();
        } catch (error) {
            toast.error(error?.message || "Failed to add sprint");
            console.error("Error adding sprint:", error);
        }
    };

    const handleOnlySprintClick = async ({ sprint }) => {
        try {
            await deleteData("project_sprints", sprint.id);
            await bulkUpdate(
                "project_entry",
                sprint.tasksData.map((task) => ({
                    id: task.id,
                    data: { entry_sprint_id: null },
                }))
            );
            fetchSprints();
            toast.success("Sprint deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Failed to delete sprint");
            console.error("Error deleting sprint:", error);
        }
    };

    const handleDeleteSprintWithTasks = async ({ sprint }) => {
        try {
            await deleteData("project_sprints", sprint.id);
            await deleteByQuery("project_entry", [
                ["entry_sprint_id", "==", sprint.id],
            ]);
            fetchSprints();
            toast.success("Sprint & tasks deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Failed to delete sprint & tasks");
            console.error("Error deleting sprint & tasks:", error);
        }
    };

    const handleFetchSprintStatus = async () => {
        try {
            const response = await getCollection("sprint_status");
            const formatted = response?.map((item) => ({
                value: item.id,
                label: item.name,
            }));

            setSprintStatusOptions(formatted || []);

            setStatus(
                formatted?.find(
                    (s) => s.label.toLowerCase() === "active"
                )?.value || ""
            );
        } catch (error) {
            toast.warning(error?.message || "Failed to fetch sprint status");
            console.error("Error fetching sprint status:", error);
        }
    };

    const handleAddTaskClick = (sprint) => {
        setSelectedSprint(sprint);
        setOpenTaskDialog(true);
    };

    const handleTaskCreateSuccess = () => {
        setOpenTaskDialog(false);
        fetchSprints();
    };

    const onTaskClick = (task) => {
        // Navigate to task details page
        window.open(
            `/projects/${projectData.id}/tasks/${task.id}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    useEffect(() => {
        fetchSprints();
        handleFetchSprintStatus();
    }, []);

    return (
        <div className="mt-6">
            <div className="bg-white shadow-md rounded-xl p-4 mb-4">
                <h2 className="text-lg font-semibold mb-4">Create New Sprint</h2>

                <div className="grid grid-cols-6 gap-2">
                    <input
                        className="p-2 border rounded-md col-span-1"
                        placeholder="Name"
                        value={sprintName}
                        onChange={(e) => setSprintName(e.target.value)}
                    />

                    <input
                        type="date"
                        className="p-2 border rounded-md col-span-1"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <input
                        type="date"
                        className="p-2 border rounded-md col-span-1"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <select
                        className="p-2 border rounded-md col-span-1"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {sprintStatusOptions?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <input
                        className="p-2 border rounded-md col-span-1"
                        placeholder="Goal"
                        value={sprintGoal}
                        onChange={(e) => setSprintGoal(e.target.value)}
                    />

                    <button
                        onClick={handleAddSprint}
                        className="bg-green-600 text-white rounded-md px-3 py-2 hover:bg-green-700"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {sprints.map((s) => (
                    <SprintItem
                        key={s.id}
                        sprint={s}
                        sprintStatusOptions={sprintStatusOptions}
                        handleOnlySprintClick={handleOnlySprintClick}
                        handleDeleteSprintWithTasks={handleDeleteSprintWithTasks}
                        onTaskClick={onTaskClick}
                        onAddTask={() => handleAddTaskClick(s)}
                    />
                ))}
            </div>
            {openTaskDialog &&
                <CreateTaskDialog
                    open={openTaskDialog}
                    onClose={() => setOpenTaskDialog(false)}
                    sprintList={[selectedSprint]}
                    projectId={projectData.id}
                    onSuccess={handleTaskCreateSuccess}
                />}
        </div>
    );
}
