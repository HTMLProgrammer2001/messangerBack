import st from 'supertest';
import Mocked = jest.Mocked;

import {CodeTypes} from '../../constants/CodeTypes';
import UserRepository from '../../repositories/User.repository';
import resetDB from '../resetDB';
import sendCode from '../../helpers/sendCode';
import app from '../../app';


//mock modules
jest.mock('../../helpers/sendCode', () => ({
	__esModule: true,
	default: jest.fn()
}));

const mockedSend = sendCode as Mocked<typeof sendCode>;

describe('Test login', () => {
	const userData = {
		nickname: 'Test',
		name: 'Name',
		phone: '+380997645334'
	};

	beforeEach(async (done) => {
		await resetDB();
		jest.clearAllMocks();

		done();
	});

	jest.setTimeout(30000);

	it('Test success login', async done => {
		const user = await UserRepository.create({...userData, verified: true});

		//test route call
		await st(app)
			.post('/login')
			.send({phone: userData.phone})
			.expect(200)
			.expect({message: 'Verify code that was sent in your phone'});

		//test send call
		expect(mockedSend).toHaveBeenCalledTimes(1);
		expect(mockedSend).toHaveBeenCalledWith(userData.phone, CodeTypes.LOGIN, user?._id);

		done();
	});

	it('Test login with empty data', () => {
		//make api call
		return st(app)
			.post('/login')
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{param: 'phone'}]
				});
			})
	});

	it('Test login with unexist phone', () => {
		//make api call
		return st(app)
			.post('/login')
			.send({phone: '+380970456332'})
			.expect(422)
			.expect(res => {
				expect(res.body).toMatchObject({
					errors: [{
						param: 'phone',
						msg: 'Model with this phone are not exists'
					}]
				});
			})
	});

	it('Test login for exists but unverified user', async done  => {
		await UserRepository.create(userData);

		//test sign route
		st(app)
			.post('/login')
			.send({phone: userData.phone})
			.expect(422)
			.expect({
				message: 'User with this phone not exists or unverified'
			})
			.end(done);
	});
});
