const OpenAI = require("openai")

module.exports = (app) => {
    const openAiApiKey = process.env.OPENAI_API_KEY
    const openAi = new OpenAI({ apiKey: openAiApiKey })

    async function generateItinerary(prompt) {
        // const padded_prompt = `const Itinerary = new Schema({
        //                         _id: false,

        //                         // Each row represents a day of the itinerary table
        //                         rows: [{
        //                             _id: false,
        //                             id: Number,

        //                             // Activities represents the list of activities for the day
        //                             activities: [{
        //                                 _id: false,
        //                                 id: Number,
        //                                 time: {
        //                                     start: String,
        //                                     end: String
        //                                 },
        //                                 location: Object,
        //                                 details: {
        //                                     page: String,
        //                                     number: Number
        //                                 }
        //                             }]
        //                         }]
        //                     })

        //                     Return me a sample itinerary given in a json file. I want the itinerary to be in this json format. 
        //                     The array [rows] contains a "row" object which represents a day to show on the itinerary table. 
        //                     Each row has an array of "activities", where each "activity" represents the activity to do during 
        //                     that day. This activity has an id, a time (with both start and end timing strings), a location (a 
        //                     google Maps API Places object with only geometry and name) and details (page is simply the string 
        //                     "Itinerary" and number is simply a unique number for each activity). Do not wrap the json codes in
        //                     JSON markers and only return the json file, do not include any other irrelavant text. The following
        //                     text will be the prompt of the desired itinerary by the user: ${prompt}`

        try {
            const response = await openAi.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
            console.log(response.choices[0])
            return response.choices[0].message.content
        } catch (error) {
            console.log("Error generating itinerary: ", error)
        }
    }

    app.post('/openAi-generate-itinerary', async (req, res) => {
        const { prompt } = req.body

        try {
            const itinerary = await generateItinerary(prompt)
            res.json({ itinerary })
        } catch (error) {
            res.status(500).json({ error: 'Error generating itinerary ' })
        }
    })
}