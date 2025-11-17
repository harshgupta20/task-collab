import { MdAddCircle } from "react-icons/md";
import ProjectDialog from "../components/dialog/ProjectDialog";
import { useEffect, useState } from "react";
import { addData, customQueryCollection, deleteData, updateData } from "../firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Link } from "react-router";
import EmptyProjectListSvg from '../assets/empty-project.svg';

import SimpleProjectCard from "../components/SimpleProjectCard";

const Projects = () => {

  const [open, setOpen] = useState({ status: false, data: null });
  const [projects, setProjects] = useState([]);
  const [searchText, setSearchText] = useState('');

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

  useEffect(() => {
    fetchProjects();
  }, [])

  return (
    <div className="p-4 h-full">
      {/* <h1>Projects</h1>  */}

      <div className="h-full">
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <input type="text" onChange={(e) => setSearchText(e.target.value)} placeholder="Search projects..." className="border border-gray-300 rounded-md px-3 py-1 w-1/3 outline-none" />
          <button onClick={() => setOpen({ status: true, data: null })} className="bg-green-600 flex gap-2 items-center text-white py-1 px-3 rounded-md cursor-pointer"><MdAddCircle />Create Project</button>
        </div>

        <div className="flex h-full grow justify-start gap-4 flex-wrap py-4">
          {projects?.filter((projectData) => (
            projectData.project_name.toLowerCase().includes(searchText.toLowerCase()) ||
            projectData.project_description.toLowerCase().includes(searchText.toLowerCase()) ||
            projectData.created_by.toLowerCase().includes(searchText.toLowerCase())
          )).map((projectData, index) => {
            return (
              <SimpleProjectCard
                projectData={projectData}
                index={index}
                onEditClick={setOpen}
                handleDeleteProject={handleDeleteProject}
              />
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