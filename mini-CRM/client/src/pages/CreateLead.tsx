import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateLead() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "website"
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchLead = async () => {
      try {
        setFetching(true);
        const res = await API.get(`/leads/${id}`);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          source: res.data.source || "website"
        });
      } catch {
        toast.error("Failed to load lead");
      } finally {
        setFetching(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and Email are required");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await API.put(`/leads/${id}`, form);
        toast.success("Lead updated successfully");
      } else {
        await API.post("/leads", form);
        toast.success("Lead created successfully");
      }

      setTimeout(() => navigate("/leads"), 700);
    } catch {
      toast.error(isEdit ? "Update failed" : "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={loadingStyle}>Loading...</div>;

  return (
    <div style={page}>
      <div style={card}>
        {/* HEADER */}
        <div style={header}>
          <h2 style={{ margin: 0 }}>
            {isEdit ? "Edit Lead" : "Create Lead"}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>
            {isEdit
              ? "Update the details of this lead"
              : "Fill in the details to add a new lead"}
          </p>
        </div>

        {/* FORM */}
        <div style={formGrid}>
          <div style={field}>
            <label>Name *</label>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={field}>
            <label>Email *</label>
            <input
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={field}>
            <label>Phone</label>
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={field}>
            <label>Source</label>
            <input
              name="source"
              placeholder="Website, referral, etc."
              value={form.source}
              onChange={handleChange}
              style={input}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div style={actions}>
          <button
            onClick={() => navigate("/leads")}
            style={btnSecondary}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={btnPrimary(loading)}
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Lead"
              : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const page: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  padding: "20px"
};

const card: React.CSSProperties = {
  width: "420px",
  padding: "26px",
  borderRadius: "16px",
  background: "#ffffff",
  border: "1px solid #ed7373",
  boxShadow: "0 10px 30px rgba(219, 24, 24, 0.22)",
  display: "flex",
  flexDirection: "column",
  gap: "18px"
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "10px"
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gap: "14px"
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"

};

const input: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #cc1919",
  outline: "none",
  transition: "0.2s",
  fontSize: "14px"
};

const actions: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  marginTop: "10px"
};

const btnPrimary = (loading: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: loading ? "#a5b4fc" : "#4f46e5",
  color: "#fff",
  cursor: loading ? "not-allowed" : "pointer",
  flex: 1,
  fontWeight: 500
});

const btnSecondary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  background: "#b97979",
  cursor: "pointer",
  flex: 1
};

const loadingStyle: React.CSSProperties = {
  padding: "20px",
  color: "#666"
};