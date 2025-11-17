export default function ProjectHeader({projectData}) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold text-gray-800">{projectData.project_name}</h1>
    </div>
  );
}
