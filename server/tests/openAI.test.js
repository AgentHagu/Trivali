const request = require('supertest');
const express = require('express');
const openAiModule = require('../modules/openAI');

const app = express();

// Set up middleware
app.use(express.json())

// Use auth module
const openAi = openAiModule(app);

describe('OpenAI Module Routes', () => {
    it('should return an error message for invalid prompt', async () => {
        const response = await request(app)
            .post('/openAi-generate-itinerary')
            .set('Content-Type', 'application/json')
            .send({ prompt: "invalid test prompt" })

        expect(response.status).toBe(200)
        const itinerary = response.body.itinerary
        expect(itinerary).toContain('Invalid or improper prompt')
    })

    it('should return an error message for too vague prompt', async () => {
        const response = await request(app)
            .post('/openAi-generate-itinerary')
            .set('Content-Type', 'application/json')
            .send({ prompt: "I want to go somewhere for sometime" })

        expect(response.status).toBe(200)
        const itinerary = response.body.itinerary
        expect(itinerary).toContain('Invalid or improper prompt')
    })

    it('should return a proper itinerary for valid prompts', async () => {
        const response = await request(app)
            .post('/openAi-generate-itinerary')
            .set('Content-Type', 'application/json')
            .send({ prompt: "I want to go to Singapore for a 2 day trip" })

        expect(response.status).toBe(200)
        const itinerary = response.body.itinerary
        expect(itinerary).not.toContain('Invalid or improper prompt')
    }, 30000)

    it('should return a proper itinerary for detailed prompts', async () => {
        const response = await request(app)
            .post('/openAi-generate-itinerary')
            .set('Content-Type', 'application/json')
            .send({
                prompt: `I want to go to Singapore for a 2 day trip. 
                During the trip, I'd like to visit Sentosa and Marina Bay 
                Sands. I also want to try hawker center food, especially 
                satay and chicken rice. Add in time for me to also explore 
                Changi Airport and Jewel` })

        expect(response.status).toBe(200)
        const itinerary = response.body.itinerary
        expect(itinerary).not.toContain('Invalid or improper prompt')
    }, 30000)

    it('should return an itinerary json that follows the itinerary schema', async () => {
        const itineraryPlanResponse = await request(app)
            .post('/openAi-generate-itinerary')
            .set('Content-Type', 'application/json')
            .send({
                prompt: `I want to go to Singapore for a 2 day trip. 
            During the trip, I'd like to visit Sentosa and Marina Bay 
            Sands. I also want to try hawker center food, especially 
            satay and chicken rice. Add in time for me to also explore 
            Changi Airport and Jewel` })

        const itineraryPlan = itineraryPlanResponse.body.itinerary
        expect(itineraryPlan).not.toContain('Invalid or improper prompt')

        const itineraryJsonResponse = await request(app)
            .post('/openAi-generate-itinerary-json')
            .set('Content-Type', 'application/json')
            .send({
                prompt: itineraryPlan
            })

        expect(itineraryJsonResponse.status).toBe(200)
        const itinerary = JSON.parse(itineraryJsonResponse.body.itinerary)

        expect(itinerary).toHaveProperty('rows')
        expect(itinerary.rows).toBeInstanceOf(Array)
        expect(itinerary.rows[0]).toHaveProperty('id')
        expect(itinerary.rows[0].activities[0]).toHaveProperty('time')
        expect(itinerary.rows[0].activities[0].location).toHaveProperty('geometry')
    }, 60000)

    it('should call openAI API and generate responses', async () => {
        const response = openAi.generateItinerary("test prompt")
        expect(response).toBeDefined()
    })
})