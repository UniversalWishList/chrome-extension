# Test Documentation

Unit testing for this extension is done through [Jest](https://jestjs.io/), a Javascript testing framework, and [Puppeteer](https://pptr.dev/), a JavaScript library which provides an API to control Chrome or Firefox. By default, Puppeteer includes a compatible version of Chrome in its installation.

## Install Dependencies

`puppeteer` and `jest` are required for unit tests. These dependencies and their required versions are specified in `tests/package.json`. Install them by navigating to the test directory and running the following command:

```bash
npm install
```

## Sources

- [Test Chrome Extensions with Puppeteer | Chrome for Developers](https://developer.chrome.com/docs/extensions/how-to/test/puppeteer) (code doesn't work)
- [Tutorial: Testing Chrome Extensions with Puppeteer | GitHub](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/tutorial.puppeteer)
