import React, { useState } from "react";

export default function ReplyMaker() {
  const [contextText, setContextText] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [purpose, setPurpose] = useState("reply");
  const [generated, setGenerated] = useState("");
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!contextText.trim()) {
      setGenerated("Please enter some context first.");
      return;
    }

    setIsGenerating(true);
    setGenerated("Generating...");
    
    try {
      const prompt = `
        Write a ${tone} ${purpose} message (approx ${length} characters)
        in response to the following context:

        "${contextText}"

        Recipient: ${recipient || "unspecified"}
      `;
      
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are a professional reply generator that writes concise, natural messages." 
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });
      
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || "No reply generated.";
      setGenerated(reply);

      const entry = {
        id: Date.now(),
        context: contextText,
        recipient,
        tone,
        length,
        purpose,
        text: reply,
        createdAt: new Date().toISOString(),
      };
      setHistory([entry, ...history].slice(0, 50));
    } catch (err) {
      console.error(err);
      setGenerated("❌ Error generating reply. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generated);
  }

  function downloadReply() {
    const blob = new Blob([generated], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reply-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setContextText("");
    setRecipient("");
    setGenerated("");
  }

  function loadFromHistory(entry) {
    setContextText(entry.context);
    setRecipient(entry.recipient);
    setTone(entry.tone);
    setLength(entry.length);
    setPurpose(entry.purpose);
    setGenerated(entry.text);
  }

  const wordCount = generated.split(' ').filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8 grid md:grid-cols-3 gap-6">
        
        {/* Left Panel: Inputs */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold mb-4">AI Reply Maker</h1>
          <p className="text-gray-500 mb-3">Generate professional replies using AI</p>

          <label className="block text-sm font-medium text-gray-700">Context / Incoming Message</label>
          <textarea 
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            rows="5" 
            placeholder="Paste the message here..."
          />

          <label className="block text-sm font-medium text-gray-700">Recipient (optional)</label>
          <input 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="e.g. John, Team, Customer"
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Length</label>
              <select 
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="short">Short (0-100)</option>
                <option value="medium" selected>Medium (100-200)</option>
                <option value="long">Long (200+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <select 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="reply">Reply</option>
                <option value="small talk">Small talk</option>
                <option value="action">Action</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-2xl shadow disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Reply"}
            </button>
            <button 
              onClick={clearAll}
              className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-2xl"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel: Generated Reply */}
        <aside className="bg-gray-50 p-4 rounded-2xl shadow-md flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Generated Reply</h2>
          <textarea 
            value={generated || "Generated reply will appear here..."}
            readOnly
            className="w-full p-3 border rounded-lg resize-none h-40 bg-white"
          />
          <div className="flex gap-2 mt-3">
            <button 
              onClick={copyToClipboard}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
              disabled={!generated}
            >
              Copy
            </button>
            <button 
              onClick={downloadReply}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              disabled={!generated}
            >
              Download
            </button>
          </div>
          <div className="mt-3 text-gray-500 text-sm">
            Character count: {generated.length} | Word count: {wordCount}
          </div>
        </aside>
      </div>
    </div>
  );
}
