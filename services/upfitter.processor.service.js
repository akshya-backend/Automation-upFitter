const { searchSerper, scrapeWebsite } = require('../services/serper.service.js');
const { generateMockCompany, getUniqueDomainLinks } = require('../utils/helper.js');

const CONFIG = {
  maxResultsPerCity: 10,
  openAIConcurrency: 10,
  delayMin: 2000,
  delayMax: 5000,
};

const randomDelay = () =>
  new Promise(resolve =>
    setTimeout(resolve, CONFIG.delayMin + Math.random() * (CONFIG.delayMax - CONFIG.delayMin))
  );

async function processCity(cluster, city, index, total, throttleFn) {
  try {
    console.log(`[${index}] Searching: ${city}`);

    const [res1, res2] = await Promise.all([
      searchSerper(`Upfitters in ${city}`, 0),
      searchSerper(`Upfitters in ${city}`, 10)
    ]);

    const organicResults = [...(res1.organic || []), ...(res2.organic || [])];

    const filteredResults = getUniqueDomainLinks(organicResults).slice(0, CONFIG.maxResultsPerCity);

    const validLinks = [];
    for (const result of filteredResults) {
      await throttleFn(async () => {
        // const isValid = await isUpfitterBusiness(...);
        // if (isValid) validLinks.push(result);
        validLinks.push(result); // mock logic
        await randomDelay();
      });
    }

    const finalCompanies = [];

    for (const [i, result] of validLinks.entries()) {
      try {
        console.log(`[${index}] [${city}] Scraping ${i + 1}/${validLinks.length}: ${result.link}`);

        const content = await scrapeWebsite(cluster, result.link);
        if (!content) continue;

        const company = generateMockCompany(); // or await extractCompanyDetails(...)
        company.city = city;
        company.website = result.link;

        finalCompanies.push(company);
        await randomDelay();
      } catch (e) {
        console.warn(`[${index}] [${city}] Failed result: ${e.message}`);
      }
    }

    return finalCompanies;
  } catch (err) {
    console.error(`[${index}] [${city}] Critical failure: ${err.message}`);
    return [];
  }
}

module.exports = { processCity };
