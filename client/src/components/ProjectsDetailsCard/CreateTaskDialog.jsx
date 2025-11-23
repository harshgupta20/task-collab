import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogActions,
    TextField,
    Autocomplete
} from "@mui/material";
import { customQueryCollection, setData } from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { sendEmail } from "../../utils/sendEmail";
import { uid } from "../../utils/utils";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                               Mock Data                                    */
/* -------------------------------------------------------------------------- */

const mockUsersList = [
    { id: 1, name: "Alice Green" },
    { id: 2, name: "Mark Parker" },
    { id: 3, name: "Sarah Doe" },
    { id: 4, name: "John Smith" },
];

// const mockSprintsList = [
//     { id: 1, name: "Sprint 11" },
//     { id: 2, name: "Sprint 12" },
//     { id: 3, name: "Sprint 13" },
// ];

/* -------------------------------------------------------------------------- */
/*                             Task Dialog Component                          */
/* -------------------------------------------------------------------------- */

export default function TaskDialog({ open, mode = "add", onClose, sprintList, projectId, onSuccess }) {
    const [cardDialog, setCardDialog] = useState({
        open: open,
        mode: mode,

        // mock default values
        id: uid("card-"),
        title: null,
        description: null,
        sprint: sprintList[0] || null,
        column: null,
        assignees: [],
        priority: [],
        dueDate: null,
        tagsInput: "",
        tags: [],
        attachments: [],
    });

    const { user, logout } = useAuth();

    const [userList, setUserList] = useState([]);
    const [columnList, setColumnList] = useState([]);

    /* ---------------------------- TAG PROCESSOR ----------------------------- */
    const onCardTagsApply = () => {
        if (!cardDialog.tagsInput.trim()) return;

        const newTags = cardDialog.tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t && !cardDialog.tags.includes(t));

        setCardDialog((prev) => ({
            ...prev,
            tags: [...prev.tags, ...newTags],
            tagsInput: "",
        }));
    };

    /* -------------------------- ATTACHMENT HANDLERS ------------------------- */
    const onCardAttachFiles = (files) => {
        const newFiles = Array.from(files).map((file, i) => ({
            id: Date.now() + i,
            name: file.name,
            base64: "#", // You can implement conversion here
        }));

        setCardDialog((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ...newFiles],
        }));
    };

    const onCardRemoveAttachment = (id) => {
        setCardDialog((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((a) => a.id !== id),
        }));
    };

    /* ----------------------------- SAVE HANDLER ----------------------------- */
    const onCardDialogSave = async () => {
        console.log("Saving task:", cardDialog);
        try {


            const data = {
                project_id: projectId,
                columnn_id: cardDialog.column?.id || null,
                entry_name: cardDialog.title,
                entry_description: cardDialog.description,
                entry_uuid: cardDialog.id,
                entry_assignees: JSON.stringify(cardDialog.assignees),
                entry_attachments: JSON.stringify(cardDialog.attachments),
                entry_due_date: cardDialog.dueDate,
                entry_estimation_hours: null, // this needs to deleted - not in use
                entry_priority: cardDialog.priority,
                entry_tags: JSON.stringify(cardDialog.tags),
                entry_sprint_id: cardDialog?.sprint?.id || null,
            }
            const response = await setData("project_entry", cardDialog.id, data);
            // fetchColumns();
            toast.success('Card added successfully');

            if (cardDialog.assignees.length !== 0) {
                const emailResponse = await sendEmail({
                    to: cardDialog.assignees.map((a) => a.email),
                    subject: "A new task assigned to you.",
                    innerSubject: "Task Alloted",
                    update_type: "Task",
                    updated_by: "Project Admin",
                    task_status: cardDialog?.priority,
                    task_priority: cardDialog?.priority,
                    optional_message: "Please check the task details ASAP.",
                    task_link: `https://taskcollab.harshtools.shop/projects/${projectId}`,
                });
                if (emailResponse?.status) {
                    toast.success(emailResponse?.message);
                }
                else {
                    toast.warning(emailResponse?.message);
                };
            }
            setCardDialog({ ...cardDialog, open: false });
            onSuccess();
        }
        catch (error) {
            toast.error(error?.message || 'Failed to save task');
        }
    };

    const fetchUsersList = async () => {
        // Fetch users from backend or Firestore if needed
        try {
            const response = await customQueryCollection("users", []);
            setUserList(response?.map(u => ({ id: u.id, name: u.name })));
        }
        catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const fetchColumnsList = async () => {
        // Fetch columns from backend or Firestore if needed
        try {
            const response = await customQueryCollection("project_columns", [["project_id", "==", projectId]]);
            setColumnList(response?.map(c => ({ id: c.id, name: c.column_name })));
        }
        catch (error) {
            console.error("Error fetching columns:", error);
        }
    }

    useEffect(() => {
        fetchUsersList();
        fetchColumnsList();
    }, []);
    /* -------------------------------------------------------------------------- */
    /*                                   JSX                                     */
    /* -------------------------------------------------------------------------- */

    return (
        <Dialog
            open={cardDialog.open}
            onClose={() => { setCardDialog({ ...cardDialog, open: false }); onClose && onClose(); }}
            maxWidth="sm"
            fullWidth
        >
            {/* Title */}
            <div className="text-lg font-semibold px-4 py-3 border-b">
                {cardDialog.mode === "add" ? "Add Task" : "Edit Task"}
            </div>

            <div className="px-4 py-3 flex flex-col gap-4">
                {/* Task Title */}
                <TextField
                    autoFocus
                    label="Task Title"
                    variant="standard"
                    fullWidth
                    value={cardDialog.title}
                    onChange={(e) =>
                        setCardDialog({ ...cardDialog, title: e.target.value })
                    }
                />

                {/* Description */}
                <TextField
                    label="Description"
                    variant="standard"
                    fullWidth
                    multiline
                    minRows={3}
                    value={cardDialog.description}
                    onChange={(e) =>
                        setCardDialog({ ...cardDialog, description: e.target.value })
                    }
                />

                {/* Sprint */}
                <Autocomplete
                    options={sprintList}
                    getOptionLabel={(opt) => opt?.name || ""}
                    value={cardDialog.sprint}
                    disabled
                    onChange={(e, newValue) =>
                        setCardDialog((prev) => ({ ...prev, sprint: newValue }))
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="Sprint" variant="standard" />
                    )}
                />

                {/* Column */}
                <Autocomplete
                    options={columnList}
                    getOptionLabel={(opt) => opt?.name || ""}
                    value={cardDialog.column}
                    onChange={(e, newValue) =>
                        setCardDialog((prev) => ({ ...prev, column: newValue }))
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="Column" variant="standard" />
                    )}
                />

                {/* Assignees */}
                <Autocomplete
                    multiple
                    options={userList}
                    getOptionLabel={(u) => u.name}
                    value={cardDialog.assignees}
                    onChange={(e, newValue) =>
                        setCardDialog({ ...cardDialog, assignees: newValue })
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="Assignees" variant="standard" />
                    )}
                />

                {/* Priority + Due Date */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm block mb-1 text-gray-600">Priority</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={cardDialog.priority}
                            onChange={(e) =>
                                setCardDialog({ ...cardDialog, priority: e.target.value })
                            }
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>

                    <TextField
                        type="date"
                        label="Due Date"
                        variant="standard"
                        className="flex-1"
                        InputLabelProps={{ shrink: true }}
                        value={cardDialog.dueDate}
                        onChange={(e) =>
                            setCardDialog({ ...cardDialog, dueDate: e.target.value })
                        }
                    />
                </div>

                {/* Tags */}
                <div>
                    <TextField
                        label="Tags (comma separated)"
                        variant="standard"
                        fullWidth
                        value={cardDialog.tagsInput}
                        onChange={(e) =>
                            setCardDialog({ ...cardDialog, tagsInput: e.target.value })
                        }
                        onBlur={onCardTagsApply}
                    />

                    {/* Render Tags */}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {cardDialog.tags.map((tag) => (
                            <div
                                key={tag}
                                className="px-2 py-1 text-xs border rounded-full flex items-center gap-1"
                            >
                                <span>{tag}</span>
                                <button
                                    className="text-gray-500 hover:text-black"
                                    onClick={() =>
                                        setCardDialog((prev) => ({
                                            ...prev,
                                            tags: prev.tags.filter((t) => t !== tag),
                                        }))
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attachments */}
                <div>
                    <div className="text-sm text-gray-700">Attachments</div>

                    <input
                        type="file"
                        multiple
                        className="mt-1"
                        onChange={(e) => {
                            if (e.target.files?.length) {
                                onCardAttachFiles(e.target.files);
                                e.target.value = null;
                            }
                        }}
                    />

                    <div className="mt-3 flex flex-col gap-1">
                        {cardDialog.attachments.map((att) => (
                            <div key={att.id} className="flex items-center text-xs gap-2">
                                <span className="truncate max-w-[200px]">{att.name}</span>
                                <a className="underline" href={att.base64} target="_blank">
                                    open
                                </a>
                                <button
                                    className="ml-auto text-red-500"
                                    onClick={() => onCardRemoveAttachment(att.id)}
                                >
                                    remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <DialogActions className="px-4 pb-3">
                <button
                    onClick={() => { setCardDialog({ ...cardDialog, open: false }); onClose(); }}
                    className="py-1 px-3 bg-gray-200 rounded"
                >
                    Cancel
                </button>

                <button
                    className="py-1 px-3 bg-green-600 text-white rounded"
                    onClick={onCardDialogSave}
                >
                    Save
                </button>
            </DialogActions>
        </Dialog>
    );
}
