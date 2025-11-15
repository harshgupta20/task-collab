import { MdAddCircle } from "react-icons/md";
import ProjectDialog from "../components/dialog/ProjectDialog";
import { useEffect, useState } from "react";
import { addData, customQueryCollection, deleteData, updateData } from "../firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Link } from "react-router";
import EmptyProjectListSvg from '../assets/empty-project.svg';
import { MdCreate } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const Projects = () => {

  const [open, setOpen] = useState({ status: false, data: null });
  const [projects, setProjects] = useState([]);

  const createProject = async ({ data }) => {
    try {
      delete data?.id;
      await addData("projects", { ...data, uuid: uuidv4(), created_by: "00" });
      fetchProjects();
      setOpen({ status: false, data: null });
      toast.success('Project created successfully');
    }
    catch (error) {
      toast.warning(error?.message || 'Failed to create project');
    }
  }

  const updateProject = async ({ data }) => {
    try {
      const id = data?.id;
      delete data?.id;
      await updateData("projects", id, data);
      fetchProjects();
      setOpen({ status: false, data: null });
      toast.success('Project updated successfully');
    }
    catch (error) {
      toast.warning(error?.message || 'Failed to update project');
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await customQueryCollection("projects", [["created_by", "==", "00"]]);
      setProjects(response);
    }
    catch (error) {
      toast.warning(error?.message || 'Failed to fetch projects');
    }
  }

  const handleDeleteProject = async (id) => {
    try {
      const response = await deleteData("projects", id);
      fetchProjects();
      toast.success('Project deleted successfully');
    }
    catch (error) {
      toast.warning(error?.message || 'Failed to delete project');
    }
  }

  const handleEditProject = async () => {
  }

  useEffect(() => {
    fetchProjects();
  }, [])
console.log("harsh projects", projects)
  return (
    <div className="p-4 h-full">
      {/* <h1>Projects</h1>  */}

      <div className="h-full">
        <div className="flex justify-end">
          <button onClick={() => setOpen({ status: true, data: null })} className="bg-green-600 flex gap-2 items-center text-white py-1 px-3 rounded-2xl cursor-pointer"><MdAddCircle />Create Project</button>
        </div>

        <div className="flex h-full grow justify-start gap-4 flex-wrap py-4">
          {projects.map((projectData, index) => {
            return (
              <div key={index} className="flex justify-between items-start gap-2 w-[300px] h-fit border border-gray-200 rounded-md p-3 hover:bg-gray-100">
                <Link to={`/projects/${projectData.id}`} className="flex-1">
                  <div className="font-medium text-sm">{projectData.project_name}</div>
                  {projectData.project_description ? (
                    <div className="text-xs text-gray-500 mt-1">
                      {projectData.project_description}
                    </div>
                  ) : null}
                  <div className="text-xs text-gray-400 mt-4">Created by {'<'}Temp Name{'>'}</div>
                </Link>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <button
                    title="Edit"
                    onClick={() => {
                      setOpen({ status: true, data: projectData });
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
              </div>
            )
          })}

          {
            projects?.length === 0 &&
            <div className="flex flex-col gap-6 m-auto h-full items-center w-[300px] rounded-md p-3">
              <img src={EmptyProjectListSvg} alt="No projects found" />
              <div className="font-medium text-sm">No projects yet</div>
            </div>
          }

        </div>

      </div>

      {
        open?.status &&
        <ProjectDialog open={open?.status} onClose={() => setOpen({ status: false, data: null })} projectData={open?.data} onSubmit={open?.data?.id ? updateProject : createProject} />
      }
    </div>
  )
}

export default Projects