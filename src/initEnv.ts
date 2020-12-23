const dotenv = require('dotenv');
const path = require('path');


const p = process.env.APP_ENV ? `.env.${process.env.APP_ENV}` : '.env';

dotenv.config({
	path: path.resolve(process.cwd(), p)
});
