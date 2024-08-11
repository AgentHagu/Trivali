const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('Routing Logic Check', () => {
    let driver
    let expect

    before(async () => {
        ({ expect } = await import('chai'))

        // driver = new Builder().forBrowser('chrome').build()
        driver = new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(new firefox.Options())
            .build()
    })

    after(async () => {
        await driver.quit()
    })

    it('should load the welcome page', async () => {
        await driver.get('http://localhost:3000/welcome')

        const content = await driver.wait(until.elementLocated(By.css('.p-5.rounded.text-center')), 5000)
        expect(content).to.not.be.null
    })

    it('should redirect to welcome page when no route is given', async () => {
        await driver.get('http://localhost:3000/')

        const url = await driver.getCurrentUrl()
        expect(url).to.equal('http://localhost:3000/welcome')
    })
})
