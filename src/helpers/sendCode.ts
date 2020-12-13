import {Schema} from 'mongoose';

import {CodeTypes} from '../constants/CodeTypes';
import Code from '../models/Code.model';
import generateCode from './codeGenerator';
import nexmoService from '../services/Nexmo.service';


const sendCode = async (phone: string, type: CodeTypes, user: Schema.Types.ObjectId) => {
	//create code
	let code = new Code({
		code: generateCode(),
		expires: Date.now() + parseInt(process.env.CODE_TTL || ''),
		type,
		user
	});

	await code.save();

	//send message
	return nexmoService.sendSignInMessage(phone, code.code);
};

export default sendCode;
