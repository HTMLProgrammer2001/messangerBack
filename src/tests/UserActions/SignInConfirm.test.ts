import st from 'supertest';

import CodeRepository from '../../repositories/Code.repository';
import UserRepository from '../../repositories/User.repository';
import app from '../../app';
import resetDB from '../resetDB';
import {CodeTypes} from '../../constants/CodeTypes';


describe('Test sign in confirm', () => {
	const userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334'
		},
		codeData = {
			code: '12345678',
			to: userData.phone,
			type: CodeTypes.SIGNIN
		};

	beforeEach(async (done) => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Test sign in code confirm without code', async done => {
		//make api call
		st(app)
			.post('/confirm/sign')
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

	it('Test sign in code confirm with incorrect code', async done => {
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

	it('Test sign in code expires', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);
		await CodeRepository.createCode({
			...codeData,
			user: user._id,
			expires: new Date(Date.now() - 100)
		});

		st(app)
			.post('/confirm/sign')
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

	it('Test sign in confirm success', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);
		await CodeRepository.createCode({
			...codeData,
			user: user._id,
			expires: new Date(Date.now() + 30000000)
		});

		//make call
		st(app)
			.post('/confirm/sign')
			.send({code: codeData.code})
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Sign confirmed successfully',
					user: {_id: user.id, verified: true}
				})
			})
			.end(done)
	});
});
