import {Schema} from 'mongoose';

import {CodeTypes} from '../constants/CodeTypes';
import CodeRepository from '../repositories/Code.repository';
import generateCode from './codeGenerator';
import nexmoService from '../services/Nexmo.service';


const sendCode = async (phone: string, type: CodeTypes, user: Schema.Types.ObjectId) => {
	//create code
	let code = await CodeRepository.createCode({
		code: generateCode(),
		to: phone,
		expires: new Date(Date.now() + parseInt(process.env.CODE_TTL || '')),
		type, user
	});

	switch (type) {
		case CodeTypes.SIGNIN:
			return nexmoService.sendSignInMessage(phone, code.code);
		case CodeTypes.LOGIN:
			return nexmoService.sendLoginMessage(phone, code.code);
		case CodeTypes.CHANGE_PHONE:
			return nexmoService.sendChangePhoneMessage(phone, code.code);
	}

	//send message
	return Promise.reject('Incorrect type');
};

export default sendCode;
