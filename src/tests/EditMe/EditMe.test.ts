import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import UserRepository from '../../repositories/User.repository';
import TokenRepository from '../../repositories/Token.repository';
import resetDB from '../resetDB';


describe('Test edit me', () => {
	const token = '12345678';

	const userData = {
			nickname: 'Test',
			name: 'Name',
			phone: '+380997645334'
		},
		newUserData = {
			nickname: 'newNick',
			name: 'newName'
		};

	let user: any;

	beforeEach(async done => {
		await resetDB();
		user = await UserRepository.create(userData);
		await TokenRepository.createToken({token, user: user.id});

		jest.clearAllMocks();
		done();
	});

	jest.setTimeout(30000);

	it('Should return 403 error on unauthorized call', async done => {
		//make api call
		st(app)
			.post('/me')
			.expect(401, done);
	});

	it('Test success edit', async done => {
		//create data
		const jwtToken = await jwt.sign({token}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.post('/me')
			.send(newUserData)
			.set('Authorization', `Bearer ${jwtToken}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'User was edited',
					newUser: {_id: user.id, ...newUserData}
				});
			})
			.end(done);
	});
});
