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

    describe('Not Logged In Logic', () => {
        it('should redirect users to log in page if trying to access home page', async () => {
            await driver.get('http://localhost:3000/home')

            const url = await driver.getCurrentUrl()
            expect(url).to.equal('http://localhost:3000/login')
        })

        it('should redirect users to log in page if trying to access any project page', async () => {
            await driver.get('http://localhost:3000/projects/test')

            const url = await driver.getCurrentUrl()
            expect(url).to.equal('http://localhost:3000/login')
        })
    })
})
