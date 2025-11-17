// KanbanPage.jsx
import { useEffect, useState } from "react";
import KanbanBoard from "../components/KanbanBoard";
import { useNavigate, useParams } from "react-router";
import { addData, customQueryCollection, deleteData, getData, setData, updateData } from "../firebase/firestore";
import { toast } from "sonner";
import { MdArrowBack } from "react-icons/md";
import { sendEmail } from "../utils/sendEmail";
// import KanbanBoard from "./KanbanBoard";

export default function KanbanPage() {
    const [columns, setColumns] = useState([
        // { id: "todo", title: "To Do" },
        // { id: "inprogress", title: "In Progress" },
        // { id: "done", title: "Done" }
    ]);

    const { projectId } = useParams();
    const [cards, setCards] = useState({});
    const navigate = useNavigate();
    const [projectInfo, setProjectInfo] = useState({});
    const [usersList, setUsersList] = useState([]);

    const fetchCardsData = async () => {
        try {
            const response = await customQueryCollection("project_entry", [["project_id", "==", projectId]]);

            let formattedData = {};
            response?.forEach((data) => {
                formattedData = {
                    ...formattedData,   // <- keep previous data
                    [data?.columnn_id]: [
                        ...(formattedData[data?.columnn_id] || []),   // fallback to []
                        {
                            id: data?.entry_uuid,
                            title: data?.entry_name,
                            description: data?.entry_description,
                            assignees: JSON.parse(data?.entry_assignees),
                            attachments: JSON.parse(data?.entry_attachments),
                            dueDate: data?.entry_due_date,
                            estimate: data?.entry_estimation_hours,
                            priority: data?.entry_priority,
                            tags: JSON.parse(data?.entry_tags),
                            sprint: data?.entry_sprint_id ? { id: data?.entry_sprint_id } : null,
                        }
                    ]
                };
            });

            setCards(formattedData);
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to fetch cards');
        }
    }

    const handleCardAdd = async (columnId, newCard) => {
        try {
            const data = {
                project_id: projectId,
                columnn_id: columnId,
                entry_name: newCard.title,
                entry_description: newCard.description,
                entry_uuid: newCard.id,
                entry_assignees: JSON.stringify(newCard.assignees),
                entry_attachments: JSON.stringify(newCard.attachments),
                entry_due_date: newCard.dueDate,
                entry_estimation_hours: newCard.estimate,
                entry_priority: newCard.priority,
                entry_tags: JSON.stringify(newCard.tags),
            }
            delete data?.id;
            const response = await setData("project_entry", newCard.id, data);
            fetchColumns();
            toast.success('Card added successfully');
            const emailResponse = await sendEmail({
                to: newCard.assignees.map((a) => a.email),
                subject: "A new task assigned to you.",
                innerSubject: "Task Alloted",
                update_type: "Task",
                updated_by: "Project Admin",
                task_status: newCard?.priority,
                task_priority: newCard?.priority,
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
        catch (error) {
            toast.warning(error?.message || 'Failed to add card');
        }

        // setCards((prev) => ({ ...prev, [columnId]: [...(prev[columnId] || []), newCard] }));
    };
    const handleCardEdit = async (columnId, cardId, updated) => {
        try {
            const data = {
                // project_id: projectId,
                // columnn_id: columnId,
                entry_name: updated.title,
                entry_description: updated.description,
                entry_uuid: updated.id,
                entry_assignees: JSON.stringify(updated.assignees),
                entry_attachments: JSON.stringify(updated.attachments),
                entry_due_date: updated.dueDate,
                entry_estimation_hours: updated.estimate,
                entry_priority: updated.priority,
                entry_tags: JSON.stringify(updated.tags),
                entry_sprint_id: updated?.sprint?.id || null,
            }

            const response = await updateData("project_entry", cardId, data);
            fetchColumns();
            toast.success('Card updated successfully');
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to update card');
        }
        // setCards((prev) => ({ ...prev, [columnId]: prev[columnId].map((c) => (c.id === cardId ? { ...c, ...updated } : c)) }));
    };
    const handleCardDelete = (columnId, cardId) => {
        try {
            const response = deleteData("project_entry", cardId);
            fetchColumns();
            toast.success('Card deleted successfully');
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to delete card');
        }
        // setCards((prev) => ({ ...prev, [columnId]: prev[columnId].filter((c) => c.id !== cardId) }));
    };

    const handleDrag = async (result) => {
        try {
            if (!result.destination) return;
            const src = result?.source;
            const dst = result?.destination;
            const cardId = result?.draggableId;

            // simple move logic (same as internal)
            // if (src.droppableId === dst.droppableId) {
            //     const col = src.droppableId;
            //     const list = Array.from(cards[col]);
            //     const [m] = list.splice(src.index, 1);
            //     list.splice(dst.index, 0, m);
            //     // setCards((prev) => ({ ...prev, [col]: list }));
            // } else {
            //     const srcCol = Array.from(cards[src.droppableId]);
            //     const dstCol = Array.from(cards[dst.droppableId]);
            //     const [m] = srcCol.splice(src.index, 1);
            //     dstCol.splice(dst.index, 0, m);
            //     // setCards((prev) => ({ ...prev, [src.droppableId]: srcCol, [dst.droppableId]: dstCol }));
            // }

            const response = await updateData("project_entry", cardId, { columnn_id: dst.droppableId });
            fetchColumns();
            toast.success('Card moved successfully');
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to move card');
        }
    };

    const handleAddColumn = async (newCol) => {
        try {
            const data = {
                project_id: projectId,
                column_name: newCol.title,
                column_description: newCol.description,
                column_uuid: newCol.id
            };
            await setData("project_columns", newCol.id, data);
            fetchColumns();
            toast.success('Column added successfully');
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to add column');
        }
    }

    const handleEditColumn = async (columnId, updatedData) => {
        try {
            const data = {
                project_id: projectId,
                column_name: updatedData.title,
                column_description: updatedData.description,
                column_uuid: columnId
            }

            await updateData("project_columns", columnId, data);
            fetchColumns();
            toast.success('Column updated successfully');
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to update column');
        }
    }

    const handleDeleteColumn = async (columnId) => {
        try {
            await deleteData("project_columns", columnId);
            fetchColumns();
            toast.success('Column deleted successfully');
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to delete column');
        }
    }

    const fetchColumns = async () => {
        try {
            const response = await customQueryCollection("project_columns", [["project_id", "==", projectId]]);
            setColumns(response.map(col => ({ id: col?.column_uuid, title: col?.column_name, description: col?.column_description })));
            await fetchCardsData();
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to fetch columns');
        }
    }

    const fetchProjectInfo = async () => {
        try {
            const response = await getData("projects", projectId);
            setProjectInfo(response);
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to fetch project info');
        }
    }

    const fetchUser = async () => {
        try {
            const response = await customQueryCollection("users", [["created_by", "==", "00"]]);
            setUsersList(response);
        }
        catch (error) {
            toast.warning(error?.message || 'Failed to fetch user');
        }
    }

    useEffect(() => {
        fetchProjectInfo();
        fetchColumns();
        fetchUser();
    }, [projectId])

    return (
        <div className="px-6 h-full">
            <div className="py-2">
                <button className="flex gap-2 items-center text-green-600 py-1 px-3 rounded-lg cursor-pointer" onClick={() => navigate("/projects")}>
                    <MdArrowBack /> back
                </button>
            </div>
            <KanbanBoard
                columns={columns}
                cards={cards}
                controlled={true}
                onColumnAdd={handleAddColumn}
                onColumnEdit={handleEditColumn}
                onColumnDelete={handleDeleteColumn}
                onCardAdd={handleCardAdd}
                onCardEdit={handleCardEdit}
                onCardDelete={handleCardDelete}
                onDragEnd={handleDrag}
                projectInfo={projectInfo}
                usersList={usersList}
            />
        </div>
    );
}
