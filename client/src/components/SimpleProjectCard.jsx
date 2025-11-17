import { useState } from 'react'
import { Link } from 'react-router';
import { MdCreate } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import ProjectCard from './ProjectsDetailsCard';
import { MdOpenWith } from "react-icons/md";
import { Tooltip } from '@mui/material';
import { truncateString } from '../utils/utils';

const SimpleProjectCard = ({ projectData, index, onEditClick, handleDeleteProject }) => {

    const [openDetails, setOpenDetails] = useState(false);

    return (
        <div key={index} className="flex justify-between items-start gap-2 w-[300px] h-fit border border-gray-200 rounded-md p-3 hover:bg-gray-100">
            <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                    <Link to={`/projects/${projectData.id}`} className="hover:underline">
                        {projectData.project_name}
                    </Link>
                    <Tooltip title="Open Project Details">
                        <MdOpenWith className='text-gray-300 cursor-pointer' size={18} onClick={(e) => {
                            setOpenDetails(true)
                            e.stopPropagation();
                        }} />
                    </Tooltip>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                    {truncateString(projectData.project_description || "", 30) || "No Description..."}
                </div>

                <div className="text-xs text-gray-400 mt-4">Created by {'<'}Temp Name{'>'}</div>
            </div>
            <div className="flex flex-col items-end gap-1 ml-2">
                <button
                    title="Edit"
                    onClick={() => {
                        onEditClick({ status: true, data: projectData });
                        // if (newTitle === null) return;
                        // handleEditCard("columnId", "card.id", { title: newTitle });
                    }}
                    className="text-md px-2 py-1 text-green-600 rounded hover:bg-gray-200 cursor-pointer"
                >
                    <MdCreate />
                </button>
                <button
                    title="Delete"
                    onClick={() => {
                        if (window.confirm(`Delete ${projectData.project_name}? This cannot be undone.`)) {
                            handleDeleteProject(projectData.id);
                        }
                    }}
                    className="text-md px-2 py-1 text-red-600 rounded hover:bg-gray-200 cursor-pointer"
                >
                    <MdDelete />
                </button>
            </div>

            <ProjectCard open={openDetails} onClose={() => setOpenDetails(false)} projectData={projectData} />
        </div>
    )
}

export default SimpleProjectCard