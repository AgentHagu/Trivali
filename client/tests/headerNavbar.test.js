const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('HeaderNavbar Component Interactions', () => {
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

    describe('Trivali Logo Interaction', () => {
        it('should navigate to welcome page when not logged in', async () => {
            await driver.get('http://localhost:3000/')

            // Wait until the navbar is loaded
            await driver.wait(until.elementLocated(By.css('.navbar-brand')), 5000)

            const homeLink = await driver.findElement(By.css('.navbar-brand'))
            await homeLink.click()

            // Verify navigation to home page
            const url = await driver.getCurrentUrl()
            expect(url).to.equal('http://localhost:3000/welcome')
        })

        it('should navigate to home page when logged in', async () => {
            // Login
            await driver.get('http://localhost:3000/register')

            await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

            await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
            await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
            await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

            const submitButton = await driver.findElement(By.css('button[type="submit"]'))
            await submitButton.click()

            await driver.get('http://localhost:3000/login')

            await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
            await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
            await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

            const loginButton = await driver.findElement(By.css('button[type="submit"]'))
            await loginButton.click()
            await driver.sleep(500)

            await driver.get('http://localhost:3000/')
            await driver.wait(until.elementLocated(By.css('.navbar-brand')), 5000)

            const homeLink = await driver.findElement(By.css('.navbar-brand'))
            await homeLink.click()

            // Verify navigation to home page
            const url = await driver.getCurrentUrl()
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

    describe('Other Navigation Bar Functionalities', () => {
        it('should have Login button that redirects to sign in page', async () => {
            await driver.get('http://localhost:3000/')
            await driver.wait(until.elementLocated(By.css('#login')), 5000)

            const loginButton = await driver.findElement(By.css('#login'))
            await loginButton.click()
            await driver.sleep(500)

            // Verify navigation to home page
            const url = await driver.getCurrentUrl()
            expect(url).to.equal('http://localhost:3000/login')
        })

        it('should have Sign Up button that redirects to register page', async () => {
            await driver.get('http://localhost:3000/')
            await driver.wait(until.elementLocated(By.css('#register')), 5000)

            const registerButton = await driver.findElement(By.css('#register'))
            await registerButton.click()

            // Verify navigation to home page
            const url = await driver.getCurrentUrl()
            expect(url).to.equal('http://localhost:3000/register')
        })

        it('should have profile button when logged in that has logout button', async () => {
            // Login
            await driver.get('http://localhost:3000/register')

            await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

            await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
            await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
            await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

            const submitButton = await driver.findElement(By.css('button[type="submit"]'))
            await submitButton.click()

            await driver.get('http://localhost:3000/login')

            await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
            await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
            await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

            const loginButton = await driver.findElement(By.css('button[type="submit"]'))
            await loginButton.click()
            await driver.sleep(500)

            const profileButton = await driver.findElement(By.css('.bi-person-circle'))
            await profileButton.click()

            const logoutButton = await driver.findElement(By.css('.dropdown-item'))
            await logoutButton.click()

            const url = await driver.getCurrentUrl()
            expect(url).to.equal('http://localhost:3000/welcome')

            await fetch(`http://localhost:3001/delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: 'testUser@gmail.com' })
            })
        })
    })
})
