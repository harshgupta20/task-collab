import ProjectHeader from "./ProjectHeader";
import ProjectDescription from "./ProjectDescription";
import SprintList from "./SprintList";

import { Dialog, DialogContent } from "@mui/material";
import { useState } from "react";

export default function ProjectCard({open, onClose, projectData}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className:
          "rounded-xl bg-white border border-gray-200 shadow-sm p-6",
      }}
    >
      <DialogContent className="p-0">
        <ProjectHeader projectData={projectData} />
        <ProjectDescription projectData={projectData} />
        <SprintList projectData={projectData} />
      </DialogContent>
    </Dialog>
  );
}
