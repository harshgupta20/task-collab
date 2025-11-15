import React, { useState, useRef, useEffect } from "react";

export default function AskAI() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    // Simulated AI reply (replace with your backend later)
    setTimeout(() => {
      const fakeReply = {
        role: "assistant",
        text: "This is a sample response. Connect your API here."
      };
      setMessages((prev) => [...prev, fakeReply]);
    }, 500);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-gray-100 text-black px-4 py-4">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-800 text-xl font-semibold">
        Ask AI
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl text-sm leading-relaxed 
                ${
                  msg.role === "user"
                    ? "bg-gray-500 text-white rounded-br-none"
                    : "bg-green-600 text-neutral-200 rounded-bl-none"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask something..."
            className="flex-1 bg-gray-200 border border-neutral-700 px-4 py-2 rounded-xl focus:border-neutral-500 focus:outline-none"
          />

          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
