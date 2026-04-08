const router = require("express").Router();
const payments = require("../controllers/payments.controller");
const protect = require("../middleware/auth.middleware");

router.post("/",                          protect, payments.processPayment);
router.get("/booking/:bookingId",         protect, payments.getPaymentByBooking);

module.exports = router;