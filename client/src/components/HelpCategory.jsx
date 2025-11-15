// src/components/HelpCategory.jsx
import React from "react";
import HelpArticle from "./HelpArticle";

export default function HelpCategory({ title, articles }) {
  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>

      {articles.map(article => (
        <HelpArticle
          key={article.id}
          question={article.question}
          answer={article.answer}
        />
      ))}
    </div>
  );
}
