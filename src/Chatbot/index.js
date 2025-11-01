import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import './style.css'

const API_BASE = "http://0.0.0.0:8000";

export default function Index() {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [useMultiAgent, setUseMultiAgent] = useState(false); // Multi-agent toggle

    // Fetch all chats
    async function fetchChats() {
        const res = await fetch(`${API_BASE}/chats`);
        const data = await res.json();
        setChats(data);
        if (!activeChatId && data.length) {
            setActiveChatId(data[0].chat_id);
        }
    }

    // Create new chat
    async function createChat() {
        const res = await fetch(`${API_BASE}/chats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "", title: "New chat" })
        });
        const data = await res.json();
        await fetchChats();
        setActiveChatId(data.chat_id);
        setMessages([]);
    }

    // Load chat messages
    async function loadChat(chatId) {
        setActiveChatId(chatId);
        const res = await fetch(`${API_BASE}/chats/${chatId}`);
        const msgs = await res.json();
        setMessages(msgs);
    }

    // Send a message
    async function sendMessage(text) {
        if (!activeChatId) {
            const res = await fetch(`${API_BASE}/chats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "", title: "New chat" })
            });
            const d = await res.json();
            setActiveChatId(d.chat_id);
            await fetchChats();
        }

        // Optimistic update: show user message immediately
        const userMessage = { role: "user", content: text };
        setMessages(prev => [...prev, userMessage]);

        try {
            // Choose endpoint based on toggle
            const endpoint = useMultiAgent
                ? `${API_BASE}/multiagent/message`
                : `${API_BASE}/chats/${activeChatId}/message`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            // Update messages depending on endpoint response
            const newMessages = data.messages || [...messages, { role: "assistant", content: data.assistant }];
            setMessages(newMessages);

            // Refresh chat list to show last message
            await fetchChats();
        } catch (err) {
            setMessages(prev => [...prev, { role: "error", content: "Error: Could not get response" }]);
        }
    }

    useEffect(() => { fetchChats(); }, []);
    useEffect(() => { if (activeChatId) loadChat(activeChatId); }, [activeChatId]);

    return (
        <div className="chatbot-container">
            <div className="chatbot-card">
                <div className="chatbot-sidebar">
                    <h2>My Chats</h2>
                    <button className="new-chat-btn" onClick={createChat}>+ New chat</button>
                    <Sidebar chats={chats} activeChatId={activeChatId} onSelect={setActiveChatId} />

                    {/* Multi-agent toggle */}
                    <div style={{ marginTop: "10px" }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={useMultiAgent}
                                onChange={(e) => setUseMultiAgent(e.target.checked)}
                            />
                            Use Multi-Agent Workflow
                        </label>
                    </div>
                </div>

                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <strong>{chats.find(c => c.chat_id === activeChatId)?.title || "No chat selected"}</strong>
                        <span style={{ fontSize: "0.8em", marginLeft: "10px" }}>
                            Mode: {useMultiAgent ? "Multi-Agent" : "Single-Agent"}
                        </span>
                    </div>
                    <ChatWindow messages={messages} onSend={sendMessage} />
                </div>
            </div>
        </div>
    );
}
