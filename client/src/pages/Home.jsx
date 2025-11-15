import React from 'react'
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiList
} from "react-icons/fi";

const Home = () => {
  return (
    <div className="w-full h-full p-6 space-y-6 bg-white">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your workspace</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-2 top-2.5 text-gray-400" />
            <input
              placeholder="Search..."
              className="bg-white text-gray-700 border border-gray-300 pl-8 pr-3 py-2 rounded-lg outline-none focus:border-gray-500"
            />
          </div>

          {/* Quick Add */}
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700">
            <FiPlus /> New
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Total Projects", value: "12", icon: <FiList /> },
          { title: "Active Tasks", value: "34", icon: <FiClock /> },
          { title: "Completed Today", value: "9", icon: <FiCheckCircle /> },
          { title: "Team Members", value: "7", icon: <FiUsers /> }
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-gray-500 text-xs">{item.title}</p>
              <h2 className="text-xl font-semibold text-gray-800">{item.value}</h2>
            </div>
            <div className="text-gray-400 text-2xl">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Activity Stream */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-lg text-gray-800 font-semibold mb-4">Activity Stream</h2>
            <div className="space-y-4">
              {[
                "Harsh updated task 'Prepare pitch deck'",
                "You created a new project 'Marketing Launch'",
                "Riya commented on 'API Integration'",
                "Arjun completed task 'Design Homepage'"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <p className="text-gray-700 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Boards */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-lg text-gray-800 font-semibold mb-4">Recent Boards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Product Roadmap", "Kanban Board", "Client Work", "Team Tasks"].map(
                (b, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {b}
                  </div>
                )
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Assigned To Me */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Assigned to You</h2>
            <div className="space-y-3">
              {["Fix login bug", "Draft meeting notes", "Design header UI"].map(
                (task, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700"
                  >
                    {task}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-lg text-gray-800 font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <button className="bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700">
                New Task
              </button>
              <button className="bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700">
                New Board
              </button>
              <button className="bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700">
                Invite User
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Home