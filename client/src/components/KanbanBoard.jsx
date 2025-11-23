// KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Autocomplete,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import { RiFileExcel2Fill } from "react-icons/ri";
import FloatingMiniChat from "../components/MiniChat";
import { BsStars } from "react-icons/bs";
import { truncateString, uid } from "../utils/utils";
import EmptyKanbanSvg from "../assets/empty-kanban.svg";
import { MdViewKanban } from "react-icons/md";
import { useNavigate } from "react-router";
import { customQueryCollection } from "../firebase/firestore";


export default function KanbanBoard({
  columns: initialColumns = [],
  cards: initialCards = {},
  controlled = false,
  onColumnAdd,
  onColumnEdit,
  onColumnDelete,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  onDragEnd,
  projectInfo,
  usersList = [],
}) {
  // Local state (when uncontrolled)
  const [columns, setColumns] = useState(initialColumns);
  const [cards, setCards] = useState(initialCards);

  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([]);

  const [sprintsList, setSprintsList] = useState([]);

  const navigate = useNavigate();

  // Sync props -> state when props change
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);


  const fetchSprints = async (projectId) => {
    try {
      const response = await customQueryCollection("project_sprints", [["project_id", "==", projectId]]);
      setSprintsList(response?.map(sprint => ({
        id: sprint.id,
        name: sprint.name
      })) || []);
    }
    catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };


  // Safe state setters
  const safeSetColumns = useCallback(
    (updater) => {
      setColumns((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
    },
    [setColumns]
  );

  const safeSetCards = useCallback(
    (updater) => {
      setCards((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
    },
    [setCards]
  );

  // ------------------------------
  // Handlers for columns
  // ------------------------------
  const handleColumnAdd = (title, description = "") => {
    const newCol = { id: uid("col-"), title: title || "Untitled", description };
    if (onColumnAdd) onColumnAdd(newCol);
    if (!controlled) {
      safeSetColumns((prev) => [...prev, newCol]);
      safeSetCards((prev) => ({ ...prev, [newCol.id]: [] }));
    }
  };

  const handleColumnEdit = (columnId, updated) => {
    if (onColumnEdit) onColumnEdit(columnId, updated, initialCards);
    if (!controlled) {
      safeSetColumns((prev) =>
        prev.map((c) => (c.id === columnId ? { ...c, ...updated } : c))
      );
    }
  };

  const handleColumnDelete = (columnId) => {
    if (onColumnDelete) onColumnDelete(columnId);
    if (!controlled) {
      safeSetColumns((prev) => prev.filter((c) => c.id !== columnId));
      safeSetCards((prev) => {
        const copy = { ...prev };
        delete copy[columnId];
        return copy;
      });
    }
  };

  // ------------------------------
  // Card creation structure
  // ------------------------------
  const makeEmptyCard = (overrides = {}) => ({
    id: uid("card-"),
    title: "Untitled",
    description: "",
    assignees: [],
    priority: "Medium",
    status: "",
    estimate: "",
    dueDate: "",
    tags: [],
    attachments: [],
    sprint: null,    // NEW FIELD
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  });

  const handleCardAdd = (columnId, partial = {}) => {
    const newCard = makeEmptyCard(partial);
    if (onCardAdd) onCardAdd(columnId, newCard);
    if (!controlled) {
      safeSetCards((prev) => {
        const list = prev[columnId] ? [...prev[columnId]] : [];
        return { ...prev, [columnId]: [...list, newCard] };
      });
    }
  };

  const handleCardEdit = (columnId, cardId, updated) => {
    if (onCardEdit) onCardEdit(columnId, cardId, updated);
    if (!controlled) {
      safeSetCards((prev) => {
        const colList = (prev[columnId] || []).map((c) =>
          c.id === cardId ? { ...c, ...updated, updatedAt: new Date().toISOString() } : c
        );
        return { ...prev, [columnId]: colList };
      });
    }
  };

  const handleCardDelete = (columnId, cardId) => {
    if (onCardDelete) onCardDelete(columnId, cardId);
    if (!controlled) {
      safeSetCards((prev) => {
        const colList = (prev[columnId] || []).filter((c) => c.id !== cardId);
        return { ...prev, [columnId]: colList };
      });
    }
  };

  // ------------------------------
  // Drag & Drop logic
  // ------------------------------
  const internalOnDragEnd = (result) => {
    if (onDragEnd) onDragEnd(result);

    if (!result.destination) return;

    const { source, destination } = result;
    const srcColId = source.droppableId;
    const dstColId = destination.droppableId;
    const srcIndex = source.index;
    const dstIndex = destination.index;

    if (!controlled) {
      safeSetCards((prev) => {
        const srcList = Array.from(prev[srcColId] || []);
        const dstList = Array.from(prev[dstColId] || []);

        const [moved] = srcList.splice(srcIndex, 1);
        if (srcColId === dstColId) {
          srcList.splice(dstIndex, 0, moved);
          return { ...prev, [srcColId]: srcList };
        } else {
          dstList.splice(dstIndex, 0, moved);
          return { ...prev, [srcColId]: srcList, [dstColId]: dstList };
        }
      });
    }
  };

  // ================================
  // DIALOG STATES
  // ================================
  const [cardDialog, setCardDialog] = useState({
    open: false,
    mode: "add",
    columnId: null,
    cardId: null,
    title: "",
    description: "",
    assignees: [],
    priority: "Medium",
    status: "",
    estimate: "",
    dueDate: "",
    sprint: null,            // NEW
    tagsInput: "",
    tags: [],
    attachments: []
  });
  // KanbanBoard.jsx (PART 2/2 — continue from previous part)
  // ================================
  // DIALOG OPENERS (cards/columns)
  // ================================
  const [columnDialog, setColumnDialog] = useState({
    open: false,
    mode: "add",
    columnId: null,
    title: "",
    description: ""
  });

  const [columnDeleteDialog, setColumnDeleteDialog] = useState({
    open: false,
    columnId: null,
    title: ""
  });

  const [cardDeleteDialog, setCardDeleteDialog] = useState({
    open: false,
    columnId: null,
    cardId: null,
    title: ""
  });

  const openAddColumnDialog = () => {
    setColumnDialog({ open: true, mode: "add", columnId: null, title: "", description: "" });
  };

  const openEditColumnDialog = (columnId, title, description) => {
    setColumnDialog({ open: true, mode: "edit", columnId, title, description });
  };

  const openDeleteColumnDialog = (columnId, title) => {
    setColumnDeleteDialog({ open: true, columnId, title });
  };

  const openAddCardDialog = (columnId) => {
    setCardDialog({
      open: true,
      mode: "add",
      columnId,
      cardId: null,
      title: "",
      description: "",
      assignees: [],
      priority: "Medium",
      status: "",
      estimate: "",
      dueDate: "",
      sprint: null,
      tagsInput: "",
      tags: [],
      attachments: [],
    });
  };

  const openEditCardDialog = (columnId, card) => {
    setCardDialog({
      open: true,
      mode: "edit",
      columnId,
      cardId: card.id,
      title: card.title || "",
      description: card.description || "",
      assignees: Array.isArray(card.assignees) ? card.assignees.slice() : [],
      priority: card.priority || "Medium",
      status: card.status || "",
      estimate: card.estimate || "",
      dueDate: card.dueDate || "",
      sprint: card.sprint || null,
      tagsInput: (card.tags || []).join(", "),
      tags: Array.isArray(card.tags) ? card.tags.slice() : [],
      attachments: Array.isArray(card.attachments) ? card.attachments.slice() : [],
    });
  };

  const openDeleteCardDialog = (columnId, card) => {
    setCardDeleteDialog({
      open: true,
      columnId,
      cardId: card.id,
      title: card.title
    });
  };

  // ================================
  // File helpers (to base64)
  // ================================
  const filesToBase64 = (fileList) => {
    const files = Array.from(fileList || []);
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({
            id: uid("att-"),
            name: file.name,
            type: file.type,
            size: file.size,
            base64: ev.target.result
          });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const onCardAttachFiles = async (files) => {
    try {
      const base64arr = await filesToBase64(files);
      setCardDialog(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...base64arr]
      }));
    } catch (err) {
      // swallow for now
    }
  };

  const onCardRemoveAttachment = (attId) => {
    setCardDialog(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  const onCardTagsApply = () => {
    const tags = (cardDialog.tagsInput || "")
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
    setCardDialog(prev => ({ ...prev, tags }));
  };

  // ================================
  // DIALOG SAVE / DELETE HANDLERS
  // ================================
  const onColumnDialogSave = () => {
    const trimmedTitle = columnDialog.title.trim() || "Untitled";
    if (columnDialog.mode === "add") {
      handleColumnAdd(trimmedTitle, columnDialog.description);
    } else if (columnDialog.mode === "edit") {
      handleColumnEdit(columnDialog.columnId, { title: trimmedTitle, description: columnDialog.description });
    }
    setColumnDialog({ ...columnDialog, open: false });
  };

  const onColumnDeleteConfirm = () => {
    handleColumnDelete(columnDeleteDialog.columnId);
    setColumnDeleteDialog({ open: false, columnId: null, title: "" });
  };

  const onCardDialogSave = () => {
    const trimmedTitle = (cardDialog.title || "").trim();
    if (!trimmedTitle) return; // don't save empty title

    const finalCard = {
      id: cardDialog.mode === "add" ? uid("card-") : cardDialog.cardId,
      title: trimmedTitle,
      description: cardDialog.description,
      assignees: Array.isArray(cardDialog.assignees) ? cardDialog.assignees.slice() : [],
      priority: cardDialog.priority || "Medium",
      status: cardDialog.status || "",
      estimate: cardDialog.estimate || "",
      dueDate: cardDialog.dueDate || "",
      sprint: cardDialog.sprint ? { id: cardDialog.sprint.id, name: cardDialog.sprint.name } : null,
      tags: Array.isArray(cardDialog.tags) ? cardDialog.tags.slice() : [],
      attachments: Array.isArray(cardDialog.attachments) ? cardDialog.attachments.slice() : [],
      updatedAt: new Date().toISOString(),
      createdAt: cardDialog.mode === "add" ? new Date().toISOString() : undefined
    };

    if (cardDialog.mode === "add") {
      handleCardAdd(cardDialog.columnId, finalCard);
    } else if (cardDialog.mode === "edit") {
      handleCardEdit(cardDialog.columnId, cardDialog.cardId, finalCard);
    }

    setCardDialog(prev => ({ ...prev, open: false }));
  };

  const onCardDeleteConfirm = () => {
    handleCardDelete(cardDeleteDialog.columnId, cardDeleteDialog.cardId);
    setCardDeleteDialog({ open: false, columnId: null, cardId: null, title: "" });
  };

  // ================================
  // Render helpers (tags, attachments)
  // ================================
  const renderTags = (tags = []) => {
    if (!tags || !tags.length) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((t) => (
          <div key={t} className="text-xs px-2 py-1 rounded-full border bg-white/60">
            {t}
          </div>
        ))}
      </div>
    );
  };

  const renderAttachmentsPreview = (attachments = []) => {
    if (!attachments || !attachments.length) return null;
    return (
      <div className="flex flex-col gap-1 mt-2">
        {attachments.map(att => (
          <div key={att?.id} className="text-xs flex items-center gap-2">
            <span className="truncate max-w-[180px]">{att?.name}</span>
            <a
              href={att?.base64}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline"
            >
              open
            </a>
            <span className="text-gray-400">· {Math.round((att?.size || 0) / 1024)}KB</span>
          </div>
        ))}
      </div>
    );
  };

  // ================================
  // Render Card (shows sprint under title as Option 2)
  // ================================
  const renderCard = (card, columnId, index) => {
    return (
      <Draggable key={card.id} draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white rounded-md p-3 mb-3 shadow-sm hover:shadow-md transition
              ${snapshot.isDragging ? "opacity-90" : "opacity-100"}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{card?.title}</div>

                {/* Sprint line under title (Option 2) */}
                {card?.sprint ? (
                  <div className="text-xs text-gray-600 mt-1">Sprint: {
                    card.sprint && (sprintsList?.find(s => s.id === card.sprint.id)?.name)
                  }</div>
                ) : null}

                {card?.description ? (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-3">{truncateString(card?.description, 40)}</div>
                ) : null}

                <div className="flex items-center gap-2 mt-2">
                  {/* Priority pill */}
                  <div className="text-xs px-2 py-0.5 rounded-full border">
                    {card?.priority || "Medium"}
                  </div>

                  {/* Assignees: show initials or names */}
                  {card?.assignees && card?.assignees.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {card?.assignees.slice(0, 3).map((a, i) => (
                        <div key={i} className="text-xs px-1.5 py-0.5 rounded-full border">
                          {typeof a === "string" ? a.split(" ").map(p => p[0]).join("").slice(0, 2) : (a?.name ? a.name.split(" ").map(p => p[0]).join("").slice(0, 2) : "U")}
                        </div>
                      ))}
                      {card?.assignees.length > 3 ? (
                        <div className="text-xs px-1 py-0.5 rounded-full border">+{card?.assignees.length - 3}</div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Estimate */}
                  {card?.estimate ? <div className="text-xs text-gray-500">· {card?.estimate}</div> : null}

                  {/* Due date */}
                  {card?.dueDate ? <div className="text-xs text-red-500 ml-auto">{new Date(card?.dueDate).toLocaleDateString()}</div> : null}
                </div>

                {renderTags(card?.tags)}
                {renderAttachmentsPreview(card?.attachments)}
              </div>

              <div className="flex flex-col items-end gap-1 ml-2">
                <button
                  title="Edit"
                  onClick={() => openEditCardDialog(columnId, card)}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                >
                  ✏️
                </button>
                <button
                  title="Delete"
                  onClick={() => openDeleteCardDialog(columnId, card)}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  // ================================
  // Chat handler (mini chat)
  // ================================
  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);

    // placeholder AI logic - replace with real call if needed
    const reply = "I'll help with that — (placeholder reply)";
    setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
  };

  const columnList = columns || [];


  const [selectedSprintId, setSelectedSprintId] = useState("all");
  function filterBoardBySprintId(boardData, sprintId) {

    let localSprintId = sprintId;
    if (localSprintId === "all") {
      return boardData;
    }
    else if (localSprintId === "unassigned") {
      localSprintId = null;
    }

    const result = {};
    Object.entries(boardData).forEach(([colId, cards]) => {
      result[colId] = cards.filter(
        card => card.sprint && card.sprint.id === localSprintId
      );
    });
    return result;
  }

  useEffect(() => {
    // setCards(initialCards);
    setCards(filterBoardBySprintId(initialCards, selectedSprintId));
    fetchSprints(projectInfo?.id);
  }, [initialCards, projectInfo?.id]);

  const handleChange = (event) => {
    const selectSprintId = event?.target?.value;
    setSelectedSprintId(selectSprintId);

    setCards(filterBoardBySprintId(initialCards, selectSprintId));
    // const selectedSprint = sprintsList.find(sprint => sprint.id === selectSprintId) || null;
    // navigate(`/projects/${event.target.value}`);
  }

  // ================================
  // MAIN RENDER
  // ================================
  return (
    <div className="w-full h-full">
      <div className="mb-4 flex items-center gap-2 border border-green-200 p-2 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MdViewKanban className="w-7 h-7 text-green-600" />
            <span className="font-semibold text-gray-800">{projectInfo?.project_name}</span>
          </div>

          <FormControl size="small" className="w-36">
            <Select
              value={selectedSprintId}
              onChange={handleChange}
              className="bg-white rounded-md"
              sx={{
                fontSize: "14px",
                height: "36px",
                ".MuiSelect-select": { paddingY: "8px" },
              }}
            >
              {sprintsList?.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.name}
                </MenuItem>
              ))}
              <MenuItem value="all">
                All Sprints
              </MenuItem>
              <MenuItem value="unassigned">
                Unassigned Sprints
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setOpenChat(true)} className="flex gap-2 bg-green-200 text-green-800 items-center py-1 px-3 rounded-lg cursor-pointer">
            <BsStars /> Ask Ai
          </button>
          <button className="flex gap-2 bg-green-200 text-green-800 items-center py-1 px-3 rounded-lg cursor-pointer">
            <RiFileExcel2Fill /> Upload Excel
          </button>
          <button
            onClick={openAddColumnDialog}
            className="px-3 py-1 border border-green-600 rounded-lg text-green-600 text-sm cursor-pointer outline-none"
          >
            + Column
          </button>
          <button
            onClick={() => handleColumnAdd("New Column", "New Column Description")}
            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm cursor-pointer"
          >
            Quick Add Column
          </button>
        </div>
      </div>

      <div className="flex h-full overflow-x-auto pb-6">
        <DragDropContext onDragEnd={internalOnDragEnd}>
          <div className="flex gap-4">
            {columnList.map((col) => (
              <div
                key={col.id}
                className="min-w-[280px] bg-gray-100 rounded-lg p-3 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="font-semibold text-sm">{col.title}</div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditColumnDialog(col.id, col.title, col.description)}
                      className="px-2 py-1 text-xs rounded hover:bg-gray-200"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteColumnDialog(col.id, col.title)}
                      className="px-2 py-1 text-xs rounded hover:bg-gray-200"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-20 overflow-y-auto pb-2 pr-1 ${snapshot.isDraggingOver ? "bg-gray-200" : ""}`}
                    >
                      {(cards[col.id] || []).map((card, idx) =>
                        renderCard(card, col.id, idx)
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="mt-3">
                  <button
                    onClick={() => openAddCardDialog(col.id)}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-200 text-sm"
                  >
                    + Add Task
                  </button>
                </div>
              </div>
            ))}

            {columnList.length === 0 && (
              <div className="flex flex-col gap-6 m-auto h-full items-center w-[300px] rounded-md p-3">
                <img src={EmptyKanbanSvg} alt="empty_kanban_svg" />
                <div className="font-medium text-sm">Create columns to get started</div>
              </div>
            )}
          </div>
        </DragDropContext>

        <div className="flex items-center gap-2">
          <FloatingMiniChat
            open={openChat}
            onClose={() => setOpenChat(false)}
            messages={messages}
            onSend={handleSend}
          />
        </div>
      </div>

      {/* ===== COLUMN ADD/EDIT DIALOG ===== */}
      <Dialog
        open={columnDialog.open}
        onClose={() => setColumnDialog({ ...columnDialog, open: false })}
      >
        <DialogTitle>
          {columnDialog.mode === "add" ? "Add Column" : "Edit Column"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Title"
            fullWidth
            variant="standard"
            value={columnDialog.title}
            onChange={(e) =>
              setColumnDialog({ ...columnDialog, title: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onColumnDialogSave();
              }
              if (e.key === "Escape") {
                setColumnDialog({ ...columnDialog, open: false });
              }
            }}
          />
          <TextField
            margin="dense"
            label="Column Description"
            fullWidth
            variant="standard"
            value={columnDialog.description}
            onChange={(e) =>
              setColumnDialog({ ...columnDialog, description: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onColumnDialogSave();
              }
              if (e.key === "Escape") {
                setColumnDialog({ ...columnDialog, open: false });
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnDialog({ ...columnDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={onColumnDialogSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== COLUMN DELETE CONFIRM ===== */}
      <Dialog
        open={columnDeleteDialog.open}
        onClose={() =>
          setColumnDeleteDialog({ ...columnDeleteDialog, open: false })
        }
      >
        <DialogTitle>Delete Column</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the column &quot;
            <strong>{columnDeleteDialog.title}</strong>&quot; and all its cards? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setColumnDeleteDialog({ ...columnDeleteDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button onClick={onColumnDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== CARD ADD/EDIT DIALOG (with Sprint single-select) ===== */}
      <Dialog
        open={cardDialog.open}
        onClose={() => setCardDialog({ ...cardDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <div className="text-lg font-semibold px-4 p-2">
          {cardDialog.mode === "add" ? "Add Task" : "Edit Task"}
        </div>
        <div className="px-4">
          <div className="flex flex-col gap-1">
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              variant="standard"
              value={cardDialog.title}
              onChange={(e) =>
                setCardDialog({ ...cardDialog, title: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onCardDialogSave();
                }
                if (e.key === "Escape") {
                  setCardDialog({ ...cardDialog, open: false });
                }
              }}
            />

            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="standard"
              multiline
              minRows={3}
              value={cardDialog.description}
              onChange={(e) =>
                setCardDialog({ ...cardDialog, description: e.target.value })
              }
            />

            {/* Sprint single-select (Autocomplete) */}
            <div>
              <Autocomplete
                options={sprintsList}
                getOptionLabel={(opt) => opt?.name || ""}
                value={
                  cardDialog.sprint
                    ? (sprintsList.find(s => s.id === cardDialog.sprint.id) || cardDialog.sprint)
                    : null
                }
                onChange={(e, newValue) => setCardDialog(prev => ({ ...prev, sprint: newValue }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sprint"
                    variant="standard"
                    placeholder="Select sprint (optional)"
                  />
                )}
                disableClearable={false}
              />
            </div>

            {/* Assignees */}
            <div>
              <Autocomplete
                multiple
                options={usersList}
                getOptionLabel={(opt) => opt.name || ""}
                value={usersList.filter((u) =>
                  cardDialog?.assignees?.map((a) => a?.id)?.includes(u.id)
                )}
                onChange={(e, newValue) =>
                  setCardDialog({
                    ...cardDialog,
                    assignees: newValue
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assignees"
                    variant="standard"
                  />
                )}
              />
            </div>

            {/* Priority / Estimate / Due date */}
            <div className="py-2">
              <select
                value={cardDialog.priority}
                onChange={(e) => setCardDialog({ ...cardDialog, priority: e.target.value })}
                className="w-full h-full outline-none px-2 py-3 border rounded text-sm"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              {/* <TextField
                margin="dense"
                label="Estimate (pts / hrs)"
                variant="standard"
                value={cardDialog.estimate}
                onChange={(e) => setCardDialog({ ...cardDialog, estimate: e.target.value })}
              /> */}

            </div>

            <div>
              <TextField
                margin="dense"
                className="w-full"
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                variant="standard"
                value={cardDialog.dueDate}
                onChange={(e) => setCardDialog({ ...cardDialog, dueDate: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div>
              <TextField
                margin="dense"
                label="Tags (comma separated)"
                fullWidth
                variant="standard"
                value={cardDialog.tagsInput}
                onChange={(e) => setCardDialog({ ...cardDialog, tagsInput: e.target.value })}
                onBlur={onCardTagsApply}
                helperText="Press comma or blur to apply tags"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {cardDialog.tags.map(t => (
                  <div key={t} className="text-xs px-2 py-0.5 rounded-full border flex items-center gap-1">
                    <span>{t}</span>
                    <button
                      onClick={() => setCardDialog(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }))}
                      className="text-xs pl-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  id="kanban-attach"
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length) {
                      onCardAttachFiles(e.target.files);
                      e.target.value = null;
                    }
                  }}
                />
                <div className="text-xs text-gray-500">Upload attachments (will be stored base64)</div>
              </div>

              <div className="mt-2 flex flex-col gap-1">
                {cardDialog?.attachments?.map(att => (
                  <div key={att?.id} className="flex items-center gap-2 text-xs">
                    <span className="truncate max-w-[220px]">{att?.name}</span>
                    <a href={att?.base64} target="_blank" rel="noreferrer" className="underline text-xs">open</a>
                    <button
                      onClick={() => onCardRemoveAttachment(att?.id)}
                      className="text-xs ml-auto"
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        <DialogActions>
          <button className="py-1 px-3 rounded-md bg-gray-200 " onClick={() => setCardDialog({ ...cardDialog, open: false })}>
            Cancel
          </button>
          <button className="py-1 px-3 rounded-md bg-green-600 text-white" onClick={onCardDialogSave} variant="contained" color="primary">
            Save
          </button>
        </DialogActions>
      </Dialog>

      {/* ===== CARD DELETE CONFIRM ===== */}
      <Dialog
        open={cardDeleteDialog.open}
        onClose={() => setCardDeleteDialog({ ...cardDeleteDialog, open: false })}
      >
        <DialogTitle>Delete Card</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the card &quot;
            <strong>{cardDeleteDialog.title}</strong>&quot;? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDeleteDialog({ ...cardDeleteDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={onCardDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

/* ==========================
   PropTypes (updated)
   ========================== */
KanbanBoard.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string
    })
  ),
  cards: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        assignees: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
        priority: PropTypes.string,
        status: PropTypes.string,
        estimate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        dueDate: PropTypes.string,
        sprint: PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string
        }),
        tags: PropTypes.arrayOf(PropTypes.string),
        attachments: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            type: PropTypes.string,
            base64: PropTypes.string,
            size: PropTypes.number
          })
        ),
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string
      })
    )
  ),
  controlled: PropTypes.bool,
  onColumnAdd: PropTypes.func,
  onColumnEdit: PropTypes.func,
  onColumnDelete: PropTypes.func,
  onCardAdd: PropTypes.func,
  onCardEdit: PropTypes.func,
  onCardDelete: PropTypes.func,
  onDragEnd: PropTypes.func,
  projectInfo: PropTypes.object,
  usersList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  })),
  sprintsList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }))
};

KanbanBoard.defaultProps = {
  columns: [],
  cards: {},
  controlled: false,
  usersList: [],
  sprintsList: []
};
