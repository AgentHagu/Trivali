# Trivali Setup
1. Download Node.js and npm https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
2. In both server/ and client/ directory, run "npm i" to install all the necessary packages
3. Setup the .env for both server and client (instructions below)
3. To start the server, run "npm start" or "npm run devStart"
4. To start the client, run "npm start"

Note: You will need to start both server and client side concurrently.

## Server .env
The server .env has the following environment variables:

CLIENT_URL=http://localhost:3000
MONGO_URI=...
SESSION_SECRET=...
JWT_SECRET=...

GOOGLE_MAPS_API_KEY=...
OPENWEATHER_API_KEY=...
CURRENCYCONVERTER_API_KEY=...
OPENAI_API_KEY=...
--------------------------------------------------------------
CLIENT_URL simply refers to the URL the client-side is running on. You can change it to whatever URL it is on or leave it on localhost for development.

MONGO_URI refers to the connection string for a MongoDB instance. You can get a URI for this project by creating a MongoDB database, navigating to "Connect" and select "Drivers" as connection method. Choose Node.js as the Driver and copy the connection string given.

SESSION_SECRET and JWT_SECRET are just secret tokens for authentication, simply choose any string for your secret token.

GOOGLE_MAPS_API_KEY is a Google Maps API key that can be created by following the instructions here: https://developers.google.com/maps/documentation/javascript/get-api-key

OPENWEATHER_API_KEY is an OpenWeather API key. You can sign up for OpenWeather and get an API key for it. You can also refer to this for more instructions: https://openweathermap.org/appid

CURRENCYCONVERTER_API_KEY is an API key from CurrencyAPI. You can get a free API key from here: https://currencyapi.com/

OPENAI_API_KEY is an API key from OpenAI to generate responses. You can get an API key from signing up on OpenAI and generating it for a project. However, for it to actually work, you'll need to deposit money for OpenAI to take from for every API call.

## Client .env
The client .env has the following environment variable:
REACT_APP_API_URL=http://localhost:3001
--------------------------------------------------------------
REACT_APP_API_URL refers to the URL the server-side is running on. You can change it to whatever URL it is on or leave it on localhost for development.