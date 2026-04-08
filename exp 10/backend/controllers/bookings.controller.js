const db = require("../db/connection");

// POST /api/bookings
exports.createBooking = async (req, res) => {
  const { flight_id, flight, travel_class, seat_number, total_amount, passenger } = req.body;

  if (!travel_class || !total_amount || !passenger)
    return res.status(400).json({ message: "Missing required fields" });

  const booking_id = `SKY${Date.now()}`;

  try {
    let dbFlightId = null;

    // ✅ Step 1: If full flight object sent, upsert it into flights table
    if (flight && flight.flightNumber) {
      const [existing] = await db.query(
        "SELECT id FROM flights WHERE flight_number = ? AND flight_date = ?",
        [flight.flightNumber, flight.date]
      );

      if (existing.length > 0) {
        dbFlightId = existing[0].id;
      } else {
        const [inserted] = await db.query(
          `INSERT INTO flights
           (flight_number, airline, airline_code, from_code, to_code,
            departure_time, arrival_time, duration, stops, flight_date,
            price_economy, price_business, price_first, seats_left, amenities)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            flight.flightNumber,
            flight.airline,
            flight.airlineCode || "",
            flight.from,
            flight.to,
            flight.departure,
            flight.arrival,
            flight.duration || "",
            flight.stops || 0,
            flight.date,
            flight.prices?.economy || total_amount,
            flight.prices?.business || total_amount,
            flight.prices?.first || total_amount,
            flight.seatsLeft || 60,
            JSON.stringify(flight.amenities || []),
          ]
        );
        dbFlightId = inserted.insertId;
      }
    } else if (flight_id && !isNaN(flight_id)) {
      // numeric flight_id passed directly (e.g. from DB)
      dbFlightId = Number(flight_id);
    } else {
      return res.status(400).json({ message: "Missing flight data" });
    }

    // ✅ Step 2: Insert booking
    const [bookingResult] = await db.query(
      `INSERT INTO bookings
       (booking_id, user_id, flight_id, travel_class, seat_number, total_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking_id, req.user.id, dbFlightId, travel_class, seat_number || null, total_amount]
    );

    const bookingRowId = bookingResult.insertId;

    // ✅ Step 3: Insert passenger
    await db.query(
      `INSERT INTO passengers
       (booking_id, first_name, last_name, email, phone, dob, gender, passport_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingRowId,
        passenger.firstName  || "",
        passenger.lastName   || "",
        passenger.email      || null,
        passenger.phone      || null,
        passenger.dob        || null,
        passenger.gender     || null,
        passenger.passportNo || null,
      ]
    );

    // ✅ Step 4: Decrement seat count
    await db.query(
      "UPDATE flights SET seats_left = seats_left - 1 WHERE id = ? AND seats_left > 0",
      [dbFlightId]
    );

    res.status(201).json({
      message:        "Booking confirmed",
      booking_id,
      booking_row_id: bookingRowId,
    });

  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT
         b.id, b.booking_id, b.travel_class, b.seat_number,
         b.total_amount, b.status, b.booked_at,
         f.id AS flight_id, f.flight_number, f.airline, f.airline_code,
         f.from_code, f.to_code, f.departure_time, f.arrival_time,
         f.duration, f.stops, f.flight_date,
         p.first_name, p.last_name,
         p.email AS pax_email, p.phone AS pax_phone,
         p.gender, p.passport_no,
         pay.amount AS paid_amount, pay.payment_method,
         pay.payment_status, pay.transaction_id
       FROM bookings b
       JOIN flights    f   ON b.flight_id  = f.id
       JOIN passengers p   ON p.booking_id = b.id
       LEFT JOIN payments pay ON pay.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY b.booked_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    console.error("getMyBookings error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/bookings/:bookingId
exports.getBookingById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, f.*, p.first_name, p.last_name, p.email AS pax_email
       FROM bookings b
       JOIN flights    f ON b.flight_id  = f.id
       JOIN passengers p ON p.booking_id = b.id
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [req.params.bookingId, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Booking not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/bookings/:bookingId/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?",
      [req.params.bookingId, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    await db.query(
      "UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?",
      [req.params.bookingId]
    );
    await db.query(
      "UPDATE flights SET seats_left = seats_left + 1 WHERE id = ?",
      [rows[0].flight_id]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};