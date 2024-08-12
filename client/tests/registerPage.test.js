const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('RegisterPage Component Interactions', () => {
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

    it('should load the register page when not logged in', async () => {
        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        const element = await driver.findElement(By.css('.text-center'))
        expect(element).to.not.be.null
    })

    it('should create a new user with valid credentials', async () => {
        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

        await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const submitButton = await driver.findElement(By.css('button[type="submit"]'))
        await submitButton.click()

        const url = await driver.getCurrentUrl()
        expect(url).to.equal('http://localhost:3000/login')

        await fetch(`http://localhost:3001/delete-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'testUser@gmail.com' })
        })
    })

    it('should fail to register with invalid credentials', async () => {
        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

        await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
        await driver.findElement(By.css('#floatingEmail')).sendKeys('invalidEmail')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const submitButton = await driver.findElement(By.css('button[type="submit"]'))
        await submitButton.click()

        const url = await driver.getCurrentUrl()
        expect(url).not.to.equal('http://localhost:3000/login')
        expect(url).to.equal('http://localhost:3000/register')
    })

    it('should fail to register with missing credentials', async () => {
        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

        await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
        await driver.findElement(By.css('#floatingEmail')).sendKeys('')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const submitButton = await driver.findElement(By.css('button[type="submit"]'))
        await submitButton.click()

        const url = await driver.getCurrentUrl()
        expect(url).not.to.equal('http://localhost:3000/login')
        expect(url).to.equal('http://localhost:3000/register')
    })

    it('should redirect to "/home" if already logged in', async () => {
        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

        await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const registerButton = await driver.findElement(By.css('button[type="submit"]'))
        await registerButton.click()

        const afterRegisterUrl = await driver.getCurrentUrl()
        expect(afterRegisterUrl).to.equal('http://localhost:3000/login')

        // Sample login
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        await loginButton.click()
        await driver.sleep(500)

        const afterLoginUrl = await driver.getCurrentUrl()
        expect(afterLoginUrl).to.equal('http://localhost:3000/home')

        // Try to access register page after logging in
        await driver.get('http://localhost:3000/register')
        const url = await driver.getCurrentUrl()
        expect(url).to.not.equal('http://localhost:3000/register')
        expect(url).to.equal('http://localhost:3000/home')

        await fetch(`http://localhost:3001/delete-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'testUser@gmail.com' })
        })
    })
})