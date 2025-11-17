import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function DeleteSprintModal({ open, onClose, sprint, handleOnlySprintClick, handleDeleteSprintWithTasks }) {
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
        <Button variant="contained" color="error" onClick={() => handleDeleteSprintWithTasks(sprint)}>
          Delete With Tasks
        </Button>

        <Button variant="outlined" color="error" onClick={() => handleOnlySprintClick(sprint)}>
          Delete Only Sprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}
