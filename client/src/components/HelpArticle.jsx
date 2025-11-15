// src/components/HelpArticle.jsx
import React, { useState } from "react";

export default function HelpArticle({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center"
      >
        <span className="font-medium text-gray-800">{question}</span>
        <span className="text-gray-500">{open ? "-" : "+"}</span>
      </button>

      {open && (
        <div className="mt-2 text-sm text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
