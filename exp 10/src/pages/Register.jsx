import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { api } from "../api";
import "./Auth.css";

export default function Register() {
  const { login } = useBooking();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (res.token) {
        // Same flow as login — persist token, hydrate context from DB response
        localStorage.setItem("skybook_token", res.token);
        login(res.user);
        navigate("/");
      } else {
        setError(res.message || "Registration failed");
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
          Create <span className="gold">Account</span>
        </h2>
        <p className="muted auth-sub">Join thousands of happy travellers</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
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
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
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
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="auth-switch muted">
          Already have an account?{" "}
          <Link to="/login" className="gold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}