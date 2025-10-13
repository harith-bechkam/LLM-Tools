import React from "react";
import './style.css'

export default function Sidebar({ chats = [], onSelect, activeChatId }) {
    return (
        <div className="chat-list">
            {chats.map(c => (
                <div key={c.chat_id} className="chat-item" onClick={() => onSelect(c.chat_id)} style={{ border: c.chat_id === activeChatId ? "1px solid rgba(16,185,129,0.25)" : "none" }}>
                    <div className="title">{c.title}</div>
                    <div className="muted">{c.last_message ? c.last_message.substring(0, 80) : "No messages yet"}</div>
                </div>
            ))}
        </div>
    );
}
