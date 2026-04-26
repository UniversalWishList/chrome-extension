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
        // **Harry** so testing can work with GITHUB ACTIONS CI (Feel free to remove if necessary)
        args: ['--no-sandbox'],
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

test('Pop-up window has the correct page URL', async () => {
    const popupPage = await getPopupPage(worker, browser);
    const url = popupPage.url();
    expect(url).toContain(POPUP_FILE);
});

test('The pop-up page has the correct header', async () => {
    const popupPage = await getPopupPage(worker, browser);
    const headerExists = await popupPage.evaluate(() => {
        const header = document.querySelector('h1'); // Adjust selector as needed
        return header && header.textContent.includes('Universal Wish List');
    });
    expect(headerExists).toBe(true);
});

test('The pop-up page has the correct background color', async () => {
    const popupPage = await getPopupPage(worker, browser);
    
    // get the hex code of the background color of the current page
    const backgroundColor = await popupPage.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(backgroundColor).toBe('rgb(77, 0, 77)')
});

test('The pop-up page has a button', async () => {
    const popupPage = await getPopupPage(worker, browser);
    // check if a button element exists in the popup page
    const hasButton = await popupPage.evaluate(() => {
        return document.querySelector('button') !== null;
    });
    expect(hasButton).toBe(true);
});

test('The pop-up page runs the addItemToList.js script when it loads', async () => {
    const popupPage = await getPopupPage(worker, browser);
    // check if the addItemToList.js script has been loaded
    const hasScript = await popupPage.evaluate(() => {
        return document.querySelector('script[src="addItemToList.js"]') !== null;
    });
    expect(hasScript).toBe(true);
});

test('Clicking the button changes the text of the button', async () => {
    const popupPage = await getPopupPage(worker, browser);

    // get the button element's text
    const buttonText = await popupPage.evaluate(() => {
        const btn = document.querySelector('button');
        return btn.innerText;
    });

    // click the button
    await popupPage.waitForSelector('button[id="addItemToList"]');
    await popupPage.click('button[id="addItemToList"]');

    // check that the button now has different text
    const newButtonText = await popupPage.evaluate(() => {
        const btn = document.getElementById('addItemToList')
        return btn.innerText;
    });
    expect(buttonText).not.toBe(newButtonText);
});

test('Clicking the button disables it', async () => {
    const popupPage = await getPopupPage(worker, browser);

    // check that the button is enabled
    const buttonDisabled = await popupPage.evaluate(() => {
        const btn = document.getElementById('addItemToList')
        return btn.disabled;
    });
    expect(buttonDisabled).toBeFalsy();

    // click the button
    await popupPage.waitForSelector('button[id="addItemToList"]');
    await popupPage.click('button[id="addItemToList"]');

    // check that the button is disabled
    const newButtonDisabled = await popupPage.evaluate(() => {
        const btn = document.getElementById('addItemToList')
        return btn.disabled;
    });
    expect(newButtonDisabled).toBeTruthy();
});

test('Clicking the button logs the current URL', async () => {
    // navigate to a browser page
    const url = 'https://example.com'
    const page = await browser.newPage();
    await page.goto(url);

    const popupPage = await getPopupPage(worker, browser);

    // register to capture console messages
    const consoleMessages = [];
    popupPage.on('console', msg => {
        consoleMessages.push(msg.text());
    });

    // click the button
    await popupPage.waitForSelector('button[id="addItemToList"]');
    await popupPage.click('button[id="addItemToList"]');

    expect(consoleMessages.some(msg => msg.includes(url))).toBe(true);
});

test('The pop-up page has a drop-down menu', async () => {
    const popupPage = await getPopupPage(worker, browser);
    // check if a select element exists in the popup page
    const hasSelect = await popupPage.evaluate(() => {
        return document.querySelector('select') !== null;
    });
    expect(hasSelect).toBe(true);
});

test('The pop-up page runs the updateListDropdown.js script when it loads', async () => {
    const popupPage = await getPopupPage(worker, browser);
    // check if the updateListDropdown.js script has been loaded
    const hasScript = await popupPage.evaluate(() => {
        return document.querySelector('script[src="updateListDropdown.js"]') !== null;
    });
    expect(hasScript).toBe(true);
});
