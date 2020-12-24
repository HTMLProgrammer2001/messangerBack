import st from 'supertest';

import CodeRepository from '../../repositories/Code.repository';
import UserRepository from '../../repositories/User.repository';
import app from '../../app';
import resetDB from '../resetDB';
import {CodeTypes} from '../../constants/CodeTypes';
import jwt from 'jsonwebtoken';


const code = '12345678';

//mock
jest.mock('../../helpers/codeGenerator', () => ({
	__esModule: true,
	default: jest.fn(() => code)
}));

describe('Test login confirm', () => {
	const userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334'
		},
		codeData = {
			code: '12345678',
			to: userData.phone,
			type: CodeTypes.LOGIN
		};

	beforeEach(async (done) => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Test login code confirm without code', async done => {
		//make api call
		st(app)
			.post('/confirm/login')
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{
						param: 'code',
						msg: 'Code is required'
					}]
				})
			})
			.end(done);
	});

	it('Test login code confirm with incorrect code', async done => {
		st(app)
			.post('/confirm/sign')
			.send(codeData)
			.expect(422)
			.expect(res => {
				expect(res.body.errors).toContainEqual({
					param: 'code',
					msg: 'Model with this code are not exists',
					location: 'body',
					value: codeData.code
				})
			})
			.end(done)
	});

	it('Test login code expires', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);

		await CodeRepository.createCode({
			...codeData,
			user: user._id,
			expires: new Date(Date.now() - 100)
		});

		st(app)
			.post('/confirm/login')
			.send({code: codeData.code})
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{
						param: 'code',
						msg: 'This code is expires'
					}]
				})
			})
			.end(done)
	});

	it('Test login confirm success', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);

		await CodeRepository.createCode({
			...codeData,
			user: user._id,
			expires: new Date(Date.now() + 300000)
		});

		//make call
		await st(app)
			.post('/confirm/login')
			.send({code: codeData.code})
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Login successfully'
				});

				expect(res.body.user._id).toBe(user.id);
			});

		const newUser = await UserRepository.getByPhone(userData.phone);
		expect(newUser?.sessionCode).toBe(code);

		done();
	});
});
