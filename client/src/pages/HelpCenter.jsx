// src/pages/HelpCenter.jsx
import React, { useState } from "react";
import HelpCategory from "../components/HelpCategory";
import { helpData } from "../utils/helpData";

export default function HelpCenter() {
  const [search, setSearch] = useState("");

  const filteredData = helpData.map(category => ({
    ...category,
    articles: category.articles.filter(a =>
      (a.question + a.answer).toLowerCase().includes(search.toLowerCase())
    )
  }));

  return (
    <div className="w-full mx-auto p-6 space-y-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Help Center</h1>
        <p className="text-gray-600 mt-1">
          Find answers to common questions or contact support.
        </p>
      </div>

      {/* Search */}
      <div className="w-full">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>

      {/* FAQ Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map(category =>
          category.articles.length > 0 ? (
            <HelpCategory
              key={category.id}
              title={category.title}
              articles={category.articles}
            />
          ) : null
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Contact Support</h2>
        <p className="text-gray-600 text-sm mb-4">
          Can't find what you're looking for? Reach out to our support team.
        </p>

        <a
          href="mailto:support@yourapp.com"
          className="inline-block px-4 py-2 bg-black text-white text-sm rounded-md"
        >
          Email Support
        </a>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">System Status</h2>

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-gray-700">API Services</span>
          <span className="text-green-600 text-sm font-medium">Operational</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-gray-700">Authentication</span>
          <span className="text-green-600 text-sm font-medium">Operational</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-gray-700">Database</span>
          <span className="text-green-600 text-sm font-medium">Operational</span>
        </div>
      </div>
    </div>
  );
}
