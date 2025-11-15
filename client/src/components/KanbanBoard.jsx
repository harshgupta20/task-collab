// KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Autocomplete
} from "@mui/material";
import { RiFileExcel2Fill } from "react-icons/ri";
import FloatingMiniChat from "../components/MiniChat";
import { BsStars } from "react-icons/bs";
import { truncateString } from "../utils/utils";
import EmptyKanbanSvg from "../assets/empty-kanban.svg";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router";
import { MdViewKanban } from "react-icons/md";

/**
 * Utility: simple unique id generator
 */
const uid = (prefix = "") =>
  prefix + uuidv4().replace(/-/g, "");

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
  usersList=[]
}) {
  // Local state (when uncontrolled)
  const [columns, setColumns] = useState(initialColumns);
  const [cards, setCards] = useState(initialCards);

  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const navigate = useNavigate();

  // Sync props -> state when props change
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // Safe setters
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
  // Handlers (same as before, extended card shape)
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

  const makeEmptyCard = (overrides = {}) => ({
    id: uid("card-"),
    title: "Untitled",
    description: "",
    assignees: [], // array of strings (names, ids, emails) - multi-select
    priority: "Medium", // Low | Medium | High | Critical
    status: "", // optional freeform / or derived from column
    estimate: "", // story points or hours (string/number)
    dueDate: "", // ISO date string
    tags: [], // array of strings
    attachments: [], // array of { id, name, type, base64 }
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

  // Drag & Drop handler
  const internalOnDragEnd = (result) => {
    if (onDragEnd) onDragEnd(result);
    if (!result.destination) return;

    const { source, destination } = result;
    const srcColId = source.droppableId;
    const dstColId = destination.droppableId;
    const srcIndex = source.index;
    const dstIndex = destination.index;

    if (srcColId === dstColId) {
      if (!controlled) {
        safeSetCards((prev) => {
          const list = Array.from(prev[srcColId] || []);
          const [moved] = list.splice(srcIndex, 1);
          list.splice(dstIndex, 0, moved);
          return { ...prev, [srcColId]: list };
        });
      }
    } else {
      if (!controlled) {
        safeSetCards((prev) => {
          const srcList = Array.from(prev[srcColId] || []);
          const dstList = Array.from(prev[dstColId] || []);
          const [moved] = srcList.splice(srcIndex, 1);
          dstList.splice(dstIndex, 0, moved);
          return { ...prev, [srcColId]: srcList, [dstColId]: dstList };
        });
      }
    }
  };

  // ================================
  // DIALOG STATE
  // ================================
  // Column Add/Edit dialog state
  const [columnDialog, setColumnDialog] = useState({
    open: false,
    mode: "add", // "add" or "edit"
    columnId: null,
    title: "",
    description: ""
  });

  // Column Delete confirmation dialog
  const [columnDeleteDialog, setColumnDeleteDialog] = useState({
    open: false,
    columnId: null,
    title: ""
  });

  // Card Add/Edit dialog state (expanded fields)
  const [cardDialog, setCardDialog] = useState({
    open: false,
    mode: "add", // "add" or "edit"
    columnId: null,
    cardId: null,
    title: "",
    description: "",
    assignees: [],
    priority: "Medium",
    status: "",
    estimate: "",
    dueDate: "",
    tagsInput: "", // temporary comma-separated input
    tags: [],
    attachments: [], // array of { id, name, type, base64 }
  });

  // Card Delete confirmation dialog
  const [cardDeleteDialog, setCardDeleteDialog] = useState({
    open: false,
    columnId: null,
    cardId: null,
    title: ""
  });

  // ================================
  // DIALOG OPENERS
  // ================================
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
      title: card.title,
      description: card.description || "",
      assignees: Array.isArray(card.assignees) ? card.assignees.slice() : [],
      priority: card.priority || "Medium",
      status: card.status || "",
      estimate: card.estimate || "",
      dueDate: card.dueDate || "",
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
  // Card Dialog helpers
  // ================================
  // Convert selected FileList to base64 entries (returns Promise)
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
            base64: ev.target.result // data:<type>;base64,...
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
      // swallow; could expose UI error later
      // console.error("file read error", err);
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
  // DIALOG CONFIRM HANDLERS
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
    const trimmedTitle = cardDialog.title.trim();
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
  // Render helpers
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
  // Render Card
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
                          {typeof a === "string" ? a.split(" ").map(p => p[0]).join("").slice(0, 2) : "U"}
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


  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);

    // Your AI logic here
    const reply = await myAI(text);
    setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
  };

  const columnList = columns || [];
  return (
    <div className="w-full h-full">
      <div className="mb-4 flex items-center gap-2 border border-green-200 p-2 rounded-lg">
        <div className="flex items-center gap-1">
          <MdViewKanban className="w-7 h-7 text-green-600" />
          <span className="font-semibold text-gray-800">{projectInfo?.project_name}</span>
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
                      className={`flex-1 min-h-20 overflow-y-auto pb-2 pr-1 ${snapshot.isDraggingOver ? "bg-gray-200" : ""
                        }`}
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
                    + Add card
                  </button>
                </div>
              </div>
            ))}

            {/* <div className="min-w-[280px] flex items-center justify-center">
              <div className="w-full h-full flex items-start">
                <div className="w-full border-dashed border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center text-sm">
                  Drag cards between columns
                </div>
              </div>
            </div> */}
          </div>
        </DragDropContext>

        {/* <div>
          <img src={EmptyKanbanSvg} alt="empty_kanban_svg" />
        </div> */}
        {columnList.length === 0 && (
          <div className="flex flex-col gap-6 m-auto h-full items-center w-[300px] rounded-md p-3">
            <img src={EmptyKanbanSvg} alt="empty_kanban_svg" />
            <div className="font-medium text-sm">Create columns to get started</div>
          </div>
        )}
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

      {/* ===== COLUMN DELETE CONFIRM DIALOG ===== */}
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

      {/* ===== CARD ADD/EDIT DIALOG (expanded fields) ===== */}
      <Dialog
        open={cardDialog.open}
        onClose={() => setCardDialog({ ...cardDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {cardDialog.mode === "add" ? "Add Card" : "Edit Card"}
        </DialogTitle>
        <DialogContent dividers>
          <div className="flex flex-col gap-3">
            <TextField
              autoFocus
              margin="dense"
              label="Card Title"
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

            {/* Assignees: simple multi-select via comma-separated input for minimal UI */}
            <div>
              <Autocomplete
                multiple
                options={usersList}
                getOptionLabel={(opt) => opt.name}
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

            {/* Priority & Estimate & Due date */}
            <div className="flex gap-2 items-center">
              <select
                value={cardDialog.priority}
                onChange={(e) => setCardDialog({ ...cardDialog, priority: e.target.value })}
                className="px-2 py-1 border rounded text-sm"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <TextField
                margin="dense"
                label="Estimate (pts / hrs)"
                variant="standard"
                value={cardDialog.estimate}
                onChange={(e) => setCardDialog({ ...cardDialog, estimate: e.target.value })}
              />

              <TextField
                margin="dense"
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                variant="standard"
                value={cardDialog.dueDate}
                onChange={(e) => setCardDialog({ ...cardDialog, dueDate: e.target.value })}
              />
            </div>

            {/* Tags input */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDialog({ ...cardDialog, open: false })}>
            Cancel
          </Button>
          <Button onClick={onCardDialogSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== CARD DELETE CONFIRM DIALOG ===== */}
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
        assignees: PropTypes.arrayOf(PropTypes.object),
        priority: PropTypes.string,
        status: PropTypes.string,
        estimate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        dueDate: PropTypes.string,
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
  onDragEnd: PropTypes.func
};
