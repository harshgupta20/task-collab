import { useEffect, useState } from "react";
import SprintItem from "./SprintItem";
import { Button } from "@mui/material";
import { addData, bulkUpdate, customQueryCollection, deleteByQuery, deleteData } from "../../firebase/firestore";
import { toast } from "sonner";

export default function SprintList({ projectData }) {
    const [sprints, setSprints] = useState([]);

    const [sprintName, setSprintName] = useState("");

    const addSprint = () => {
        const next = sprints.length + 1;
        setSprints([...sprints, { id: next, name: `Sprint ${next}`, tasks: 0 }]);
    };

    const fetchSprints = async () => {
        try {
            const response = await customQueryCollection("project_sprints", [["project_id", "==", projectData.id]]);
            const taskResult = await customQueryCollection("project_entry", [["project_id", "==", projectData.id]]);

            setSprints(response.map((sprint) => ({
                ...sprint,
                tasks: taskResult.filter((task) => task.sprint_id === sprint.id).length,
                tasksData: taskResult.filter((task) => task.sprint_id === sprint.id),
            })))
        }
        catch (error) {
            toast.warning(error?.message || "Failed to fetch sprints");
            console.error("Error fetching sprints:", error);
        }
    }

    const handleAddSprint = async () => {
        try {
            const response = await addData("project_sprints", {
                project_id: projectData.id,
                name: sprintName,
            });
            toast.success("Sprint added successfully");
            fetchSprints();
        } catch (error) {
            toast.error(error?.message || "Failed to add sprint");
            console.error("Error adding sprint:", error);
        }
    }

    const handleOnlySprintClick = async ({sprint}) => {
        // Delete Sprint Only Logic and erase sprint reference from tasks
        try {
            const deleteSprintResponse = await deleteData("project_sprints", sprint.id);
            const response = await bulkUpdate("project_entry", sprint.tasksData.map(task => ({ id: task.id, data: { sprint_id: null } })));
            fetchSprints();
            toast.success("Sprint deleted successfully");
        }
        catch (error) {
            toast.error(error?.message || "Failed to delete sprint");
            console.error("Error deleting sprint:", error);
        }
    }

    const handleDeleteSprintWithTasks = async ({sprint}) => {
        try {
            const deleteSprintResponse = await deleteData("project_sprints", sprint.id);
            const response = await deleteByQuery("project_entry", [["sprint_id", "==", sprint.id]]);
            fetchSprints();
            toast.success("Sprint and its tasks deleted successfully");
        }
        catch (error) {
            toast.error(error?.message || "Failed to delete sprint and its tasks");
            console.error("Error deleting sprint and its tasks:", error);
        }
    }

    useEffect(() => {
        fetchSprints();
    }, []);

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium">Sprints</h2>

                <div className="flex gap-1">
                    <input className="p-1 border border-gray-300 rounded-md outline-none" type="text" onChange={(e) => setSprintName(e.target.value)} />
                    <button className="py-1 px-3 bg-green-600 text-white rounded-md cursor-pointer" onClick={handleAddSprint}>Add</button>
                </div>
            </div>

            <div className="space-y-3">
                {sprints.map((s) => (
                    <SprintItem key={s.id} sprint={s} handleOnlySprintClick={handleOnlySprintClick} handleDeleteSprintWithTasks={handleDeleteSprintWithTasks} />
                ))}
            </div>
        </div>
    );
}
