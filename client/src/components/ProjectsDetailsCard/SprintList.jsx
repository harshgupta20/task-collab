import { useEffect, useState } from "react";
import SprintItem from "./SprintItem";
import { Button } from "@mui/material";
import { addData, customQueryCollection } from "../../firebase/firestore";
import { toast } from "sonner";

export default function SprintList({ projectData }) {
    const [sprints, setSprints] = useState([
        { id: 1, name: "Sprint 1", tasks: 12 },
        { id: 2, name: "Sprint 2", tasks: 5 },
        { id: 3, name: "Sprint 3", tasks: 0 },
    ]);

    const [sprintName, setSprintName] = useState("");

    const addSprint = () => {
        const next = sprints.length + 1;
        setSprints([...sprints, { id: next, name: `Sprint ${next}`, tasks: 0 }]);
    };

    const fetchSprints = async () => {
        try {
            const response = await customQueryCollection("project_sprints", [["project_id", "==", projectData.id]]);
            const taskResult = await customQueryCollection("project_entry", [["project_id", "==", projectData.id]]);
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
                    <SprintItem key={s.id} sprint={s} />
                ))}
            </div>
        </div>
    );
}
