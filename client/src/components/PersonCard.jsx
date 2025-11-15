// src/components/PersonCard.jsx
import { Typography, IconButton, Tooltip } from "@mui/material";
import { MdContentCopy } from "react-icons/md";
import { toast } from "sonner";

export default function PersonCard({ id, name, email, uuid, isAdmin, position }) {
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-1 text-sm">
      {/* NAME */}

      <div className="flex flex-col">

      <div className="flex justify-between items-center">
        <Typography sx={{ fontWeight: 600, fontSize: "16px", lineHeight: 1.2 }}>
          {name}
        </Typography>

        <Tooltip title="Copy name">
          <IconButton size="small" onClick={() => copy(name)}>
            {/* <ContentCopyIcon sx={{ fontSize: 14 }} /> */}
            <MdContentCopy size={15} />
          </IconButton>
        </Tooltip>
      </div>

      {/* EMAIL */}
      <div className="flex justify-between items-center">
        <Typography sx={{ color: "#555", fontSize: "12px", lineHeight: 1.2 }}>
          {email}
        </Typography>

        <Tooltip title="Copy email">
          <IconButton size="small" onClick={() => copy(email)}>
            {/* <ContentCopyIcon sx={{ fontSize: 14 }} /> */}
            <MdContentCopy size={15} />
          </IconButton>
        </Tooltip>
      </div>
      </div>


      {/* UUID */}
      <div className="flex justify-between items-center">
        <Typography sx={{ fontSize: "12px", lineHeight: 1.2 }}>
          <strong>UUID:</strong>{uuid}
        </Typography>

        <Tooltip title="Copy UUID">
          <IconButton size="small" onClick={() => copy(uuid)}>
            {/* <ContentCopyIcon sx={{ fontSize: 14 }} /> */}
            <MdContentCopy size={15} />
          </IconButton>
        </Tooltip>
      </div>

      {/* POSITION */}
      <div className="flex justify-between items-center">
        <Typography sx={{ fontSize: "13px", lineHeight: 1.2 }}>
          <strong>Position:</strong> {position || "—"}
        </Typography>

        <Tooltip title="Copy position">
          <IconButton size="small" onClick={() => copy(position)}>
            {/* <ContentCopyIcon sx={{ fontSize: 14 }} /> */}
            <MdContentCopy size={15} />
          </IconButton>
        </Tooltip>
      </div>

      {/* POSITION */}
      <div className="flex justify-between items-center">
        <Typography sx={{ fontSize: "13px", lineHeight: 1.2 }}>
          <strong>ID:</strong> {id || "—"}
        </Typography>

        <Tooltip title="Copy position">
          <IconButton size="small" onClick={() => copy(id)}>
            {/* <ContentCopyIcon sx={{ fontSize: 14 }} /> */}
            <MdContentCopy size={15} />
          </IconButton>
        </Tooltip>
      </div>

      {/* ROLE */}
      <div className="flex justify-between items-center">
        <Typography
          sx={{
            fontSize: "13px",
            color: isAdmin ? "#1976d2" : "#666",
            fontWeight: isAdmin ? 600 : 400,
            lineHeight: 1.2,
          }}
        >
          {isAdmin ? "Administrator" : "Standard User"}
        </Typography>

        <Tooltip title="Copy role">
          <IconButton size="small" onClick={() => copy(isAdmin ? "Administrator" : "Standard User")}>
            {/* <ContentCopyIcon sx={{ fontSize: 14 }} /> */}
            <MdContentCopy size={15} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
