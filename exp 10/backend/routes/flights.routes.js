const router = require("express").Router();
const flights = require("../controllers/flights.controller");

router.get("/",       flights.searchFlights);
router.get("/:id",    flights.getFlightById);
router.post("/",      flights.createFlight);   // seed flights

module.exports = router;