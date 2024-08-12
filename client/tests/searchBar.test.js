const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('Search Bar Interactions', () => {
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

    // Go to home page and open modal form
    beforeEach(async () => {
        await driver.get('http://localhost:3000/home')

        const createProjectButton = await driver.wait(until.elementLocated(By.css('.btn.btn-primary.position-fixed.bottom-0.end-0.mb-5.me-5.d-flex.align-items-center.justify-content-center')), 5000)
        createProjectButton.click()
    })

    it('should load an interactable search bar', async () => {
        const searchBar = await driver.findElement(By.css('#addUsers'), 5000)
        expect(searchBar).to.not.be.null
        const searchButton = await driver.wait(until.elementLocated(By.css('.bi.bi-search')), 5000)
        expect(searchButton).to.not.be.null
    })

    it('should search and add users using email', async () => {
        // Register new Test User
        await fetch(`http://localhost:3001/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username: 'Other Test User', email: 'otherTestUser@gmail.com', password: 'otherTestPassword' })
        })

        let initialLiCount = await driver.findElements(By.css('li span'))
        initialLiCount = initialLiCount.length

        await driver.findElement(By.css('#addUsers')).sendKeys('otherTestUser@gmail.com')
        const searchButton = await driver.wait(until.elementLocated(By.css('.bi.bi-search')), 5000)
        await searchButton.click()

        const finalLiElements = await driver.findElements(By.css('li span'))
        const finalLiCount = finalLiElements.length

        expect(finalLiCount).to.equal(initialLiCount + 1)

        const addedUserLi = finalLiElements[1]
        const addedUserDetails = await addedUserLi.getText()
        expect(addedUserDetails).to.equal('Other Test User (Email: otherTestUser@gmail.com)')

        // Delete new Test User
        await fetch(`http://localhost:3001/delete-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'otherTestUser@gmail.com' })
        })
    })

    // it('should search and add users using ID', async () => {

    // })

    it('should remove users from added users list', async () => {
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
        await searchButton.click()

        let initialLiCount = await driver.findElements(By.css('li span'))
        initialLiCount = initialLiCount.length

        const removeButton = await driver.wait(until.elementLocated(By.css('li button .bi.bi-person-fill-dash')), 5000)
        await removeButton.click()

        const finalLiElements = await driver.findElements(By.css('li span'))
        const finalLiCount = finalLiElements.length

        expect(finalLiCount).to.equal(initialLiCount - 1)

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
