const db = require("../db/connection");

// GET /api/flights?from=DEL&to=BOM&date=2025-12-01&passengers=1
exports.searchFlights = async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date)
    return res.status(400).json({ message: "from, to and date are required" });

  try {
    const [flights] = await db.query(
      `SELECT * FROM flights
       WHERE from_code = ? AND to_code = ? AND flight_date = ? AND seats_left > 0
       ORDER BY departure_time ASC`,
      [from, to, date]
    );
    res.json({ count: flights.length, flights });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/flights/:id
exports.getFlightById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM flights WHERE id = ?", [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Flight not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/flights  (admin: seed a flight)
exports.createFlight = async (req, res) => {
  const {
    flight_number, airline, airline_code,
    from_code, to_code, departure_time, arrival_time,
    duration, stops, flight_date,
    price_economy, price_business, price_first,
    seats_left, amenities,
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO flights
       (flight_number, airline, airline_code, from_code, to_code,
        departure_time, arrival_time, duration, stops, flight_date,
        price_economy, price_business, price_first, seats_left, amenities)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        flight_number, airline, airline_code, from_code, to_code,
        departure_time, arrival_time, duration, stops || 0, flight_date,
        price_economy, price_business, price_first, seats_left || 60,
        JSON.stringify(amenities || []),
      ]
    );
    res.status(201).json({ message: "Flight created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};