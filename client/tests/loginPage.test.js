const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('LoginPage Component Interactions', () => {
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

        const submitButton = await driver.findElement(By.css('button[type="submit"]'))
        await submitButton.click()

        await driver.wait(until.urlIs('http://localhost:3000/login'), 5000)
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

    it('should load the login page when not logged in', async () => {
        await driver.get('http://localhost:3000/login')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        const element = await driver.findElement(By.css('.text-center'))
        expect(element).to.not.be.null
    })

    it('should log in an existing user', async () => {
        await driver.get('http://localhost:3000/login')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        await loginButton.click()
        await driver.sleep(500)

        const afterLoginUrl = await driver.getCurrentUrl()
        expect(afterLoginUrl).to.equal('http://localhost:3000/home')
        await driver.executeScript("localStorage.removeItem('token');")
    })

    it('should not log in with invalid credentials', async () => {
        await driver.get('http://localhost:3000/login')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        await driver.findElement(By.css('#floatingEmail')).sendKeys('invalidEmail@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        await loginButton.click()
        await driver.sleep(500)

        const afterLoginUrl = await driver.getCurrentUrl()
        expect(afterLoginUrl).not.to.equal('http://localhost:3000/home')
        expect(afterLoginUrl).to.equal('http://localhost:3000/login')
    })

    it('should not log in with missing credentials', async () => {
        await driver.get('http://localhost:3000/login')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        await driver.findElement(By.css('#floatingEmail')).sendKeys('')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('')

        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        await loginButton.click()
        await driver.sleep(500)

        const afterLoginUrl = await driver.getCurrentUrl()
        expect(afterLoginUrl).not.to.equal('http://localhost:3000/home')
        expect(afterLoginUrl).to.equal('http://localhost:3000/login')
    })
})