const db = require("../db/connection");

// POST /api/payments  (protected)
exports.processPayment = async (req, res) => {
  const { booking_id, amount, payment_method } = req.body;

  if (!booking_id || !amount || !payment_method)
    return res.status(400).json({ message: "Missing payment fields" });

  const transaction_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

  try {
    // Verify booking belongs to user
    const [booking] = await db.query(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
      [booking_id, req.user.id]
    );
    if (booking.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    await db.query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, 'Success', ?)`,
      [booking_id, amount, payment_method, transaction_id]
    );

    res.status(201).json({
      message: "Payment successful",
      transaction_id,
      status: "Success",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/payments/booking/:bookingId
exports.getPaymentByBooking = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pay.* FROM payments pay
       JOIN bookings b ON pay.booking_id = b.id
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [req.params.bookingId, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Payment not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};