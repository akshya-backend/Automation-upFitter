// routes/infoRoutes.js
const express = require('express');
const {getUpfittersByCities}=require("../controllers/upfitterScraper.js")

const router = express.Router();

// POST route to handle multiple cities
router.post('/scrapeGoogleSearch',getUpfittersByCities)

module.exports = router;
