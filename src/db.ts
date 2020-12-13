import mongoose from 'mongoose';


export const connect = async (url: string | undefined) => {
	if(!url)
		throw Error('Cannot connect');

	await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
};
