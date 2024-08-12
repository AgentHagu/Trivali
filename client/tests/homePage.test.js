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

        // Register Test User
        await driver.get('http://localhost:3000/register')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)

        await driver.findElement(By.css('#floatingUsername')).sendKeys('Test User')
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const registerButton = await driver.findElement(By.css('button[type="submit"]'))
        await registerButton.click()

        // Login Test User
        await driver.get('http://localhost:3000/login')

        await driver.wait(until.elementLocated(By.css('.text-center')), 5000)
        await driver.findElement(By.css('#floatingEmail')).sendKeys('testUser@gmail.com')
        await driver.findElement(By.css('#floatingPassword')).sendKeys('testPassword')

        const loginButton = await driver.findElement(By.css('button[type="submit"]'))
        await loginButton.click()
        await driver.sleep(500)
    })

    after(async () => {
        await driver.quit()

        // Delete Test User
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

        it('should display custom message when user has no projects', async () => {
            await driver.get('http://localhost:3000/home')

            const message = await driver.wait(until.elementLocated(By.css('.container h3')), 5000)
            const messageText = await message.getText()
            expect(messageText).to.equal("You currently have no projects.")
        })

        it('should display projects in project list', async () => {
            await driver.get('http://localhost:3000/home')

            // Create Project
            const createProjectButton = await driver.wait(until.elementLocated(By.css('.btn.btn-primary.position-fixed.bottom-0.end-0.mb-5.me-5.d-flex.align-items-center.justify-content-center')), 5000)
            createProjectButton.click()

            const confirmButton = await driver.wait(until.elementLocated(By.css('.modal-footer .btn.btn-primary')), 5000)
            await confirmButton.click()

            await driver.get('http://localhost:3000/home')

            const projectListItem = await driver.wait(until.elementLocated(By.css('.list-group.fs-5 a')), 5000)
            expect(projectListItem).to.not.be.null

            await projectListItem.click()

            const url = await driver.getCurrentUrl()
            const urlPattern = /^http:\/\/localhost:3000\/projects\/[a-zA-Z0-9_-]+$/
            expect(url).to.match(urlPattern)
        })
    })

    describe('Create Project Modal Form', () => {
        // Go to home page and open modal form
        beforeEach(async () => {
            await driver.get('http://localhost:3000/home')

            const createProjectButton = await driver.wait(until.elementLocated(By.css('.btn.btn-primary.position-fixed.bottom-0.end-0.mb-5.me-5.d-flex.align-items-center.justify-content-center')), 5000)
            createProjectButton.click()
        })

        it('should be able to create a default project', async () => {
            const confirmButton = await driver.wait(until.elementLocated(By.css('.modal-footer .btn.btn-primary')), 5000)
            await confirmButton.click()

            const url = await driver.getCurrentUrl()
            const urlPattern = /^http:\/\/localhost:3000\/projects\/[a-zA-Z0-9_-]+$/
            expect(url).to.match(urlPattern)
        })

        it('should be able to create a project with custom name', async () => {
            await driver.findElement(By.css('#projectName')).sendKeys('Test Project')
            const confirmButton = await driver.wait(until.elementLocated(By.css('.modal-footer .btn.btn-primary')), 5000)
            await confirmButton.click()

            const url = await driver.getCurrentUrl()
            const urlPattern = /^http:\/\/localhost:3000\/projects\/[a-zA-Z0-9_-]+$/
            expect(url).to.match(urlPattern)
        })

        it('should be able to create a project with added users', async () => {
            // Register new Test User
            await fetch(`http://localhost:3001/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username: 'Other Test User', email: 'otherTestUser@gmail.com', password: 'otherTestPassword' })
            })

            await driver.findElement(By.css('#addUsers')).sendKeys('otherTestUser@gmail.com')
            const searchButton = await driver.wait(until.elementLocated(By.css('.bi.bi-search')), 5000)
            searchButton.click()

            const confirmButton = await driver.wait(until.elementLocated(By.css('.modal-footer .btn.btn-primary')), 5000)
            await confirmButton.click()

            const url = await driver.getCurrentUrl()
            const urlPattern = /^http:\/\/localhost:3000\/projects\/[a-zA-Z0-9_-]+$/
            expect(url).to.match(urlPattern)
            
            // Delete new Test User
            await fetch(`http://localhost:3001/delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: 'otherTestUser@gmail.com' })
            })
        })
    }) 
})
