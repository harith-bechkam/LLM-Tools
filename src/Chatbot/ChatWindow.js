import React, { useState, useRef, useEffect } from "react";
import './style.css'

export default function ChatWindow({ messages = [], onSend }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const boxRef = useRef();

    useEffect(() => {
        if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }, [messages, streamingMessage]);

    async function handleSend() {
        const trimmed = text.trim();
        if (!trimmed) return;
        setText("");
        setLoading(true);
        setStreamingMessage("");

        // Optimistic user message
        const userMessage = { role: "user", content: trimmed };
        onSend(trimmed, (assistantStream) => {
            // Streaming callback
            setStreamingMessage(assistantStream);
        });

        setLoading(false);
    }

    function onKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <>
            <div className="messages" ref={boxRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`message ${m.role}`}>
                        {m.content}
                        {m.role === "assistant" &&
                            <span className="copy-icon" onClick={() => navigator.clipboard.writeText(m.content)}>📋</span>
                        }
                    </div>
                ))}
                {loading && streamingMessage && (
                    <div className="message assistant">
                        {streamingMessage}
                        <span className="copy-icon" onClick={() => navigator.clipboard.writeText(streamingMessage)}>📋</span>
                    </div>
                )}
            </div>
            <div className="input-area">
                <textarea
                    placeholder="Type a message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={onKey}
                    rows={1}
                />
                <button className="button" onClick={handleSend}>Send</button>
            </div>
        </>
    );
}
