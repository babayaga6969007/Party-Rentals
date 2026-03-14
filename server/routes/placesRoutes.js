const express = require("express");
const router = express.Router();
const placesController = require("../controllers/placesController");

// Public: address autocomplete (backend calls Google; key never sent to client)
router.get("/autocomplete", placesController.autocomplete);
// Public: get lat/lng + formatted address for a place_id (after user selects a suggestion)
router.get("/details", placesController.placeDetails);

module.exports = router;
