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

export default function SprintList({ projectData }) {
    const [sprints, setSprints] = useState([]);
    const [sprintName, setSprintName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sprintGoal, setSprintGoal] = useState("");
    const [status, setStatus] = useState(null);
    const [sprintStatusOptions, setSprintStatusOptions] = useState([]);

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
                status: status, // Use dropdown status
            });

            toast.success("Sprint added successfully");
            setSprintName("");
            setSprintGoal("");
            setStartDate("");
            setEndDate("");
            setStatus(sprintStatusOptions?.find((status) => status?.name?.toLowerCase() === "active")?.id || ""); // reset

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
            setSprintStatusOptions(response?.map(status => {
                return { value: status.id, label: status.name };
            }) || []);

            setStatus(response?.find((status) => status?.name?.toLowerCase() === "active")?.id || "");
        }
        catch (error) {
            toast.warning(error?.message || "Failed to fetch sprint status");
            console.error("Error fetching sprint status:", error);
        }
    };

    useEffect(() => {
        fetchSprints();
        handleFetchSprintStatus();
    }, []);

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium">Sprints</h2>

                <div className="flex gap-2">
                    <input
                        className="p-1 border border-gray-300 rounded-md outline-none"
                        placeholder="Sprint Name"
                        type="text"
                        value={sprintName}
                        onChange={(e) => setSprintName(e.target.value)}
                    />

                    <input
                        className="p-1 border border-gray-300 rounded-md outline-none"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <input
                        className="p-1 border border-gray-300 rounded-md outline-none"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <select
                        className="p-1 border border-gray-300 rounded-md outline-none"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {sprintStatusOptions.length > 0 && (
                            sprintStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))
                        )}
                    </select>

                    <input
                        className="p-1 border border-gray-300 rounded-md outline-none w-48"
                        type="text"
                        placeholder="Sprint Goal"
                        value={sprintGoal}
                        onChange={(e) => setSprintGoal(e.target.value)}
                    />

                    <button
                        className="py-1 px-3 bg-green-600 text-white rounded-md cursor-pointer"
                        onClick={handleAddSprint}
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
                        handleOnlySprintClick={handleOnlySprintClick}
                        handleDeleteSprintWithTasks={handleDeleteSprintWithTasks}
                    />
                ))}
            </div>
        </div>
    );
}
