const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./e2e/features/register-form.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
            : await puppeteer.launch({ headless: false, slowMo: 25 });
        page = await browser.newPage();

        await page
            .goto("http://localhost:3000", {
                waitUntil: "networkidle0",
            })
            .catch(() => {});
    });

    test('The user is not registered in the site', ({given,when,then}) => {

        let username;
        let password;

        given('An unregistered user', async () => {
            username = "signInUser"
            password = "123456q@"
            await page.waitForSelector("#signup-link", { timeout: 10000 });
            await expect(page).toClick('button', { text: "Don't have an account? Sign up here." });
        });

        when('I fill the data in the form and press submit', async () => {
            await page.waitForSelector("#add-user-main-container", { timeout: 10000 });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        then('The main page should be displayed', async () => {
            await page.waitForSelector("#user-menu-button", { timeout: 10000 });
            await expect(page).toClick("button", { text: username });
            await expect(page).toClick("li", { text: "Cerrar sesión" });
        });
    }, 20000)

    test('The user is already registered in the site', ({given,when,then}) => {

        let username;
        let password;

        given('A registered user', async () => {
            username = "signInUser"
            password = "123456q@"
            await page.waitForSelector("#signup-link", { timeout: 10000 });
            await expect(page).toClick("button", { text: "Don't have an account? Sign up here." });
        });

        when('I fill the data in the form and press submit', async () => {
            await page.waitForSelector("#add-user-main-container", { timeout: 10000 });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        then('An error message should be displayed', async () => {
            await page.waitForSelector("#error-message", { timeout: 10000 });
            await expect(page).toMatchElement("p", { text: "El usuario " + username +" ya existe" });
        });

    }, 20000)

    test('The user is not registered in the site and the password is not valid bacause of the size', ({given,when,then}) => {

        let username;
        let password;


        given('An unregistered user', async () => {
            username = "signInUser2"
            password = "123456"
        });

        when('I fill the data in the form and press submit with an invalid password', async () => {
            await page.waitForSelector("#add-user-main-container", { timeout: 10000 });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        then('An error message should be displayed', async () => {
            await page.waitForSelector("#error-message", { timeout: 10000 });
            await expect(page).toMatchElement("p", { text: "La contraseña debe tener al menos 8 caracteres" });
        });

    }, 20000)

    test('The user is not registered in the site and the password is not valid bacause of there aren`t letters', ({given,when,then}) => {

        let username;
        let password;


        given('An unregistered user', async () => {
            username = "signInUser2"
            password = "12345678."
        });

        when('I fill the data in the form and press submit with an invalid password', async () => {
            await page.waitForSelector("#add-user-main-container", { timeout: 10000 });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        then('An error message should be displayed', async () => {
            await page.waitForSelector("#error-message", { timeout: 10000 });
            await expect(page).toMatchElement("p", { text: "La contraseña debe contener al menos una letra" });
        });

    }, 20000)

    test('The user is not registered in the site and the password is not valid bacause of there aren`t numbers', ({given,when,then}) => {

        let username;
        let password;


        given('An unregistered user', async () => {
            username = "signInUser2"
            password = "qqqqqqqqq."
        });

        when('I fill the data in the form and press submit with an invalid password', async () => {
            await page.waitForSelector("#add-user-main-container", { timeout: 10000 });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        then('An error message should be displayed', async () => {
            await page.waitForSelector("#error-message", { timeout: 10000 });
            await expect(page).toMatchElement("p", { text: "La contraseña debe contener al menos un número" });
        });

    }, 20000)

    test('The user is not registered in the site and the password is not valid bacause of there aren`t special characters', ({given,when,then}) => {

        let username;
        let password;


        given('An unregistered user', async () => {
            username = "signInUser2"
            password = "1111qqqqqqqq"
        });

        when('I fill the data in the form and press submit with an invalid password', async () => {
            await page.waitForSelector("#add-user-main-container", { timeout: 10000 });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        then('An error message should be displayed', async () => {
            await page.waitForSelector("#error-message", { timeout: 10000 });
            await expect(page).toMatchElement("p", { text: "La contraseña debe contener al menos un caracter especial (!@#$%^&*.)" });
        });

    }, 20000)

    afterAll(async ()=>{
        browser.close()
    })

});