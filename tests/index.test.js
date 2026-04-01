// beforeEach and afterEach are taken from https://developer.chrome.com/docs/extensions/how-to/test/puppeteer

const puppeteer = require('puppeteer');

const EXTENSION_PATH = '..';
const POPUP_FILE = 'popup.html'

let browser;
let worker;


/**
 * Attempt to run the asynchronous function fn in under ms milliseconds.
 * 
 * @param {function} fn An asynchronous function that returns a Promise
 * @param {number} ms The number of milliseconds to wait before timing out.
 * @param {string} error_msg The error message to return if the timeout expires.
 * 
 * @returns A promise with the result of fn or, if ms seconds pass, an error with error_msg.
*/
async function evaluateOrTimeout(fn, ms, error_msg = 'Operation timed out') {
    // define a Promise which rejects after ms milliseconds
    const timeout_promise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(error_msg)), ms)
    });
    return Promise.race([fn, timeout_promise]);
};

/**
 * Get the pop-up page for the extension.
 * 
 * @param worker The extension service worker.
 * @param browser The browser class.
 * 
 * @returns {Promise} A promise with the page in the pop-up window.
*/
async function getPopupPage(worker, browser) {
    await worker.evaluate(() => chrome.action.openPopup());
    const popupTarget = await browser.waitForTarget(
        // Assumes that there is only one page with the URL ending with POPUP_FILE
        // and that is the popup created by the extension.
        target => target.type() === 'page' && target.url().endsWith(POPUP_FILE),
    );
    return popupTarget.asPage();
};

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
            // get the page in the browser context that ends with POPUP_FILE
            browser.waitForTarget(target => target.type() === 'page' && target.url().endsWith(POPUP_FILE)),
            3000, 'Failed to find pop-up window')
    ).resolves.not.toThrow();
});

test('Pop-up window has at least 300x200px', async () => {
    const popupPage = await getPopupPage(worker, browser);

    // get the dimensions of the popup window
    const dimensions = await popupPage.evaluate(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    });

    expect(dimensions.width).toBeGreaterThanOrEqual(300);
    expect(dimensions.height).toBeGreaterThanOrEqual(200);
});

test('The pop-up page has the correct header', async () => {
    const popupPage = await getPopupPage(worker, browser);
    expect(await popupPage.content()).toContain('<h1>Universal Wish List</h1>');
});