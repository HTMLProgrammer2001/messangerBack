import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import User from '../../models/User.model';


describe('Test get me info', () => {
	const sessionCode = '132239045347',
		userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334',
			sessionCode
		};

	let user: any = null;

	beforeAll(async (done) => {
		await resetDB();
		user = await User.create(userData);

		done();
	});

	jest.setTimeout(30000);
		

	it('Test error without token', done => {
		st(app)
			.get('/me')
			.expect(401, done)
	});

	it('Test error with incorrect token', done => {
		st(app)
			.get('/me')
			.set('Authorization', 'Bearer 123456')
			.expect(500, done)
	});

	it('Test get success info', async () => {
		//generate token
		const token = await jwt.sign({
			sessionCode: user.sessionCode,
			expires: Date.now() + parseInt(process.env.TOKEN_TTL || '0')
		}, <string>process.env.JWT_SECRET);

		//test
		return st(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);
	});

	it('Test get info with expires token', async () => {
		//generate token
		const token = await jwt.sign({
			sessionCode: user.sessionCode,
			expires: Date.now() - 1000
		}, <string>process.env.JWT_SECRET);

		return st(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)
			.expect(500);
	});
});
