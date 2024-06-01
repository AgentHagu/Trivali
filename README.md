# Trivali
Visit the website [here](http://13.212.6.226:3000/welcome)

# Project Overview
**Orbital Project 2024** - Trivali 

**Level of Achievement** - Apollo

## Project Scope:
**Short Version** - Our project aims to develop a collaborative travel planner web application, Trivali. Trivali will offer itinerary planning tools and itinerary recommendations based on user preferences, map navigation support with real-time recommendations to locations, real-time collaboration support as well as budgeting tools to track and manage travel expenses.

**Long Version** - The project scope encompasses the development of a web application that serves as a collaborative travel planner, similar to Google Docs but tailored towards itinerary creation. 

Core features include tools for itinerary creation and planning, allowing users to plan their trips comprehensively within one app. Additionally, the app will offer collaborative itinerary editing, sharing recommendations with other users, and tools for budgeting travel expenses and tracking travel documents. Extension features include
itinerary recommendations based on user interests, map navigation support for online and offline use and real-time recommendations for nearby attractions and activities, as well as weather updates for locations of interest.

## Milestone 1 (Ideation)
**Problem Motivation** - Many travelers struggle to plan their trips effectively, especially when planning as a group. Often, they have problems coordinating their schedules or interests and have to juggle multiple tools and platforms for itinerary creation, recommendations and expense tracking, making the process even more complicated.


### User Stories
1. **Itinerary Creation and Planning**
    - As a user, I want to create a detailed itinerary for my trip so that I can organize my travel plans day by day.
2. **Budgeting and Tracking Travel Expenses**
    - As a user, I want to track my travel expenses within the app so taht I can stay within my budget.
    - As a user, I want to see a summary of how much I owe each person in the trip.
3. **Collaboration Support**
    - As a user, I want to share my travel itineraries with friends and family so that they can see my plans and suggest modifications.
    - As a user, I want to collaborate on a shared itinerary with my travel group so that we can plan our trip together.
4. **Itinerary Recommendations (Extension)**
    - As a user, I want to receive personalized recommendations for my trip based off my interests.
    - As a user, I want the app to suggest attractions and activities basaed on my interests so I can discover new places to visit.
5. **Map Navigation (Extension)**
    - As a user, I want to access an online map within the app so that I can easily find my way around my travel destination.
    - As a user, I want to download offline maps so that I can navigate without an internet connection.
    - As a user, I want the map to highlight nearby points of interest like restaurants and landmarks so that I can easily find things to do.
6. **Weather Report (Extension)**
    - As a user, I want to check on weather updates in areas that I'll be vistiting

### Design
- **Architecture** - Our application will have a client-server architecture with a separate front-end and back-end. The front-end will be a single-page application (SPA) built using React, and the back-end will be an API server built using Node.js and Express.
<!-- The front-end and back-end will communicate via RESTful APIs. -->

- **Tech Stack**
    - Front-end: React, Bootstrap
    - Back-end: Node.js, Express.js
    - Database: MongoDB for storing user data and travel itineraries
    - Authentication: Passport.js
    - Hosting: AWS for hosting the front and back-end server and MongoDB Atlas for the database

<!-- - **User Interface (UI) Design**
We will use a clean and modern design with a focus on usability. Wireframes and mockups will be created using tools like Figma or Sketch to plan the layout and visual elements of the application. -->

<!-- - **User Experience (UX) Design**
Our UX design will focus on ease of use, with user testing conducted to gather feedback and iterate on the design. Key considerations will include intuitive navigation, clear labeling, and providing helpful prompts and tooltips. -->

- **Data Flow** - The front-end will handle user interactions and send requests to the back-end API. The back-end will process these requests, interact with the database as needed, and return the appropriate responses to the front-end. We will use React for state management in the front-end to ensure a smooth and predictable data flow.

- **Security and Performance** - We will implement security best practices such as input validation, secure authentication, and data encryption. Performance optimization will include efficient database queries, caching strategies, and minimizing the load time of the front-end application.

<!-- **Proposed Core Features**
1. **Itinerary Creation and Planning** - Users can create and organize their trip itineraries, including accomodation and transportation details.
2. **Manage Travel Finances** - Users can input expenses and the web app will automatically calculate who owes whom how much money at the end of the trip, relieving them of the trouble of managing expenses.
3. **Collaboration Support** - Users will be able to collaborate and plan trips together in real-time. -->
# Documentation
Our documentation can be found on our [GitHub Pages](https://agenthagu.github.io/Trivali/).

# Acknowledgements
- **Bootstrap Album Template** - This project uses the [Bootstrap Album Template](https://getbootstrap.com/docs/4.0/examples/album/).
