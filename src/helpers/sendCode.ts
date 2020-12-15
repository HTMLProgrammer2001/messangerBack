import {Schema} from 'mongoose';

import {CodeTypes} from '../constants/CodeTypes';
import CodeRepository from '../repositories/Code.repository';
import generateCode from './codeGenerator';
import nexmoService from '../services/Nexmo.service';


const sendCode = async (phone: string, type: CodeTypes, user: Schema.Types.ObjectId) => {
	//create code
	let code = await CodeRepository.createCode({
		code: generateCode(),
		expires: new Date(Date.now() + parseInt(process.env.CODE_TTL || '')),
		type, user
	});

	//send message
	return nexmoService.sendSignInMessage(phone, code.code);
};

export default sendCode;
