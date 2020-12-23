import {Schema} from 'mongoose';
import Mocked = jest.Mocked;

import sendCode from './sendCode';
import {CodeTypes} from '../constants/CodeTypes';
import CodeRepository from '../repositories/Code.repository';
import NotifyService from '../services/NotifyService';


//mocks
const code = '123456';

jest.mock('./codeGenerator', () => ({
	__esModule: true,
	default: jest.fn(() => code)
}));

jest.mock('../repositories/Code.repository', () => ({
	__esModule: true,
	default: {createCode: jest.fn((opts: any) => opts)}
}));

jest.mock('../services/NotifyService', () => ({
	__esModule: true,
	default: {
		notify: jest.fn(),
		notifyLogin: jest.fn(),
		notifySignIn: jest.fn(),
		notifyChange: jest.fn()
	}
}));

const mockedCodeRepository = CodeRepository as Mocked<typeof CodeRepository>,
	mockedNotify = NotifyService as Mocked<typeof NotifyService>;


describe('Test send code helpers', () => {
	const phone = '+380995654782',
		user = new Schema.Types.ObjectId('5ba2345bf45f');

	it('Test code creation call', async () => {
		const matchMock = {to: phone, type: CodeTypes.SIGNIN, user};

		//tests
		await expect(sendCode(phone, CodeTypes.SIGNIN, user)).resolves.toBeUndefined();
		expect(mockedCodeRepository.createCode).toBeCalledTimes(1);
		expect(mockedCodeRepository.createCode.mock.calls[0][0]).toMatchObject(matchMock);
	});

	it('Test sign in code send', async () => {
		//tests
		await expect(sendCode(phone, CodeTypes.SIGNIN, user)).resolves.toBeUndefined();
		expect(mockedNotify.notifySignIn).toBeCalledWith(phone, code);
	});

	it('Test log in code send', async () => {
		//tests
		await expect(sendCode(phone, CodeTypes.LOGIN, user)).resolves.toBeUndefined();
		expect(mockedNotify.notifyLogin).toBeCalledWith(phone, code);
	});

	it('Test change code send', async () => {
		//tests
		await expect(sendCode(phone, CodeTypes.CHANGE_PHONE, user)).resolves.toBeUndefined();
		expect(mockedNotify.notifyChange).toBeCalledWith(phone, code);
	});
});
