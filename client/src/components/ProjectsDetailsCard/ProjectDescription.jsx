export default function ProjectDescription({projectData}) {
  return (
    <div className="mb-6">
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        rows={3}
        placeholder="Project Description..."
        value={projectData.project_description}
        readOnly
      />
    </div>
  );
}
