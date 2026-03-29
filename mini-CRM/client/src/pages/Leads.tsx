import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Lead {
  _id: string;
  name: string;
  email: string;
  source: string;
  status: "new" | "contacted" | "converted";
  createdAt?: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selected, setSelected] = useState<string[]>([]);

  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await API.put(`/leads/${id}`, { status });

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === id
            ? { ...lead, status: status as Lead["status"] }
            : lead
        )
      );

      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0) {
      toast.error("No leads selected");
      return;
    }

    try {
      await Promise.all(selected.map((id) => API.delete(`/leads/${id}`)));
      toast.success("Selected leads deleted");
      setSelected([]);
      fetchLeads();
    } catch {
      toast.error("Failed to delete leads");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.source.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <p style={{ padding: "20px", color: "#666" }}>Loading leads...</p>;
  }

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "16px" }}>Leads</h2>

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "center"
        }}
      >
        <button
          onClick={() => navigate("/leads/new")}
          style={btnPrimary}
        >
          + Add Lead
        </button>

        <button
          onClick={deleteSelected}
          style={btnDanger}
        >
          🗑 Delete Selected
        </button>

        <input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Table */}
      {filteredLeads.length === 0 ? (
        <p style={{ color: "#e32222" }}>No matching leads.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#5c7dbd" }}>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead._id}
                onClick={() => navigate(`/leads/${lead._id}`)}
                style={rowStyle}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(lead._id)}
                    onChange={() => toggleSelect(lead._id)}
                  />
                </td>

                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.source}</td>

                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      updateStatus(lead._id, e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* Styles */

const btnPrimary: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  cursor: "pointer"
};

const btnDanger: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "#ffffff",
  cursor: "pointer"
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid #43a827",
  outline: "none"
};

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "10px",
  border: "1px solid #eb6a6a",
  background: "#968874"
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: "10px",
  overflow: "hidden"
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #948e8e",
  cursor: "pointer",
  transition: "background 0.2s"
};