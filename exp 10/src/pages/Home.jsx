import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { airports } from "../data/flights";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { setSearchParams } = useBooking();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    from: "DEL",
    to: "BOM",
    date: today,
    passengers: 1,
    tripType: "one-way",
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSearch = (e) => {
    e.preventDefault();
    if (form.from === form.to) {
      setError("Origin and destination cannot be the same.");
      return;
    }
    setError("");
    setSearchParams(form);
    navigate("/search");
  };

  const swap = () => set("from", form.to) || set("to", form.from) ||
    setForm((f) => ({ ...f, from: f.to, to: f.from }));

  const stats = [
    { n: "200+", label: "Destinations" },
    { n: "50+", label: "Airlines" },
    { n: "2M+", label: "Passengers" },
    { n: "4.9★", label: "Rating" },
  ];

  const features = [
    { icon: "⚡", title: "Instant Booking", desc: "Book your flight in under 2 minutes with our streamlined process." },
    { icon: "🔒", title: "Secure Payments", desc: "Bank-grade encryption protects every transaction." },
    { icon: "📱", title: "E-Tickets", desc: "Receive your boarding pass instantly on your device." },
    { icon: "🌐", title: "Global Network", desc: "Access to 500+ airlines and 10,000+ routes worldwide." },
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content fade-up">
          <div className="hero-eyebrow">✈ Premium Flight Booking</div>
          <h1 className="hero-title">
            Where Would You<br />
            <span className="gold">Like to Fly?</span>
          </h1>
          <p className="hero-sub">
            Discover the world's finest routes. Book with confidence.
          </p>

          <div className="search-card card">
            <div className="trip-type">
              {["one-way", "round-trip"].map((t) => (
                <button
                  key={t}
                  className={`trip-btn ${form.tripType === t ? "active" : ""}`}
                  onClick={() => set("tripType", t)}
                >
                  {t === "one-way" ? "One Way" : "Round Trip"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group">
                <label>From</label>
                <select value={form.from} onChange={(e) => set("from", e.target.value)}>
                  {airports.map((a) => (
                    <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </div>

              <button type="button" className="swap-btn" onClick={swap} title="Swap airports">
                ⇄
              </button>

              <div className="form-group">
                <label>To</label>
                <select value={form.to} onChange={(e) => set("to", e.target.value)}>
                  {airports.map((a) => (
                    <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) => set("date", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Passengers</label>
                <select value={form.passengers} onChange={(e) => set("passengers", Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "Adult" : "Adults"}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary search-btn">
                Search Flights
              </button>
            </form>
            {error && <p className="error-msg">{error}</p>}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-n gold">{s.n}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose <span className="gold">SkyBook</span></h2>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="routes-section">
        <div className="container">
          <h2 className="section-title">Popular <span className="gold">Routes</span></h2>
          <div className="routes-grid">
            {[
              { from: "DEL", to: "BOM", price: "₹3,299", img: "🏙" },
              { from: "BLR", to: "HYD", price: "₹2,499", img: "✈" },
              { from: "MAA", to: "GOI", price: "₹4,199", img: "🏖" },
              { from: "CCU", to: "DEL", price: "₹3,799", img: "🕌" },
            ].map((r) => (
              <div key={r.from + r.to} className="route-card" onClick={() => {
                setSearchParams({ from: r.from, to: r.to, date: today, passengers: 1, tripType: "one-way" });
                navigate("/search");
              }}>
                <div className="route-visual">{r.img}</div>
                <div className="route-info">
                  <div className="route-cities">{r.from} → {r.to}</div>
                  <div className="route-from">from <span className="gold">{r.price}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}