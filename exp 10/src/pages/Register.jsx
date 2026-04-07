import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import "./Auth.css";

export default function Register() {
  const { login } = useBooking();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    login({ name: form.name, email: form.email });
    navigate("/");
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="auth-card card fade-up">
        <div className="auth-logo">◈ SkyBook</div>
        <h2>Create <span className="gold">Account</span></h2>
        <p className="muted auth-sub">Join thousands of happy travellers</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Doe" required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" required /></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="••••••••" required /></div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px" }}>Create Account</button>
        </form>
        <p className="auth-switch muted">Already have an account? <Link to="/login" className="gold">Login</Link></p>
      </div>
    </div>
  );
}