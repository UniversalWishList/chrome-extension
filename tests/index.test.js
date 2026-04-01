// beforeEach and afterEach are taken from https://developer.chrome.com/docs/extensions/how-to/test/puppeteer

const puppeteer = require('puppeteer');

const EXTENSION_PATH = '..';

let browser;
let worker;

beforeEach(async () => {
    browser = await puppeteer.launch({
        // Set headless to 'new' to hide Chrome if running as part of an automated build.
        headless: false,
        pipe: true,
        enableExtensions: [EXTENSION_PATH]
    });

    const workerTarget = await browser.waitForTarget(
        // Assumes that there is only one service worker created by the extension and its URL ends with service-worker.js.
        (target) =>
            target.type() === 'service_worker' &&
            target.url().endsWith('service-worker.js')
    );

    worker = await workerTarget.worker();
});

afterEach(async () => {
    await browser.close();
    browser = undefined;
});

test('An pop-up window opens when clicking the extension', async () => {
    // Open the extension popup.
    await worker.evaluate(() => chrome.action.openPopup());

    const popupTarget = await browser.waitForTarget(
        // Assumes that there is only one page with the URL ending with popup.html
        // and that is the popup created by the extension.
        (target) => target.type() === 'page' && target.url().endsWith('popup.html')
    );

    const popup = await popupTarget.asPage();
});