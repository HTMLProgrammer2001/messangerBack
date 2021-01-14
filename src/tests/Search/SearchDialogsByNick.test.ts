import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import {IUserData} from '../../models/User.model';
import {DialogTypes} from '../../constants/DialogTypes';
import {MessageTypes} from '../../constants/MessageTypes';

import UserRepository from '../../repositories/User.repository';
import DialogRepository from '../../repositories/Dialog.repository';
import MessageRepository from '../../repositories/Message.repository';


describe('Test search by nick', () => {
	let userData: IUserData[] = [
		{nickname: 'test', name: 'Test', phone: '+380666876892', sessionCode: '12345678'},
		{nickname: 'user', name: 'Yura', phone: '+380506564229', sessionCode: '87654321'},
		{nickname: 'udemy', name: 'User', phone: '+380980765432', sessionCode: '56754332'}
	];

	beforeAll(async done => {
		//reset DB
		await resetDB();

		//create users
		const userIDs = await Promise.all(userData.map(async d => {
			const user = await UserRepository.create(d);
			return user._id;
		}));

		//create dialogs
		await DialogRepository.create({type: DialogTypes.PERSONAL, participants: [
			{user: userIDs[0]}, {user: userIDs[1]}
		]});

		await DialogRepository.create({type: DialogTypes.PERSONAL, participants: [
			{user: userIDs[1]}, {user: userIDs[2]}
		]});

		const dialog = await DialogRepository.create({type: DialogTypes.PERSONAL, participants: [
			{user: userIDs[0]}, {user: userIDs[2]}
		]});

		//create message
		const message = await MessageRepository.create({
			type: MessageTypes.MESSAGE,
			time: new Date(),
			message: 'Text',
			dialog: dialog._id,
			author: userIDs[0]
		});

		await DialogRepository.update(dialog.id, {lastMessage: message._id});

		done();
	});

	jest.setTimeout(30000);

	it('Test success search', async done => {
		//create token
		const token = await jwt.sign({
			sessionCode: userData[0].sessionCode,
			expires: Date.now() + 3000000
		}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.get('/dialogs/nickname')
			.query({nickname: 'u'})
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Dialogs found',
					total: 2,
					totalPages: 1,
					pageSize: 5
				});

				expect(res.body.data).toHaveLength(2);

				//check correct dialogs and order
				expect(res.body.data[0]).toMatchObject({nick: userData[2].nickname});
				expect(res.body.data[0].lastMessage).toBeTruthy();

				expect(res.body.data[1]).toMatchObject({nick: userData[1].nickname});
			})
			.end(done);
	});

	it('Test search dialogs by nick unauthorized', async done => {
		//make api call
		st(app)
			.get('/dialogs/nickname')
			.query({nickname: 'u'})
			.expect(401)
			.end(done);

		done();
	});

	it('Test not found', async done => {
		const token = await jwt.sign({
			sessionCode: userData[0].sessionCode,
			expires: Date.now() + 300000
		}, <string>process.env.JWT_SECRET);

		//make api call
		st(app)
			.get('/dialogs/nickname')
			.query({nickname: 'notFound'})
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Dialogs not found', pageSize: 5,
					total: 0, totalPages: 0, data: []
				});
			})
			.end(done);
	});
});