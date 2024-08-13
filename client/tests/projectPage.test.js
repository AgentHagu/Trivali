const { Builder, By, until, Actions } = require('selenium-webdriver')
const chrome = require('chromedriver')
const firefox = require('selenium-webdriver/firefox')

describe('Project Page Interactions', () => {
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

        await driver.get('http://localhost:3000/home')
        await driver.sleep(500)
        // Create Project
        const createProjectButton = await driver.wait(until.elementLocated(By.css('.btn.btn-primary.position-fixed.bottom-0.end-0.mb-5.me-5.d-flex.align-items-center.justify-content-center')), 5000)
        await createProjectButton.click()

        const confirmButton = await driver.wait(until.elementLocated(By.css('.modal-footer .btn.btn-primary')), 5000)
        await confirmButton.click()
    })

    // TODO: Add delete project
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

    beforeEach(async () => {
        // Redirect to Project page
        await driver.get('http://localhost:3000/home')

        const projectListItem = await driver.wait(until.elementLocated(By.css('.list-group.fs-5 a')), 5000)
        await projectListItem.click()
        await driver.sleep(500)
    })

    describe('Project Page Contents', () => {
        it('should load project page', async () => {
            const content = await driver.findElement(By.css('div .container.mt-3'), 5000)
            expect(content).to.not.be.null
        })

        it('should Untitled Project for unnamed project', async () => {
            const projectName = await driver.findElement(By.css('.row .col h1'), 5000)
            const projectNameText = await projectName.getText()
            expect(projectNameText).to.equal('Untitled Project')
        })

        it('should have Manage Project button', async () => {
            const manageUsersButton = await driver.findElement(By.css('.row .col.d-flex button'), 5000)
            expect(manageUsersButton).to.not.be.null
        })
    })

    describe('Planning Tab Contents', () => {
        beforeEach(async () => {
            const tabGroup = await driver.findElements(By.css('.btn-group.btn-group-lg button'), 5000)
            const planningTabButton = tabGroup[0]
            await planningTabButton.click()
        })

        it('should load Planning tab', async () => {
            const planningLabel = await driver.findElement(By.css('.row.mb-2 .col-8.pt-2.d-flex.flex-column h3'), 5000)
            const planningText = await planningLabel.getText()
            expect(planningText).to.equal("Planning:")
        })
    })

    describe('Itinerary Tab Contents', () => {
        beforeEach(async () => {
            const tabGroup = await driver.findElements(By.css('.btn-group.btn-group-lg button'), 5000)
            const itineraryTabButton = tabGroup[1]
            await itineraryTabButton.click()
        })

        it('should load Itinerary tab', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            expect(itineraryTable).to.not.be.null
        })

        it('should load a custom context menu', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            const actions = driver.actions({ async: true })
            await actions.contextClick(itineraryTable).perform()

            const contextMenu = await driver.findElement(By.css('div .contexify.contexify_willEnter-fade'))
            expect(contextMenu).to.not.be.null
        })

        it('should add a new activity to itinerary table', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            const actions = driver.actions({ async: true })
            await actions.contextClick(itineraryTable).perform()

            let initialRows = await driver.findElements(By.css('tr'))
            initialRows = initialRows.length

            const contextMenu = await driver.findElements(By.css('.contexify.contexify_willEnter-fade .contexify_item'))
            const addActivityButton = contextMenu[0]
            await addActivityButton.click()

            let finalRows = await driver.findElements(By.css('tr'))
            finalRows = finalRows.length

            expect(finalRows).to.equal(initialRows + 1)
        })

        it('should remove an activity from itinerary table', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            const actions = driver.actions({ async: true })
            await actions.contextClick(itineraryTable).perform()

            let initialRows = await driver.findElements(By.css('tr'))
            initialRows = initialRows.length

            const contextMenu = await driver.findElements(By.css('.contexify.contexify_willEnter-fade .contexify_item'))
            const removeActivityButton = contextMenu[1]
            await removeActivityButton.click()

            let finalRows = await driver.findElements(By.css('tr'))
            finalRows = finalRows.length

            expect(finalRows).to.equal(initialRows - 1)
        })

        it('should add a new day to itinerary table', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            const actions = driver.actions({ async: true })
            await actions.contextClick(itineraryTable).perform()

            let initialRows = await driver.findElements(By.css('tr'))
            initialRows = initialRows.length

            const contextMenu = await driver.findElements(By.css('.contexify.contexify_willEnter-fade .contexify_item'))
            const addDayButton = contextMenu[2]
            await addDayButton.click()

            let finalRows = await driver.findElements(By.css('tr'))
            finalRows = finalRows.length

            expect(finalRows).to.equal(initialRows + 1)
        })

        it('should remove a day from itinerary table', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            const actions = driver.actions({ async: true })
            await actions.contextClick(itineraryTable).perform()

            let initialRows = await driver.findElements(By.css('tr'))
            initialRows = initialRows.length

            const contextMenu = await driver.findElements(By.css('.contexify.contexify_willEnter-fade .contexify_item'))
            const removeDayButton = contextMenu[3]
            await removeDayButton.click()

            let finalRows = await driver.findElements(By.css('tr'))
            finalRows = finalRows.length

            expect(finalRows).to.equal(initialRows - 1)
        })

        it('should not remove last remaining day from itinerary table', async () => {
            const itineraryTable = await driver.findElement(By.css('table'), 5000)
            const actions = driver.actions({ async: true })
            await actions.contextClick(itineraryTable).perform()

            const contextMenu = await driver.findElements(By.css('.contexify.contexify_willEnter-fade .contexify_item'))
            const removeDayButton = contextMenu[3]
            await removeDayButton.click()

            let finalRows = await driver.findElements(By.css('tbody tr'))
            finalRows = finalRows.length

            expect(finalRows).to.equal(1)
        })

        it('should have autocomplete suggestions for location column', async () => {
            const locationInput = await driver.findElement(By.css('input.border-0.h-100.p-2.pac-target-input'), 5000)
            await locationInput.sendKeys('Test')
            await locationInput.click()

            const autocompleteSuggestions = await driver.findElement(By.css('div.pac-container.pac-logo, div.pac-container.pac-logo.hdpi'), 5000)
            expect(autocompleteSuggestions).to.not.be.null
        })

        it('should load the openAI modal form', async () => {
            const openAIModalButton = await driver.findElement(By.css('button svg'), 5000)
            await openAIModalButton.click()

            const openAIModal = await driver.findElement(By.css('#openAI'))
            expect(openAIModal).to.not.be.null
        })

        it('should generate itinerary for valid prompts', async function () {
            this.timeout(60000)
            const openAIModalButton = await driver.findElement(By.css('button svg'), 5000)
            await openAIModalButton.click()

            await driver.findElement(By.css('#itineraryRequirements'), 5000).sendKeys('I want a 1 day trip to Singapore')

            const generateItineraryButton = await driver.findElement(By.css('form div button.btn.btn-primary'), 5000)
            await generateItineraryButton.click()
            await driver.sleep(20000)

            const generatedItinerary = await driver.findElement(By.css('.wmde-markdown'), 5000)
            expect(generatedItinerary).to.not.be.null
        })

        it('should fail to generate itinerary for invalid prompts', async function () {
            this.timeout(60000)
            const openAIModalButton = await driver.findElement(By.css('button svg'), 5000)
            await openAIModalButton.click()

            await driver.findElement(By.css('#itineraryRequirements'), 5000).sendKeys('')

            const generateItineraryButton = await driver.findElement(By.css('form div button.btn.btn-primary'), 5000)
            await generateItineraryButton.click()
            await driver.sleep(5000)

            let generatedItinerary = await driver.findElement(By.css('.wmde-markdown > p:nth-child(1)'), 5000)
            generatedItinerary = await generatedItinerary.getText()
            expect(generatedItinerary).to.have.string('Invalid or improper prompt for itinerary creation:')
        })
    })

    describe('Expenses Tab Contents', () => {
        beforeEach(async () => {
            const tabGroup = await driver.findElements(By.css('.btn-group.btn-group-lg button'), 5000)
            const expensesTabButton = tabGroup[2]
            await expensesTabButton.click()
        })

        it('should load Expenses Tab', async () => {
            const content = await driver.findElement(By.css('.me-auto'), 5000)
            const heading = await content.getText()
            expect(heading).to.equal('Budgets')
        })

        it('should load add budget modal form', async () => {
            const addBudgetButton = await driver.findElement(By.css('.btn-primary'), 5000)
            await addBudgetButton.click()

            const addBudgetModalForm = await driver.findElement(By.css('div.modal-title'))
            expect(addBudgetModalForm).to.not.be.null
            const heading = await addBudgetModalForm.getText()
            expect(heading).to.equal('New Budget')
        })

        it('should create new budget', async () => {
            const addBudgetButton = await driver.findElement(By.css('.btn-primary'), 5000)
            await addBudgetButton.click()

            await driver.findElement(By.css(`#name`), 5000).sendKeys('Test Budget')
            await driver.findElement(By.css(`#max`), 5000).sendKeys('1000')

            const addButton = await driver.findElement(By.css('button.btn-primary:nth-child(1)'), 5000)
            await addButton.click()

            const budgetCard = await driver.findElement(By.css('div.card:nth-child(1)'), 5000)
            expect(budgetCard).to.not.be.null
            const heading = await driver.findElement(By.css('div.card:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)'), 5000).getText()
            expect(heading).to.equal('Test Budget')
        })

        it('should load add expense modal form', async () => {
            const addExpenseButton = await driver.findElement(By.css('button.btn-outline-primary:nth-child(3)'), 5000)
            await addExpenseButton.click()

            const addExpenseModalForm = await driver.findElement(By.css('div.modal-title'))
            expect(addExpenseModalForm).to.not.be.null
            const heading = await addExpenseModalForm.getText()
            expect(heading).to.equal('New Expense')
        })

        it('should add new expense', async () => {
            const addExpenseButton = await driver.findElement(By.css('button.btn-outline-primary:nth-child(3)'), 5000)
            await addExpenseButton.click()

            await driver.findElement(By.css('#description'), 5000).sendKeys('Test Expense')
            await driver.findElement(By.css('#amount'), 5000).sendKeys('100')

            await driver.findElement(By.css('#budgetId'), 5000).click()
            await driver.findElement(By.css('#budgetId > option:nth-child(2)'), 5000).click()

            await driver.findElement(By.css('button.btn-primary:nth-child(1)'), 5000).click()
        })

        it('should load view expense modal form', async () => {
            const viewExpenseButton = await driver.findElement(By.css(`.btn-outline-secondary`), 5000)
            await viewExpenseButton.click()

            const viewExpenseModalForm = await driver.findElement(By.css('div.modal-title > div:nth-child(1) > div:nth-child(1)'), 5000)
            expect(viewExpenseModalForm).to.not.be.null
            const heading = await viewExpenseModalForm.getText()
            expect(heading).to.equal('Expenses = Test Budget')

            const expenses = await driver.findElements(By.css('.vstack .hstack'), 5000)
            expect(expenses.length).to.equal(1)
        })
    })

    describe('Map Tab Contents', () => {
        beforeEach(async () => {
            const tabGroup = await driver.findElements(By.css('.btn-group.btn-group-lg button'), 5000)
            const mapTabButton = tabGroup[3]
            await mapTabButton.click()
        })

        it('should load Map tab', async () => {
            const content = await driver.findElement(By.css('.col-9 > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)'), 5000)
            expect(content).not.to.be.null
        })

        it('should have clickable itinerary table', async () => {
            const clickableItinerary = await driver.findElement(By.css('table.table:nth-child(1)'), 5000)
            // Should not return error when trying to click
            await clickableItinerary.click()
        })

        it('should have toggleable View Routes', async () => {
            const viewRoutesButton = await driver.findElement(By.css('.form-check-input'), 5000)
            // Should not return error when trying to click
            await viewRoutesButton.click()
            await viewRoutesButton.click()
        })

        it('should have clickable travel modes', async () => {
            const drivingButton = await driver.findElement(By.css('.bi-car-front-fill'), 5000)
            const transitButton = await driver.findElement(By.css('.bi-train-front-fill'), 5000)
            const walkingButton = await driver.findElement(By.css('.bi-person-walking'), 5000)

            // Should not return error when trying to click
            await drivingButton.click()
            await transitButton.click()
            await walkingButton.click()
        })
    })

    describe('Weather Tab Contents', () => {
        beforeEach(async () => {
            const tabGroup = await driver.findElements(By.css('.btn-group.btn-group-lg button'), 5000)
            const weatherTabButton = tabGroup[4]
            await weatherTabButton.click()
        })

        it('should load Weather tab', async () => {
            const heading = await driver.findElement(By.css('.me-auto'), 5000).getText()
            expect(heading).to.equal('Weather')
        })

        it('should load add weather modal form', async () => {
            const addLocationButton = await driver.findElement(By.css('.btn-primary'), 5000)
            await addLocationButton.click()

            const heading = await driver.findElement(By.css('div.modal-title'), 5000).getText()
            expect(heading).to.equal('Add Location')
        })

        it('should add new weather location card', async () => {
            const addLocationButton = await driver.findElement(By.css('.btn-primary'), 5000)
            await addLocationButton.click()

            await driver.findElement(By.css('#formLocation'), 5000).sendKeys('Singapore')
            await driver.findElement(By.css('div.modal-footer:nth-child(2) > button:nth-child(2)'), 5000).click()
            await driver.sleep(500)

            const cards = await driver.findElements(By.css('.card-body'), 5000)
            expect(cards.length).to.equal(1)
        })

        it('should delete weather location card', async () => {
            const deleteLocationButton = await driver.findElement(By.css('button.mt-3'), 5000)
            await deleteLocationButton.click()

            const cards = await driver.findElements(By.css('.card-body'), 5000)
            expect(cards.length).to.equal(0)
        })
    })
})
