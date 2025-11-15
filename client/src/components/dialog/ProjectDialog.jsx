import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";
import { useState } from "react";

export default function ProjectDialog({
    open,
    onClose,
    onSubmit,
    projectData
}) {

    const [data, setData] = useState({
        created_by: "00",
        project_name: projectData?.project_name || "",
        project_uuid: projectData?.project_uuid || "",
        project_description: projectData?.project_description || "",
        id: projectData?.id || null
    });

    const handleChange = (field) => (e) => {
        setData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                className: "p-2", // tailwind allowed here
            }}
        >
            <div className="text-lg font-semibold px-4">
                {projectData?.id ? "Update Project" : "Create Project"}
            </div>

            <div className="flex flex-col gap-4 p-4">
                {/* <TextField
          label="Created By"
          variant="outlined"
          size="small"
          fullWidth
          value={data.created_by}
          onChange={handleChange("created_by")}
        /> */}

                <TextField
                    label="Project Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={data.project_name}
                    onChange={handleChange("project_name")}
                />

                {/* <TextField
                    label="Project UUID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={data.project_uuid}
                    onChange={handleChange("project_uuid")}
                /> */}

                <TextField
                    label="Project Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={data.project_description}
                    onChange={handleChange("project_description")}
                />
            </div>

            <DialogActions className="px-4 pb-3">
                <button className="px-3 py-1 rounded-lg hover:bg-gray-100 cursor-pointer" variant="text" onClick={onClose}>
                    Cancel
                </button>
                <button
                    variant="contained"
                    className="bg-green-600 text-white px-3 py-1 cursor-pointer rounded-lg hover:bg-green-700"
                    onClick={() => onSubmit({data})}
                >
                    Save
                </button>
            </DialogActions>
        </Dialog>
    );
}
