import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: "new" | "contacted" | "converted";
}

interface Note {
  _id: string;
  content: string;
  createdAt: string;
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLead = async () => {
    try {
      const res = await API.get(`/leads/${id}`);
      setLead(res.data);
    } catch {
      toast.error("Failed to load lead");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await API.get(`/leads/${id}/notes`);
      setNotes(res.data);
    } catch {
      toast.error("Failed to load notes");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLead(), fetchNotes()]);
      setLoading(false);
    };

    loadData();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      await API.post(`/leads/${id}/notes`, { content: newNote });
      setNewNote("");
      fetchNotes();
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await API.delete(`/leads/${id}`);
      toast.success("Lead deleted");
      navigate("/leads");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  if (loading) return <div style={loadingStyle}>Loading...</div>;
  if (!lead) return <div style={loadingStyle}>Lead not found</div>;

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>{lead.name}</h2>
          <p style={{ margin: 0, color: "#666" }}>{lead.email}</p>
        </div>

        <div style={actionGroup}>
          <button onClick={() => navigate(`/leads/${id}/edit`)} style={btnPrimary}>
            Edit
          </button>
          <button onClick={handleDelete} style={btnDanger}>
            Delete
          </button>
        </div>
      </div>

      {/* INFO GRID */}
      <div style={grid}>
        <div style={card}>
          <h4>📧 Contact</h4>
          <p><strong>Email:</strong> {lead.email}</p>
          <p><strong>Phone:</strong> {lead.phone || "—"}</p>
        </div>

        <div style={card}>
          <h4>📊 Status</h4>
          <span style={badge(lead.status)}>{lead.status.toUpperCase()}</span>
        </div>

        <div style={card}>
          <h4>🧾 Lead ID</h4>
          <p style={{ fontSize: "12px", color: "#888" }}>{lead._id}</p>
        </div>
      </div>

      {/* NOTES */}
      <div style={section}>
        <h3 style={{ marginBottom: "12px" }}>Notes</h3>

        <div style={noteInputWrap}>
          <input
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={input}
          />
          <button onClick={handleAddNote} style={btnAccent}>
            Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <p style={{ color: "#888" }}>No notes yet.</p>
        ) : (
          <div style={notesList}>
            {notes.map((note) => (
              <div key={note._id} style={noteCard}>
                <p style={{ marginBottom: "6px" }}>{note.content}</p>
                <span style={timestamp}>
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* STYLES */

const container: React.CSSProperties = {
  padding: "24px",
  maxWidth: "900px",
  margin: "0 auto",
  fontFamily: "Segoe UI, Arial, sans-serif"
};

const loadingStyle: React.CSSProperties = {
  padding: "20px",
  color: "#666"
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const actionGroup: React.CSSProperties = {
  display: "flex",
  gap: "10px"
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "24px"
};

const card: React.CSSProperties = {
  padding: "16px",
  borderRadius: "14px",
  background: "#ffffff",
  border: "1px solid #eee",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const section: React.CSSProperties = {
  padding: "20px",
  borderRadius: "14px",
  background: "#fff",
  border: "1px solid #eee"
};

const noteInputWrap: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginBottom: "15px"
};

const input: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  outline: "none"
};

const notesList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const noteCard: React.CSSProperties = {
  padding: "12px",
  borderRadius: "10px",
  background: "#f8fafc",
  border: "1px solid #e5e7eb"
};

const timestamp: React.CSSProperties = {
  fontSize: "12px",
  color: "#888"
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#6366f1",
  color: "#fff",
  cursor: "pointer"
};

const btnDanger: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer"
};

const btnAccent: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#22c55e",
  color: "#fff",
  cursor: "pointer"
};

const badge = (status: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#fff",
  background:
    status === "new"
      ? "#3b82f6"
      : status === "contacted"
      ? "#f59e0b"
      : "#22c55e"
});