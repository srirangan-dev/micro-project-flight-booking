const router = require("express").Router();
const bookings = require("../controllers/bookings.controller");
const protect = require("../middleware/auth.middleware");

router.post("/",                          protect, bookings.createBooking);
router.get("/my",                         protect, bookings.getMyBookings);
router.get("/:bookingId",                 protect, bookings.getBookingById);
router.patch("/:bookingId/cancel",        protect, bookings.cancelBooking);

module.exports = router;