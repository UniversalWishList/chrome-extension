// beforeEach and afterEach are taken from https://developer.chrome.com/docs/extensions/how-to/test/puppeteer

const puppeteer = require('puppeteer');

const EXTENSION_PATH = '..';

let browser;
let worker;


/**
 * Attempt to run the asynchronous function fn in under ms milliseconds.
 * 
 * @param {function} fn An asynchronous function that returns a Promise
 * @param {number} ms The number of milliseconds to wait before timing out.
 * @param {string} error_msg The error message to return if the timeout expires.
 * 
 * @returns A promise with the result of fn or, if ms seconds pass, an error with error_msg
*/
async function evaluateOrTimeout(fn, ms, error_msg = 'Operation timed out') {
    // define a Promise which rejects after ms milliseconds
    const timeout_promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(error_msg)), ms)
    });
    return Promise.race([fn, timeout_promise]);
};

// const getPopupPage = async(worker, browser) => {

// };

beforeEach(async () => {
    browser = await puppeteer.launch({
        // Set headless to 'new' to hide Chrome if running as part of an automated build.
        headless: 'new',
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

test('Chrome opens a pop-up window', async () => {
    //try to open the extension popup. wait at most 2000 milliseconds to open the pop-up. note that this
    // does not require the correct page or any page at all in the pop-up, just that the extension config
    // is correct enough that chrome knows there is supposed to be a pop-up
    await expect(
        evaluateOrTimeout(worker.evaluate(() => chrome.action.openPopup()), 3000, 'Opening pop-up timed out')
    ).resolves.not.toThrow();
});

test('Chrome opens the correct pop-up window', async () => {
    // open the pop-up window
    await worker.evaluate(() => chrome.action.openPopup());
    // check that the correct page opened in the pop-up window
    await expect(
        evaluateOrTimeout(
            // get the page in the browser context that ends with popup.html
            browser.waitForTarget(target => target.type() === 'page' && target.url().endsWith('popup.html')),
            3000, 'Failed to find pop-up window')
    ).resolves.not.toThrow();
});

test('The pop-up page has the correct header', async () => {
    // open the pop-up window and get the pop-up page
});