// beforeEach and afterEach are taken from https://developer.chrome.com/docs/extensions/how-to/test/puppeteer

const puppeteer = require('puppeteer');

const EXTENSION_PATH = '..';

let browser;
let worker;

const evaluateOrTimeout = async (worker, fn, ms) => {
    // define a Promise which rejects after ms milliseconds
    const timeout_promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('openPopup timed out')), ms)
    });

    // return a Promise with the result of worker.evaluate(fn) or, if ms milliseconds pass, an error
    return Promise.race([worker.evaluate(fn), timeout_promise]);
};

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

/*
try to open the extension popup. wait at most 2000 milliseconds to open the pop-up. note that this
does not require the correct page or any page at all in the pop-up, just that the extension config
is correct enough that chrome knows there is supposed to be a pop-up
*/
test('Chrome opens a pop-up window', async () => {
    await expect(
        evaluateOrTimeout(worker, () => chrome.action.openPopup(), 3000)
    ).resolves.not.toThrow();
});
