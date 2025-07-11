const puppeteer = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const http = require('http');

const log = require('../utils/logger.cjs');
const config = require('../config/puppeteer.config.cjs');

async function getWebSocketDebuggerUrl({ isGUI = false } = {}) {

    const url = `http://127.0.0.1:${config.remoteDebuggingPort}/json/version`;
    log.info(url);

    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => {
            try {
                const json = JSON.parse(rawData);
                resolve(json.webSocketDebuggerUrl);
            } catch (err) {
                reject(err);
            }
        });
        }).on('error', (err) => {
            log.error('[PuppeteerService] Error fetching debugger URL:', err);
            reject(err);
        });
    });
}

async function connectAndLogTabs({ isGUI = false } = {}) {
    // puppeteer.use(StealthPlugin());
    const wsUrl = await getWebSocketDebuggerUrl({ isGUI });
    log.info(wsUrl);
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    // const browser = await puppeteer.launch();

    const pages = await browser.pages();
    log.info(`[PuppeteerService] Tabs open: ${pages.length}`);

    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/uas/login?session_redirect=/sales&fromSignIn=true&trk=navigator');
    log.info('[Puppeteer] Navigated to LinkedIn.');

    return browser;
}

module.exports = {
    getWebSocketDebuggerUrl,
    connectAndLogTabs
};
