import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import SeatSelector from "../components/SeatSelector";
import "./Booking.css";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user, selectedFlight, selectedClass,
    passengerInfo, setPassengerInfo,
    selectedSeat, setSelectedSeat,
  } = useBooking();

  useEffect(() => {
    if (!selectedFlight) navigate("/search");
  }, [selectedFlight]);

  if (!selectedFlight) return null;

  const setField = (k, v) => setPassengerInfo((p) => ({ ...p, [k]: v }));

  const basePrice = selectedFlight.prices[selectedClass];
  const seatFee = selectedSeat?.price || 0;
  const tax = Math.floor(basePrice * 0.12);
  const total = basePrice + seatFee + tax;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/payment");
  };

  const classLabel = { economy: "Economy", business: "Business", first: "First Class" };

  return (
    <div className="page-wrapper">
      <div className="container booking-page fade-up">
        <div className="booking-header">
          <button className="btn-ghost back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>Complete Your <span className="gold">Booking</span></h1>
        </div>

        <div className="booking-layout">
          {/* Left: Form */}
          <div className="booking-form-section">
            {/* Flight Summary */}
            <div className="card flight-summary">
              <div className="summary-route">
                <div className="summary-city">
                  <div className="sum-code">{selectedFlight.from}</div>
                  <div className="sum-time">{selectedFlight.departure}</div>
                </div>
                <div className="sum-mid">
                  <div className="sum-airline">{selectedFlight.airline}</div>
                  <div className="sum-line"><div className="sl" /><span>✈</span></div>
                  <div className="sum-duration">{selectedFlight.duration}</div>
                </div>
                <div className="summary-city right">
                  <div className="sum-code">{selectedFlight.to}</div>
                  <div className="sum-time">{selectedFlight.arrival}</div>
                </div>
              </div>
              <div className="summary-meta">
                <span className="badge badge-gold">{classLabel[selectedClass]}</span>
                <span className="muted">{selectedFlight.date}</span>
                <span className="muted">{selectedFlight.flightNumber}</span>
                {selectedFlight.stops === 0
                  ? <span className="badge badge-green">Non-stop</span>
                  : <span className="badge badge-blue">{selectedFlight.stops} Stop</span>}
              </div>
            </div>

            {/* Passenger Form */}
            <form onSubmit={handleSubmit} className="card">
              <h3 className="section-head">Passenger Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={passengerInfo.firstName} onChange={(e) => setField("firstName", e.target.value)} placeholder="John" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={passengerInfo.lastName} onChange={(e) => setField("lastName", e.target.value)} placeholder="Doe" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={passengerInfo.email} onChange={(e) => setField("email", e.target.value)} placeholder="john@email.com" required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={passengerInfo.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+91 99999 99999" required />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={passengerInfo.dob} onChange={(e) => setField("dob", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={passengerInfo.gender} onChange={(e) => setField("gender", e.target.value)} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Passport / ID Number</label>
                  <input value={passengerInfo.passportNo} onChange={(e) => setField("passportNo", e.target.value)} placeholder="P1234567" />
                </div>
              </div>

              <div className="section-head" style={{ marginTop: 24, marginBottom: 16 }}>
                <h3>Select Your Seat <span className="muted" style={{ fontSize: 14, fontFamily: 'DM Sans' }}>(Optional)</span></h3>
              </div>

              <SeatSelector onSelect={setSelectedSeat} selectedSeat={selectedSeat} />

              <div style={{ marginTop: 24 }}>
                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }}>
                  {user ? "Continue to Payment →" : "Login to Continue →"}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Price summary */}
          <div className="booking-sidebar">
            <div className="card price-card">
              <h3>Price Summary</h3>
              <div className="divider" />
              <div className="price-row">
                <span>Base Fare ({classLabel[selectedClass]})</span>
                <span>₹{basePrice.toLocaleString("en-IN")}</span>
              </div>
              {seatFee > 0 && (
                <div className="price-row">
                  <span>Seat Fee ({selectedSeat?.id})</span>
                  <span>₹{seatFee}</span>
                </div>
              )}
              <div className="price-row">
                <span>Taxes & Fees (12%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="divider" />
              <div className="price-row total">
                <span>Total</span>
                <span className="gold">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="price-note muted">Final price inclusive of all taxes</p>
            </div>

            <div className="card info-card">
              <h4>ℹ Booking Info</h4>
              <ul>
                <li>Free cancellation within 24 hours</li>
                <li>Web check-in available 48h before departure</li>
                <li>E-ticket sent to registered email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}