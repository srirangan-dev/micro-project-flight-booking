import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { api } from "../api";
import "./Auth.css";

export default function Login() {
  const { login } = useBooking();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("All fields required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.login({ email: form.email, password: form.password });

      if (res.token) {
        // Store only the JWT token — user object comes from the DB via context
        localStorage.setItem("skybook_token", res.token);
        login(res.user); // saves user into BookingContext (no localStorage for user)
        navigate("/");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="auth-card card fade-up">
        <div className="auth-logo">◈ SkyBook</div>
        <h2>
          Welcome <span className="gold">Back</span>
        </h2>
        <p className="muted auth-sub">Sign in to manage your bookings</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "13px" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="auth-switch muted">
          Don't have an account?{" "}
          <Link to="/register" className="gold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}