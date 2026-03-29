import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    // 🔹 Basic validation
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);

      toast.success("Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000); // small delay so user sees toast

    } catch (error: any) {
      console.error(error);

      toast.error("Invalid credentials, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Admin Login</h1>
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f5f5"
        }}
      >
        <div
            style={{
            padding: "30px",
            width: "300px",
            background: "#e1baba",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(219, 21, 21, 0.92)",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <h2 style={{ textAlign: "center" }}>Admin Login</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              background: loading ? "#999" : "#007bff",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </>
  );
}