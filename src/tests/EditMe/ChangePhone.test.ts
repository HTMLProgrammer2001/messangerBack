import st from 'supertest';

import resetDB from '../resetDB';
import app from '../../app';
import UserRepository from '../../repositories/User.repository';


describe('Test phone change', () => {
	const userData = {
		nickname: 'Test',
		name: 'Name',
		phone: '+380997645334'
	};

	beforeEach(async (done) => {
		await resetDB();
		await UserRepository.create(userData);

		done();
	});

	jest.setTimeout(30000);

	it('Test success change', async done => {
		st(app)
			.post('/changePhone')
			.send({oldPhone: userData.phone, newPhone: '+380999876892'})
			.expect(200)
			.expect({message: 'Codes was sent on your old and new phone'}, done);
	});

	it('Test change with empty data', async done => {
		st(app)
			.post('/changePhone')
			.expect(422)
			.expect(res => {
				expect(res.body.errors).toContainEqual({
					param: 'oldPhone',
					location: 'body',
					msg: 'Phone must be valid phone number'
				});

				expect(res.body.errors).toContainEqual({
					param: 'newPhone',
					location: 'body',
					msg: 'Phone must be valid phone number'
				});
			})
			.end(done);
	});

	it('Test change for un exists phone', async done => {
		st(app)
			.post('/changePhone')
			.send({oldPhone: '+380675434221', newPhone: '+380999876892'})
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{
						param: 'oldPhone',
						msg: 'Model with this phone are not exists'
					}]
				});
			})
			.end(done);
	});
});
