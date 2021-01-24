import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import UserRepository from '../../repositories/User.repository';
import TokenRepository from '../../repositories/Token.repository';


describe('Test logout', () => {
	const token = '12345678',
		userData = {
			name: 'Test',
			nickname: 'Nick',
			phone: '+380666876892'
		};

	beforeEach(async (done) => {
		//change db
		await resetDB();

		const user = await UserRepository.create(userData);
		await TokenRepository.createToken({token, user: user.id});

		done();
	});

	jest.setTimeout(30000);

	it('Test successfully logout', async done => {
		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		st(app)
			.post('/logout')
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(200)
			.expect({message: 'You were successfully logged out'})
			.end(done);
	});

	it('Test logout without token', async done => {
		//make api call
		st(app)
			.post('/logout')
			.expect(401)
			.end(done);
	});

	it('Test logout with incorrect token', async done => {
		//make api call
		st(app)
			.post('/logout')
			.set('Authorization', 'Bearer 123456')
			.expect(500, done);
	});

	it('Test logout with expires token', async done => {
		//change token expires
		const tokenObj = await TokenRepository.findByToken(token);
		await TokenRepository.update(tokenObj._id, {expires: new Date(Date.now() - 100)});

		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		st(app)
			.post('/logout')
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(500)
			.end(done)
	});
});
