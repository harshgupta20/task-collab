import { useEffect, useState } from "react";
import {
    Dialog,
    IconButton,
    Divider,
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import { addData, customQueryCollection, deleteData } from "../firebase/firestore";
import { toast } from "sonner";

const CreateSubtaskDialog = ({ open, onClose, onSubmit, projectId=null, taskId = null }) => {
    const [subtaskName, setSubtaskName] = useState("");
    const [subtasks, setSubtasks] = useState([]);

    const handleAddSubtask = async () => {
        if (!subtaskName.trim()) return;

        try {
            const response = await addData("project_subtasks", { name: subtaskName.trim(), task_id: taskId, project_id: projectId });
            toast.success("Subtask added successfully");
            setSubtaskName("");
            fetchSubTasks();
            onSubmit();
        }
        catch (error) {
            toast.error(error?.message || "Failed to add subtask");
        }
    };

    const fetchSubTasks = async () => {
        try {
            const response = await customQueryCollection("project_subtasks", [["task_id", "==", taskId]]);
            setSubtasks(response?.map((item) => ({ id: item.id, name: item.name })) || []);
        }
        catch (error) {
            toast.error(error?.message || "Failed to fetch subtasks");
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteData("project_subtasks", id);
            toast.success("Subtask deleted successfully");
            fetchSubTasks();
        }
        catch (error) {
            toast.error(error?.message || "Failed to delete subtask");
        }
    };

    const handleSubmit = () => {
        if (subtasks.length === 0) return;
        onSubmit(subtasks);
        onClose();
    };

    useEffect(() => {
        fetchSubTasks();
    }, []);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <div className="flex flex-col gap-4 py-4 px-2">


                <div className="px-4 font-semibold text-lg text-green-600">
                    Subtasks
                </div>

                <div className="px-4 flex flex-col gap-4">
                    {/* Add Subtask Form */}
                    <div className="flex items-center gap-3">
                        <input
                            placeholder="Subtask Name"
                            className="border-2 grow border-green-600 outline-none rounded px-3 py-1"
                            value={subtaskName}
                            onChange={(e) => setSubtaskName(e.target.value)}
                        />
                        <button
                            variant="contained"
                            color="primary"
                            onClick={handleAddSubtask}
                            className="py-1 px-3 rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                            Add
                        </button>
                    </div>

                    <Divider className="my-4" />

                    {/* Subtask List */}
                    <div className="max-h-56 overflow-y-auto">
                        {subtasks.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No subtasks added yet.
                            </p>
                        ) : (
                            subtasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex justify-between items-center bg-gray-100 rounded-lg p-3 mb-2"
                                >
                                    <span className="text-gray-800">{task.name}</span>

                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={() => handleDelete(task.id)}
                                        size="small"
                                    >
                                        <MdDelete size={20} />
                                    </IconButton>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="mr-2 py-1 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">
                        Cancel
                    </button>
                    <button className="py-1 px-3 rounded-md bg-green-600 text-white hover:bg-green-700"
                        onClick={handleSubmit}
                        disabled={subtasks.length === 0}
                    >
                        Save
                    </button>
                </div>
            </div>

        </Dialog>
    );
};

export default CreateSubtaskDialog;
