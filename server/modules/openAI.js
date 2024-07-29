const OpenAI = require("openai")

module.exports = (app) => {
    const openAiApiKey = process.env.OPENAI_API_KEY
    const openAi = new OpenAI({ apiKey: openAiApiKey })

    async function generateItinerary(prompt) {

        try {
            const response = await openAi.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
            // console.log(response.choices[0])
            return response.choices[0].message.content
        } catch (error) {
            console.log("Error generating itinerary: ", error)
        }
    }

    app.post('/openAi-generate-itinerary', async (req, res) => {
        const { prompt } = req.body
        const padded_prompt =
            `I will give you a prompt and I want you to give me a sample travel
            itinerary for that prompt. Within the itinerary, give details about
            the activities for each day and their locations, as well as the rough
            timings for each activity. If the given prompt is not suitable for
            creating an itinerary, do not force yourself to create an itinerary
            from it and instead return the message "Invalid or improper prompt
            for itinerary creation: [REASON]. Replace the [REASON] with a short 
            explanation why the prompt was unsuitable. The prompt for the itinerary
            is as follows: ${prompt}`

        try {
            const itinerary = await generateItinerary(padded_prompt)
            res.json({ itinerary })
        } catch (error) {
            res.status(500).json({ error: 'Error generating itinerary ' })
        }
    })

    app.post('/openAi-generate-itinerary-json', async (req, res) => {
        const { prompt } = req.body
        const padded_prompt =
            `const Itinerary = new Schema({
                 _id: false,

                // Each row represents a day of the itinerary table
                rows: [{
                    _id: false,
                    id: Number,

                    // Activities represents the list of activities for the day
                    activities: [{
                        _id: false,
                        id: Number,
                        time: {
                            start: String,
                            end: String
                        },
                        location: Object,
                        details: {
                            page: String,
                            number: Number
                        }
                    }]
                }]
            })

            Return me a sample itinerary given in a json file. I want the itinerary to be in this json format. 
            The array [rows] contains a "row" object which represents a day to show on the itinerary table. 
            Each row has an array of "activities", where each "activity" represents the activity to do during 
            that day. This activity must have a unique id, a time object (with both start and end timing strings represented in 
            24H format, such as 00:00 for 12am), a location object (a google Maps API Places object with both the location's geometry 
            and name) and details (page is simply the string "Itinerary" and number is simply a unique number 
            for each activity). Do not wrap the json codes in JSON markers and only return the json file, do 
            not include any other irrelavant text. The following text will be the prompt of the desired 
            itinerary by the user: ${prompt}`

        try {
            const itinerary = await generateItinerary(padded_prompt)
            res.json({ itinerary })
        } catch (error) {
            res.status(500).json({ error: 'Error generating itinerary ' })
        }
    })
}