import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import UserRepository from '../../repositories/User.repository';


describe('Test logout', () => {
	const code = '12345678',
		userData = {
			name: 'Test',
			nickname: 'Nick',
			phone: '+380666876892',
			sessionCode: code
		};

	beforeEach(async (done) => {
		await resetDB();
		await UserRepository.create(userData);
		done();
	});

	jest.setTimeout(30000);

	it('Test successfully logout', async done => {
		const token = await jwt.sign({
			sessionCode: code,
			expires: Date.now() + 30000000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.post('/logout')
			.set('Authorization', `Bearer ${token}`)
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
		const token = await jwt.sign({
			sessionCode: code,
			expires: Date.now() - 1000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.post('/logout')
			.set('Authorization', `Bearer ${token}`)
			.expect(500)
			// .expect({error: 'Token expires'})
			.end(done)
	});
});
