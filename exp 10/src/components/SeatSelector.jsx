import { useState } from "react";
import { seatLayout } from "../data/flights";
import "./SeatSelector.css";

export default function SeatSelector({ onSelect, selectedSeat }) {
  const [seats] = useState(seatLayout);
  const cols = ["A", "B", "C", "D", "E", "F"];

  const handleClick = (seat) => {
    if (seat.isBooked) return;
    onSelect(selectedSeat?.id === seat.id ? null : seat);
  };

  const getSeatClass = (seat) => {
    if (seat.isBooked) return "seat booked";
    if (selectedSeat?.id === seat.id) return "seat selected";
    if (seat.extraLegroom) return "seat legroom";
    return "seat available";
  };

  const rows = [...new Set(seats.map((s) => s.row))];

  return (
    <div className="seat-selector">
      <div className="seat-legend">
        <div className="legend-item"><span className="seat-dot available" /> Available</div>
        <div className="legend-item"><span className="seat-dot booked" /> Booked</div>
        <div className="legend-item"><span className="seat-dot selected" /> Your Seat</div>
        <div className="legend-item"><span className="seat-dot legroom" /> Extra Legroom</div>
      </div>

      <div className="seat-plane">
        <div className="plane-nose">✈ Cockpit</div>

        <div className="col-labels">
          {cols.map((c, i) => (
            <>
              {i === 3 && <div key="aisle" className="aisle-label">Aisle</div>}
              <div key={c} className="col-label">{c}</div>
            </>
          ))}
        </div>

        <div className="seats-grid">
          {rows.map((row) => (
            <div key={row} className="seat-row">
              <div className="row-num">{row}</div>
              {cols.map((col, ci) => {
                const seat = seats.find((s) => s.row === row && s.col === col);
                return (
                  <>
                    {ci === 3 && <div key={`aisle-${row}`} className="seat-aisle" />}
                    <div
                      key={seat.id}
                      className={getSeatClass(seat)}
                      onClick={() => handleClick(seat)}
                      title={`${seat.id}${seat.extraLegroom ? " - Extra Legroom" : ""}${seat.price > 0 ? ` (+₹${seat.price})` : ""}`}
                    />
                  </>
                );
              })}
              <div className="row-num">{row}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedSeat && (
        <div className="selected-info">
          <span>Selected: <strong>{selectedSeat.id}</strong></span>
          {selectedSeat.isWindow && <span className="badge badge-blue">Window</span>}
          {selectedSeat.isAisle && <span className="badge badge-blue">Aisle</span>}
          {selectedSeat.extraLegroom && <span className="badge badge-gold">Extra Legroom</span>}
          {selectedSeat.price > 0 && <span className="seat-price">+₹{selectedSeat.price}</span>}
        </div>
      )}
    </div>
  );
}