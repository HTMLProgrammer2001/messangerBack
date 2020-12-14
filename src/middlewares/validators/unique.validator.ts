import {Document, Model} from 'mongoose';
import {Request, Response} from 'express';


type IgnoreFunc = (req: any, res: Response, model: Document) => boolean;

const uniqueCustomValidator = (model: Model<any>, field: string, ignore?: IgnoreFunc) => {
	return async (val: any, {req, res}: any) => {
		//search
		const q = await model.find({[field]: val});

		if (q.length && !q.every(doc => !ignore || ignore(req, res, doc)))
			//show error if exists
			throw new Error(`Model with same ${field} already exists`);
	};
};

export default uniqueCustomValidator;
