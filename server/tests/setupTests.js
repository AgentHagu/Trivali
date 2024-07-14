const dotenv = require('dotenv');

jest.setTimeout(5000)
dotenv.config({ path: './.env.test' });