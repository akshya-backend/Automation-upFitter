const axios = require('axios');
require('dotenv').config();

async function searchSerper(query, start = 0) {
  try {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/search',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ q: query, start })
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error in Serper API:", error.response?.data || error.message);
    throw new Error("Serper API failed");
  }
}

async function scrapeWebsite(cluster, url) {
  try {
    return await cluster.execute({ url }, async ({ page, data }) => {
      await page.setDefaultNavigationTimeout(30000);
      await page.setRequestInterception(true);

      page.on('request', req =>
        ['image', 'stylesheet', 'font'].includes(req.resourceType())
          ? req.abort()
          : req.continue()
      );

      await page.goto(data.url, { waitUntil: 'domcontentloaded' });

      await page.evaluate(() => {
        document.querySelectorAll('script, style, iframe').forEach(el => el.remove());
      });

      const text = await page.evaluate(() =>
        document.body.innerText.replace(/\s+/g, ' ').trim()
      );

      return text;
    });
  } catch (err) {
    console.error(`[SCRAPER] Failed to scrape ${url}: ${err.message}`);
    return null;
  }
}


module.exports = { searchSerper,scrapeWebsite };
