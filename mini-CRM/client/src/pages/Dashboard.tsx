import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface Lead {
  _id: string;
  status: "new" | "contacted" | "converted";
  createdAt: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [range, setRange] = useState("30"); // days
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await API.get("/leads");
        setLeads(res.data);
      } catch {
        toast.error("Failed to load dashboard data");
      }
    };

    fetchLeads();
  }, []);

  //  Filter by date range
  const now = new Date();

  const filteredLeads = leads.filter((lead) => {
    const created = new Date(lead.createdAt);

    const withinRange =
      range === "all"
        ? true
        : created >
          new Date(now.getTime() - Number(range) * 24 * 60 * 60 * 1000);

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return withinRange && matchesStatus;
  });

  //  Metrics
  const total = filteredLeads.length;
  const converted = filteredLeads.filter(l => l.status === "converted").length;
  const contacted = filteredLeads.filter(l => l.status === "contacted").length;
  const newLeads = filteredLeads.filter(l => l.status === "new").length;

  const conversionRate = total
    ? ((converted / total) * 100).toFixed(1)
    : "0";

  const lossRate = total
    ? (100 - Number(conversionRate)).toFixed(1)
    : "0";

  // Group for chart
  const grouped = filteredLeads.reduce((acc: any, lead) => {
    const date = new Date(lead.createdAt).toLocaleDateString();

    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }

    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(grouped).sort(
    (a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {/*  Filters */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          border: "1px solid #da7b7b",
          padding: "15px",
          borderRadius: "40px",
        }}
      >
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="365">Last 1 Year</option>
          <option value="all">All Time</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/*  Metrics */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >
        <Card title="Total Leads" value={total} />
        <Card title="Converted" value={converted} />
        <Card title="Conversion Rate" value={`${conversionRate}%`} />
        <Card title="Loss Rate" value={`${lossRate}%`} />
      </div>

      {/*  Chart */}
      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px"
        }}
      >
        <h3>Lead Growth</h3>

        <LineChart width={700} height={300} data={chartData}>
          <CartesianGrid />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" />
        </LineChart>
      </div>

      {/*  Breakdown */}
      <div
        style={{
          background: "#f0e8e8",
          padding: "20px",
          borderRadius: "10px"
        }}
      >
        <h3>Lead Breakdown</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New</td>
              <td>{newLeads}</td>
            </tr>
            <tr>
              <td>Contacted</td>
              <td>{contacted}</td>
            </tr>
            <tr>
              <td>Converted</td>
              <td>{converted}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/*  Insight */}
      <div style={{ marginTop: "20px" }}>
        <h3>Performance Insight</h3>

        {Number(conversionRate) > 50 ? (
          <p>✅ Strong performance — high conversion rate</p>
        ) : Number(conversionRate) > 20 ? (
          <p>⚠️ Average performance — improvement needed</p>
        ) : (
          <p>❌ Low conversion — review your sales strategy</p>
        )}
      </div>
    </div>
  );
}


function Card({ title, value }: { title: string; value: any }) {
  return (
    <div
      style={{
        flex: "1",
        minWidth: "150px",
        padding: "15px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgb(202, 32, 32)"
      }}
    >
      <h4>{title}</h4>
      <p style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}