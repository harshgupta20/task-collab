import React, { useRef, useEffect, useState } from "react";

export default function FloatingMiniChat({
  open = false,
  onClose = () => {},
  messages = [],
  onSend = () => {},
  title = "Project Assistant",
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-[90]"
          onClick={onClose}
        />
      )}

      {/* Sliding Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-gray-300
        flex flex-col z-[100] transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="text-sm font-medium text-gray-800">{title}</div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pr-2 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm
                ${msg.role === "user"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your message..."
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-green-400 focus:ring focus:ring-green-200 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
