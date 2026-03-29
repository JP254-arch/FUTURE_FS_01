import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadDetails";
import CreateLead from "./pages/CreateLead";
import ProtectedRoute from "./components/ProtectedRoute";
import toast from "react-hot-toast";

function Navbar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    textDecoration: "none",
    color: isActive ? "#00ff11" : "#333",
    fontWeight: isActive ? "bold" : "normal"
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "#fafbfa",
        padding: "12px 20px",
        borderBottom: "1px solid #25b525",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Mini CRM</h3>

        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/leads" style={linkStyle}>
          Leads
        </NavLink>
      </div>

      {/*  Right */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <NavLink
          to="/leads/new"
          style={{
            padding: "6px 12px",
            background: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none"
          }}
        >
          + New Lead
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #d91c1c",
            background: "#d04a28",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function AppWrapper() {
  const token = localStorage.getItem("token");

  return (
    <>
      {token && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads/new"
          element={
            <ProtectedRoute>
              <CreateLead />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads/:id"
          element={
            <ProtectedRoute>
              <LeadDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads/:id/edit"
          element={
            <ProtectedRoute>
              <CreateLead />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}