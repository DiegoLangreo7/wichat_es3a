const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/historic-page.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
            : await puppeteer.launch({headless: false, slowMo: 25});
        page = await browser.newPage();

        await page
            .goto("http://localhost:3000", {
                waitUntil: "networkidle0",
            })
            .catch(() => {
            });
    });

    test('I access the historic', ({given, when, then}) => {

        let username;
        let password;

        given('I am on the main page', async () => {
            username = "historicUser"
            password = "123456q@"
            await page.waitForSelector("#singup-link", { timeout: 3000 });
            await expect(page).toClick('button', { text: "Don't have an account? Sign up here." });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        }, 3000);

        when('I click on the "Historic" button', async () => {
            await page.waitForSelector("#user-menu-button", { timeout: 3000 });
            await expect(page).toClick("button", { text: username });
            await expect(page).toClick("li", { text: "Historial" });
        }, 4000);

        then('I can see the historic page', async () => {
            await expect(page).toMatchElement("h5", { text: "📊 Estadísticas" });
        }, 3000);
    }, 20000);

    afterAll(async ()=>{
        browser.close()
    });

});