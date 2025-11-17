import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function DeleteSprintModal({ open, onClose, sprint }) {
  if (!sprint) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Delete {sprint.name}</DialogTitle>

      <DialogContent>
        <p className="text-gray-700">
          Delete all tasks within it?
        </p>
      </DialogContent>

      <DialogActions className="p-4">
        <Button variant="contained" color="error" onClick={() => alert("delete w/ tasks")}>
          Delete With Tasks
        </Button>

        <Button variant="outlined" color="error" onClick={() => alert("delete only sprint")}>
          Delete Only Sprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}
