import {Model} from 'mongoose';


const existsCustomValidator = (model: Model<any>, field: string) => async (val: any) => {
	//search
	const q = await model.findOne({[field]: val});

	if(!q)
		//show error if not exists
		return Promise.reject(`Model with this ${field} are not exists`);
};

export default existsCustomValidator;
