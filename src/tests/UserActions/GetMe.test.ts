import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import UserRepository from '../../repositories/User.repository';
import TokenRepository from '../../repositories/Token.repository';


describe('Test get me info', () => {
	const token = '132239045347',
		userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334'
		};

	let user: any = null;

	beforeAll(async (done) => {
		//update db
		await resetDB();
		user = await UserRepository.create(userData);
		await TokenRepository.createToken({user: user.id, token});

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
		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		//test
		return st(app)
			.get('/me')
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(200)
			.expect(res => {
				expect(res.body._id).toBe(user.id);
			});
	});

	it('Test get info with expires token', async () => {
		//change token expires
		const tokenObj = await TokenRepository.findByToken(token);
		await TokenRepository.update(tokenObj._id, {expires: new Date(Date.now() - 100)});

		//generate token
		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		return st(app)
			.get('/me')
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(500);
	});
});
