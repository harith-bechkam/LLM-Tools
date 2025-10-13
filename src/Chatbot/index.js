import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import './style.css'

const API_BASE = "http://0.0.0.0:8000";

export default function Index() {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);

    async function fetchChats() {
        const res = await fetch(`${API_BASE}/chats`);
        const data = await res.json();
        setChats(data);
        if (!activeChatId && data.length) {
            setActiveChatId(data[0].chat_id);
        }
    }

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

    async function loadChat(chatId) {
        setActiveChatId(chatId);
        const res = await fetch(`${API_BASE}/chats/${chatId}`);
        const msgs = await res.json();
        setMessages(msgs);
    }

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

        // Add user message immediately (optimistic update)
        const userMessage = { role: "user", content: text };
        setMessages(prev => [...prev, userMessage]);

        // Send to backend
        try {
            const res = await fetch(`${API_BASE}/chats/${activeChatId}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            // Replace the last user+assistant with backend response
            setMessages(data.messages);
            await fetchChats();
        } catch (err) {
            // Show error inline in chat
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
                </div>
                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <strong>{chats.find(c => c.chat_id === activeChatId)?.title || "No chat selected"}</strong>
                    </div>
                    <ChatWindow messages={messages} onSend={sendMessage} />
                </div>
            </div>
        </div>
    );
}
