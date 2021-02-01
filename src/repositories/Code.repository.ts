import {Schema} from 'mongoose';

import Code, {ICodeData} from '../models/Code.model';
import {CodeTypes} from '../constants/CodeTypes';


class CodeRepository{
	async createCode(data: ICodeData){
		//create code
		let code = new Code(data);
		return code.save();
	}

	async removeCode(id: Schema){
		return Code.remove({_id: id});
	}

	async findByCodeAndType(code: string, type: CodeTypes){
		return Code.findOne({code, type});
	}

	async findByPhoneAndType(phone: string, type: CodeTypes){
		return Code.find({type, to: phone}).sort({expires: -1}).limit(1);
	}
}

export default new CodeRepository();
