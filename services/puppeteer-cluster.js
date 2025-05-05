const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');

puppeteer.use(StealthPlugin());

const CONFIG = {
  clusterConcurrency: 5, // reduce to control memory
  headless: true,
};

async function initCluster() {
  return await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: CONFIG.clusterConcurrency,
    puppeteer,
    puppeteerOptions: {
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    monitor: false,
    timeout: 2 * 60 * 1000, // 2 minutes max per task
    retryLimit: 2,
    retryDelay: 5000,
  });
}



module.exports = { 
  initCluster 
};