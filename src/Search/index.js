import React, { useState, useEffect } from "react";
import axios from "axios";
import { Offcanvas, Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiTrash2, FiFileText, FiSearch, FiZap } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import './style.css';

export default function SearchAISummary() {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [topKFiles, setTopKFiles] = useState(3);
    const [topKChunks, setTopKChunks] = useState(5);
    const [searchResult, setSearchResult] = useState("");
    const [aiSummary, setAiSummary] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [searching, setSearching] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const API_BASE = "http://127.0.0.1:8000";

    useEffect(() => { fetchDocuments(); }, []);

    const fetchDocuments = async () => {
        setLoadingDocs(true);
        try {
            const res = await axios.get(`${API_BASE}/documents/details`);
            setDocuments(res.data.documents);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to fetch documents.");
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.post(`${API_BASE}/upload`, formData);
            fetchDocuments();
            toast.success("File uploaded successfully");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearchResult("");
        setAiSummary("");
        setSearching(true);
        try {
            const res = await axios.get(`${API_BASE}/search`, {
                params: { query: searchQuery, top_k_files: topKFiles, top_k_chunks: topKChunks }
            });
            setSearchResult(res.data || "");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Search failed.");
        } finally {
            setSearching(false);
        }
    };

    const handleAiSummary = async () => {
        if (!searchResult) return;
        setGenerating(true);
        setAiSummary("");
        try {
            const res = await axios.post(`${API_BASE}/summary`, { summary_input_for_llm: searchResult?.summary_input_for_llm });
            setAiSummary(res.data.summary);
        } catch (err) {
            toast.error(err.response?.data?.detail || "AI summary generation failed.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await axios.delete(`${API_BASE}/documents/delete`, { data: { file_id: fileId } });
            fetchDocuments();
            toast.success("Document deleted successfully");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Delete failed.");
        }
    };

    const renderTooltip = (msg) => <Tooltip>{msg}</Tooltip>;

    return (
        <div className="dashboard-wrapper">
            {/* Hot toast container */}
            <Toaster position="top-right" reverseOrder={false} />

            {/* Top Bar */}
            <motion.div className="top-bar-container"
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Row 1: Search + Icons */}
                <div className="top-bar-row top-bar-row-1">
                    <input
                        type="text"
                        placeholder="Type your query..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={async (e) => { if (e.key === "Enter") await handleSearch(); }}
                    />
                    <div className="top-bar-right">
                        <OverlayTrigger overlay={renderTooltip("Search")} delay={{ show: 0, hide: 0 }}>
                            <button className="icon-btn search-btn" onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                                {searching ? <Spinner animation="grow" size="sm" /> : <FiSearch />}
                            </button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={renderTooltip("AI Summary")} delay={{ show: 0, hide: 0 }}>
                            <button className={`icon-btn ai-summary-btn ${generating ? "twinkle" : ""}`} onClick={handleAiSummary} disabled={generating || !searchResult}>
                                {generating ? <Spinner animation="grow" size="sm" /> : <FiZap />}
                            </button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={renderTooltip("Upload Document")} delay={{ show: 0, hide: 0 }}>
                            <label className="icon-btn upload-btn">
                                <input type="file" onChange={handleUpload} style={{ display: "none" }} />
                                {uploading ? <Spinner animation="border" size="sm" /> : <FiUpload />}
                            </label>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={renderTooltip("Knowledge Base")} delay={{ show: 0, hide: 0 }}>
                            <button className="icon-btn sidebar-btn" onClick={() => setShowSidebar(true)}>
                                <FiFileText />
                            </button>
                        </OverlayTrigger>
                    </div>
                </div>

                {/* Row 2: Top K inputs */}
                <div className="top-bar-row top-bar-row-2 my-2">
                    <div className="topk-input-wrapper">
                        <span className="topk-label">Files</span>
                        <input type="number" min={1} className="topk-input-modern" value={topKFiles} onChange={(e) => setTopKFiles(Number(e.target.value))} />
                    </div>
                    <div className="topk-input-wrapper">
                        <span className="topk-label">Chunks</span>
                        <input type="number" min={1} className="topk-input-modern" value={topKChunks} onChange={(e) => setTopKChunks(Number(e.target.value))} />
                    </div>
                </div>
            </motion.div>

            <div className="search-results-container mt-3">
                <AnimatePresence>
                    {searchResult && (
                        <motion.div
                            className="search-result-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {searchResult.query && (
                                <div className="search-query-header mb-3">
                                    <h5>Query: <span className="query-text">{searchResult.query}</span></h5>
                                </div>
                            )}

                            {generating && (
                                <div className="placeholder-text">
                                    <div className="placeholder-row-full-width"></div>
                                    <div className="placeholder-row-full-width"></div>
                                    <div className="placeholder-row-half-width"></div>
                                </div>
                            )}
                            {aiSummary && (
                                <div className="ai-summary-container mt-3">
                                    <h5>AI Summary:</h5>
                                    {aiSummary.split("\n").map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            )}

                            {Array.isArray(searchResult.matched_files) &&
                                searchResult.matched_files.map((file) => (
                                    <motion.div
                                        key={file.file_id}
                                        className="search-result-card"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="search-result-header">
                                            <h5><FiFileText className="me-2" />{file.file_name}</h5>
                                            <span className="file-id">ID: {file.file_id}</span>
                                        </div>

                                        <div className="file-content">
                                            <strong>File Preview:</strong>
                                            <p className="file-preview">
                                                {file.file_content
                                                    ? file.file_content.slice(0, 200) + (file.file_content.length > 200 ? "..." : "")
                                                    : "(No content)"}
                                            </p>
                                        </div>

                                        <div className="chunk-section mt-2">
                                            <strong>Relevant Chunks ({file.relevant_chunks.length}):</strong>
                                            <ul className="chunk-list">
                                                {file.relevant_chunks.map((chunk, cidx) => (
                                                    <li key={cidx} className="chunk-item">
                                                        <span className="chunk-index">#{chunk.chunk_index}</span>
                                                        <span className="chunk-text">{chunk.chunk_content}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>



            {/* Knowledge Base Sidebar */}
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="end" className="kb-offcanvas">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Knowledge Base</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="kb-body">
                    {loadingDocs ? (
                        <div className="d-flex justify-content-center align-items-center mt-3">
                            <Spinner size={'sm'} animation="border" />&nbsp; Loading documents...
                        </div>
                    ) : (
                        documents.map(doc => (
                            <motion.div
                                key={doc.id}
                                className="kb-card-modern"
                                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="kb-card-header">
                                    <h6>{doc.file_name}</h6>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(doc.id)}>
                                        <FiTrash2 />
                                    </Button>
                                </div>
                                <p className="kb-chunks">Chunks: {doc.chunks_count}</p>
                            </motion.div>
                        ))
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}
