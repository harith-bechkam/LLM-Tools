import { useState } from "react";
import axios from "axios";
import './style.css';

export default function ResumeScorer() {
    const [jobDesc, setJobDesc] = useState("");
    const [file, setFile] = useState(null);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleDescChange = (e) => setJobDesc(e.target.value);

    const handleSubmit = async () => {
        if (!file || !jobDesc.trim()) {
            setError("Please provide a job description and upload a resume.");
            return;
        }

        setLoading(true);
        setError("");
        setScore(null);

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobDescription", jobDesc);

        try {
            const res = await axios.post("http://127.0.0.1:5000/score", formData);
            setScore(res.data.score);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error) setError(err.response.data.error);
            else setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scorer-container">
            <div className="scorer-card">
                <h2 className="scorer-title">Resume Scorer</h2>

                <label className="scorer-label">Job Description</label>
                <textarea
                    className="scorer-textarea"
                    rows={6}
                    placeholder="Paste job description here..."
                    value={jobDesc}
                    onChange={handleDescChange}
                />

                <label className="scorer-label">Upload Resume (.pdf/.docx)</label>
                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="scorer-file"
                />
                {file && <div className="scorer-file-name">{file.name}</div>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="scorer-btn"
                >
                    {loading ? "Scoring..." : "Score Resume"}
                </button>

                {error && <div className="scorer-alert scorer-error">{error}</div>}
                {score !== null && <div className="scorer-alert scorer-score">Resume Score: <strong>{score}%</strong></div>}
            </div>
        </div>
    );
}
