import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { generateFlights, airports } from "../data/flights";
import FlightCard from "../components/FlightCard";
import "./Search.css";

export default function Search() {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useBooking();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState(searchParams || {
    from: "DEL", to: "BOM", date: today, passengers: 1, tripType: "one-way",
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("price");
  const [filterAirline, setFilterAirline] = useState("All");
  const [filterStops, setFilterStops] = useState("All");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const search = () => {
    if (form.from === form.to) return;
    setLoading(true);
    setTimeout(() => {
      const results = generateFlights(form.from, form.to, form.date);
      setFlights(results);
      setSearchParams(form);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (searchParams) {
      setForm(searchParams);
      setLoading(true);
      setTimeout(() => {
        setFlights(generateFlights(searchParams.from, searchParams.to, searchParams.date));
        setLoading(false);
      }, 800);
    }
  }, []);

  const airlines = ["All", ...new Set(flights.map((f) => f.airline))];

  const sorted = [...flights]
    .filter((f) => filterAirline === "All" || f.airline === filterAirline)
    .filter((f) => filterStops === "All" || (filterStops === "0" ? f.stops === 0 : f.stops > 0))
    .sort((a, b) => {
      if (sort === "price") return a.prices.economy - b.prices.economy;
      if (sort === "duration") return a.duration.localeCompare(b.duration);
      if (sort === "departure") return a.departure.localeCompare(b.departure);
      return 0;
    });

  const fromCity = airports.find((a) => a.code === form.from);
  const toCity = airports.find((a) => a.code === form.to);

  return (
    <div className="page-wrapper">
      <div className="search-page">
        {/* Top bar */}
        <div className="search-topbar">
          <div className="container">
            <div className="search-bar-compact">
              <div className="form-group compact">
                <label>From</label>
                <select value={form.from} onChange={(e) => set("from", e.target.value)}>
                  {airports.map((a) => (
                    <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </div>
              <span className="arrow-sep">→</span>
              <div className="form-group compact">
                <label>To</label>
                <select value={form.to} onChange={(e) => set("to", e.target.value)}>
                  {airports.map((a) => (
                    <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group compact">
                <label>Date</label>
                <input type="date" value={form.date} min={today} onChange={(e) => set("date", e.target.value)} />
              </div>
              <div className="form-group compact">
                <label>Pax</label>
                <select value={form.passengers} onChange={(e) => set("passengers", Number(e.target.value))}>
                  {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={search} style={{ alignSelf: "flex-end", height: "44px", whiteSpace: "nowrap" }}>
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="container search-layout">
          {/* Sidebar filters */}
          <aside className="filters-panel card">
            <h3>Filters</h3>
            <div className="divider" />

            <div className="filter-group">
              <div className="filter-title">Sort By</div>
              {[
                { v: "price", l: "Lowest Price" },
                { v: "departure", l: "Departure Time" },
                { v: "duration", l: "Duration" },
              ].map(({ v, l }) => (
                <label key={v} className="radio-item">
                  <input type="radio" name="sort" checked={sort === v} onChange={() => setSort(v)} />
                  <span>{l}</span>
                </label>
              ))}
            </div>

            <div className="divider" />

            <div className="filter-group">
              <div className="filter-title">Stops</div>
              {[
                { v: "All", l: "All" },
                { v: "0", l: "Non-stop" },
                { v: "1", l: "1 Stop" },
              ].map(({ v, l }) => (
                <label key={v} className="radio-item">
                  <input type="radio" name="stops" checked={filterStops === v} onChange={() => setFilterStops(v)} />
                  <span>{l}</span>
                </label>
              ))}
            </div>

            {airlines.length > 1 && (
              <>
                <div className="divider" />
                <div className="filter-group">
                  <div className="filter-title">Airline</div>
                  {airlines.map((a) => (
                    <label key={a} className="radio-item">
                      <input type="radio" name="airline" checked={filterAirline === a} onChange={() => setFilterAirline(a)} />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Results */}
          <div className="results-panel">
            <div className="results-header">
              <div>
                <h2 className="results-title">
                  {fromCity?.city} → {toCity?.city}
                </h2>
                <div className="results-meta">
                  {loading ? "Searching..." : `${sorted.length} flights found · ${form.date} · ${form.passengers} passenger${form.passengers > 1 ? "s" : ""}`}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Finding the best flights for you…</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="empty-state card">
                <div style={{ fontSize: 48 }}>✈</div>
                <h3>No flights found</h3>
                <p className="muted">Try different dates or routes</p>
                <button className="btn-primary" onClick={() => navigate("/")}>Modify Search</button>
              </div>
            ) : (
              <div className="flights-list">
                {sorted.map((f) => (
                  <FlightCard key={f.id} flight={f} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}