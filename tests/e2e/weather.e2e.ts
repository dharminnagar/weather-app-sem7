/**
 * Selenium end-to-end tests that drive Chrome against a running app.
 *
 * Start the app first (`bun run dev` or `bun run build && bun run start`), then
 * run `bun run test:e2e`. Set `E2E_BASE_URL` to test another host and
 * `HEADED=1` to watch the browser.
 */
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  setDefaultTimeout,
  test,
} from 'bun:test';
import {
  Builder,
  By,
  until,
  type WebDriver,
  type WebElement,
} from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const WAIT_MS = 15_000;
const DESKTOP = { width: 1280, height: 900 };
const PHONE = { width: 375, height: 812 };
const FAVOURITES = 'nav[aria-label="Favourite cities"]';
const CURRENT_WEATHER = 'section[aria-labelledby="current-weather-heading"]';

setDefaultTimeout(60_000);

let driver: WebDriver;

const find = (css: string): Promise<WebElement> =>
  driver.wait(until.elementLocated(By.css(css)), WAIT_MS);

const findButton = (label: string): Promise<WebElement> =>
  driver.wait(
    until.elementLocated(
      By.xpath(
        `//button[@aria-label=${JSON.stringify(label)} or normalize-space()=${JSON.stringify(label)}]`
      )
    ),
    WAIT_MS
  );

const textOf = async (css: string): Promise<string> =>
  (await find(css)).getText();

async function searchCity(city: string): Promise<void> {
  const input = await find('#city-search');
  await input.clear();
  await input.sendKeys(city);
  await (await findButton('Search')).click();
}

async function waitForReport(city: string): Promise<void> {
  const heading = await find('#current-weather-heading');
  await driver.wait(until.elementTextContains(heading, city), WAIT_MS);
}

const rootTheme = (): Promise<string> =>
  driver.executeScript<string>(
    'return document.documentElement.dataset.theme;'
  );

async function assertServerIsUp(): Promise<void> {
  try {
    await fetch(BASE_URL);
  } catch {
    throw new Error(
      `No app at ${BASE_URL}. Start it with "bun run dev" before running the e2e tests.`
    );
  }
}

beforeAll(async () => {
  await assertServerIsUp();
  const options = new Options();
  options.addArguments(`--window-size=${DESKTOP.width},${DESKTOP.height}`);
  if (!process.env.HEADED) options.addArguments('--headless=new');
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
});

afterAll(async () => {
  await driver?.quit();
});

beforeEach(async () => {
  await driver.manage().window().setRect(DESKTOP);
  await driver.get(BASE_URL);
  await driver.executeScript('window.localStorage.clear();');
  await driver.navigate().refresh();
});

describe('searching', () => {
  test('shows current weather, the trend chart and a 7-day forecast', async () => {
    await searchCity('London');
    await waitForReport('London');

    expect(await textOf('#current-weather-heading')).toContain(
      'United Kingdom'
    );
    expect(
      await (
        await find('section[aria-labelledby="trend-heading"] svg')
      ).getAttribute('aria-label')
    ).toMatch(/^Daily highs range from/);
    const days = await driver.findElements(
      By.css('section[aria-labelledby="forecast-heading"] li')
    );
    expect(days).toHaveLength(7);
  });

  test('explains when a city does not exist', async () => {
    await searchCity('Qwzxyplorkville');

    const alert = await find('[role="alert"]');
    await driver.wait(until.elementTextContains(alert, 'not found'), WAIT_MS);
    expect(await alert.getText()).toContain('Qwzxyplorkville');
  });
});

describe('temperature unit', () => {
  test('switches to °F and remembers it after a reload', async () => {
    await searchCity('Paris');
    await waitForReport('Paris');
    const card = await find(CURRENT_WEATHER);
    expect(await card.getText()).toContain('°C');

    await (await findButton('°F')).click();
    await driver.wait(until.elementTextContains(card, '°F'), WAIT_MS);
    expect(await card.getText()).not.toContain('°C');

    await driver.navigate().refresh();
    expect(await (await findButton('°F')).getAttribute('aria-pressed')).toBe(
      'true'
    );
  });
});

describe('theme', () => {
  test('keeps dark mode after a reload', async () => {
    await (await findButton('Dark theme')).click();
    expect(await rootTheme()).toBe('dark');

    await driver.navigate().refresh();

    expect(await rootTheme()).toBe('dark');
    expect(
      await (await findButton('Dark theme')).getAttribute('aria-pressed')
    ).toBe('true');
  });
});

describe('favourite cities', () => {
  test('saves a city, reopens it from its chip and removes it', async () => {
    await searchCity('Tokyo');
    await waitForReport('Tokyo');
    await (await findButton('Save Tokyo, Japan to favourites')).click();

    await searchCity('Paris');
    await waitForReport('Paris');
    await (
      await find(`${FAVOURITES} button[title="Show weather for Tokyo, Japan"]`)
    ).click();
    await waitForReport('Tokyo');
    const star = await find(`${CURRENT_WEATHER} button[aria-pressed]`);
    expect(await star.getAttribute('aria-pressed')).toBe('true');

    await driver.navigate().refresh();
    await (
      await find(
        `${FAVOURITES} button[aria-label="Remove Tokyo, Japan from favourites"]`
      )
    ).click();
    await driver.wait(
      async () => (await driver.findElements(By.css(FAVOURITES))).length === 0,
      WAIT_MS
    );
  });
});

describe('mobile layout', () => {
  test('fits a phone screen without sideways scrolling', async () => {
    await driver.manage().window().setRect(PHONE);
    await searchCity('London');
    await waitForReport('London');

    const overflow = await driver.executeScript<number>(
      'return document.documentElement.scrollWidth - document.documentElement.clientWidth;'
    );
    expect(overflow).toBe(0);
  });
});
