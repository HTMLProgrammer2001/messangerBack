import st from 'supertest';
import {Schema, Types} from 'mongoose';

import CodeRepository from '../../repositories/Code.repository';
import UserRepository from '../../repositories/User.repository';
import app from '../../app';
import resetDB from '../resetDB';
import {CodeTypes} from '../../constants/CodeTypes';


//mock
jest.mock('../../helpers/codeGenerator', () => ({
	__esModule: true,
	default: jest.fn()
}));

describe('Test change phone confirm', () => {
	const oldPhone = '+380997645334',
		newPhone = '+380506564229',
		oldCode = '12345678',
		newCode = '87654321',
		userData = {
			nickname: 'Test',
			name: 'Name',
			phone: oldPhone
		},
		oldCodeData = {
			code: oldCode,
			to: oldPhone,
			type: CodeTypes.CHANGE_PHONE
		},
		newCodeData = {
			code: newCode,
			to: newPhone,
			type: CodeTypes.CHANGE_PHONE
		};

	beforeEach(async (done) => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Test change phone code confirm without code', async done => {
		//make api call
		st(app)
			.post('/confirm/changePhone')
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{
						param: 'oldCode',
						msg: 'Code is required'
					}, {
						param: 'newCode',
						msg: 'Code is required'
					}]
				})
			})
			.end(done);
	});

	it('Test change phone code confirm with incorrect code', async done => {
		st(app)
			.post('/confirm/changePhone')
			.send({oldCode, newCode})
			.expect(422)
			.expect(res => {
				expect(res.body.errors).toContainEqual({
					param: 'oldCode',
					msg: 'Model with this code are not exists',
					location: 'body',
					value: oldCode
				});

				expect(res.body.errors).toContainEqual({
					param: 'newCode',
					msg: 'Model with this code are not exists',
					location: 'body',
					value: newCode
				});
			})
			.end(done)
	});

	it('Test change phone code expires', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);

		await CodeRepository.createCode({
			...oldCodeData,
			user: user._id,
			expires: new Date(Date.now() - 100)
		});

		await CodeRepository.createCode({
			...newCodeData,
			user: user._id,
			expires: new Date(Date.now() - 100)
		});

		st(app)
			.post('/confirm/changePhone')
			.send({oldCode, newCode})
			.expect(422)
			.expect(res => {
				expect(res.body.errors).toContainEqual({
					location: 'body',
					param: 'oldCode',
					msg: 'This code is expires',
					value: oldCode
				});

				expect(res.body.errors).toContainEqual({
					param: 'newCode',
					msg: 'This code is expires',
					location: 'body',
					value: newCode
				});
			})
			.end(done)
	});

	it('Test change phone confirm success', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);

		await CodeRepository.createCode({
			...oldCodeData,
			user: user._id,
			expires: new Date(Date.now() + 300000)
		});

		await CodeRepository.createCode({
			...newCodeData,
			user: user._id,
			expires: new Date(Date.now() + 300000)
		});

		//make call
		await st(app)
			.post('/confirm/changePhone')
			.send({oldCode, newCode})
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Phone was changed'
				});
			});

		const newUser = await UserRepository.getByPhone(newPhone);
		expect(newUser).toBeTruthy();

		done();
	});

	it('Test change phone confirm with code for different users', async done => {
		//create data for tests
		const user = await UserRepository.create(userData);

		await CodeRepository.createCode({
			...oldCodeData,
			user: user._id,
			expires: new Date(Date.now() + 300000)
		});

		await CodeRepository.createCode({
			...newCodeData,
			user: (new Types.ObjectId('111111111111111111111111') as any) as Schema.Types.ObjectId,
			expires: new Date(Date.now() + 300000)
		});

		//make call
		await st(app)
			.post('/confirm/changePhone')
			.send({oldCode, newCode})
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Incorrect codes'
				});
			});

		done();
	});
});
