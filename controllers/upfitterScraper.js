const { processCity } = require('../services/upfitter.processor.service.js');
const { v4: uuidv4 } = require('uuid');
const { initSheet, appendResults } = require('../services/google.sheet.service.js');
const { initCluster } = require('../services/puppeteer-cluster.js');

// Throttle for OpenAI or expensive calls
const delayThrottle = (fn, delay = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fn().then(resolve).catch(reject);
    }, delay);
  });
};

async function getUpfittersByCities(req, res) {
  const { cities } = req.body;
  const requestId = uuidv4().slice(0, 8);

  if (!Array.isArray(cities) || cities.length === 0) {
    return res.status(400).json({
      error: "Please provide a non-empty array of cities",
      example: { cities: ["New York", "Los Angeles"] }
    });
  }

  console.log(`[${requestId}] Started processing ${cities.length} cities...`);

  await initSheet(requestId);
  const cluster = await initCluster();

  try {
    const chunkSize = 5;
    for (let i = 0; i < cities.length; i += chunkSize) {
      const chunk = cities.slice(i, i + chunkSize);
      console.log(`[${requestId}] Processing chunk ${i / chunkSize + 1}/${Math.ceil(cities.length / chunkSize)}`);

      const chunkResults = await Promise.allSettled(
        chunk.map((city, idx) =>
          processCity(cluster, city, i + idx, cities.length, delayThrottle)
        )
      );

      const successful = chunkResults
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      await appendResults(successful, requestId); // flush to sheet immediately
    }

    console.log(`[${requestId}] ✅ All cities processed.`);
    res.status(200).json({
      requestId,
      totalCities: cities.length,
      status: "Processing started and results are being written to sheet."
    });
  } catch (err) {
    console.error(`[${requestId}] ❌ Error: ${err.message}`);
    res.status(500).json({ requestId, error: err.message });
  } finally {
    await cluster.close();
  }
}

module.exports = { getUpfittersByCities };
