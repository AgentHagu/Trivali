const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('Home Page Interactions', () => {
    let driver
    let expect

    before(async () => {
        ({ expect } = await import('chai'))

        // driver = new Builder().forBrowser('chrome').build()
        driver = new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(new firefox.Options())
            .build()

        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

        await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const registerButton = await driver.findElement(By.css('button[type="submit"]'))
        await registerButton.click()

        await driver.get('http://localhost:3000/login')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        await loginButton.click()
    })

    after(async () => {
        await driver.quit()

        await fetch(`http://localhost:3001/delete-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'testUser@gmail.com' })
        })
    })

    describe('Home Page Contents', () => {
        it('should load the home page', async () => {
            await driver.get('http://localhost:3000/home')

            const content = await driver.wait(until.elementLocated(By.css('.container')), 5000)
            expect(content).to.not.be.null
        })
    })

    describe('Create Project Modal Form', () => {
        beforeEach(async () => {
            await driver.get('http://localhost:3000/home')

            const createProjectButton = await driver.wait(until.elementLocated(By.css('.btn.btn-primary.position-fixed.bottom-0.end-0.mb-5.me-5.d-flex.align-items-center.justify-content-center')), 5000)
            createProjectButton.click()
        })

        it('should be able to create a default project', async () => {

            const confirmButton = await driver.wait(until.elementLocated(By.css('.modal-footer .btn.btn-primary')), 5000)
            confirmButton.click()
            await driver.sleep(1000)

            const url = await driver.getCurrentUrl()
            const urlPattern = /^http:\/\/localhost:3000\/projects\/[a-zA-Z0-9_-]+$/
            expect(url).to.match(urlPattern)
        })
    }) 
})
