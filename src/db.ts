import mongoose from 'mongoose';


export const connect = async (url: string | undefined) => {
	console.log(url);

	if(!url)
		throw Error('Cannot connect');

	await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
};
