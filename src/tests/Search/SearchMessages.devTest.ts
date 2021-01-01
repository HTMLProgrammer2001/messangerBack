import st from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../app';
import resetDB from '../resetDB';
import UserRepository from '../../repositories/User.repository';
import DialogRepository from '../../repositories/Dialog.repository';
import MessageRepository from '../../repositories/Message.repository';

import {IUserData} from '../../models/User.model';
import {IDialogData} from '../../models/Dialog.model';
import {DialogTypes} from '../../constants/DialogTypes';
import {IMessageData} from '../../models/Message.model';
import {MessageTypes} from '../../constants/MessageTypes';


describe('Test search messages', () => {
	let userData: IUserData[] = [
		{nickname: 'test', name: 'Test', phone: '+380666876892', sessionCode: '12345678'},
		{nickname: 'user', name: 'Test2', phone: '+380506564229', sessionCode: '87654321'},
		{nickname: 'userTest', name: 'Yura', phone: '+3806789664', sessionCode: '10234521'}
	],
	dialogData: IDialogData = {type: DialogTypes.PERSONAL, participants: []},
	messagesData: IMessageData[] = [];

	beforeAll(async done => {
		//reset db
		await resetDB();

		//create data
		const userIDs = await Promise.all(userData.map(async d => {
			const user = await UserRepository.create(d);
			return user._id;
		}));

		const dialogIds = await Promise.all(new Array(2).fill('').map(async (d, index) => {
			const dialog = await DialogRepository.create({
				...dialogData,
				participants: [{user: userIDs[index]}, {user: userIDs[index + 1]}]
			});

			return dialog.id;
		}));

		//data for messages
		messagesData = [
			{author: userIDs[0], dialog: dialogIds[0], message: 'Text', type: MessageTypes.MESSAGE},
			{author: userIDs[0], dialog: dialogIds[0], message: 'Test', type: MessageTypes.MESSAGE},
			{
				author: userIDs[1], dialog: dialogIds[0], message: 'Name',
				type: MessageTypes.MESSAGE, time: new Date(Date.now() + 300)
			},
			{author: userIDs[1], dialog: dialogIds[1], message: 'Name', type: MessageTypes.MESSAGE}
		];

		await Promise.all(messagesData.map(async data => {
			await MessageRepository.create(data);
		}));

		done();
	});

	jest.setTimeout(30000);

	it('Test message success search', async done => {
		const token = await jwt.sign({
			sessionCode: userData[0].sessionCode,
			expires: Date.now() + 3000000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.get('/messages/text')
			.query({text: 't'})
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'Messages found',
					page: 1,
					totalPages: 1,
					pageSize: 5,
					total: 2
				});

				expect(res.body.data).toHaveLength(2);

				//check messages
				expect(res.body.data[0]).toMatchObject({
					type: MessageTypes.MESSAGE,
					message: 'Text'
				});

				expect(res.body.data[1]).toMatchObject({
					type: MessageTypes.MESSAGE,
					message: 'Test'
				});
			})
			.end(done);
	});

	it('Test get messages not authorized', async done => {
		st(app)
			.get('/messages/text')
			.query({text: 't'})
			.expect(401)
			.end(done);
	});

	it('Test get messages without query', async done => {
		const token = await jwt.sign({
			sessionCode: userData[0].sessionCode,
			expires: Date.now() + 3000000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.get('/messages/text')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({
					message: 'No text to search',
					page: 1,
					totalPages: 1,
					data: [],
					pageSize: 1
				});
			})
			.end(done);
	});

	it('Test get messages that not found', async done => {
		const token = await jwt.sign({
			sessionCode: userData[0].sessionCode,
			expires: Date.now() + 3000000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.get('/messages/text')
			.query({text: 'Not found'})
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body).toMatchObject({message: 'Messages not found'});
			})
			.end(done)
	});

	it('Test get messages sorted by time', async done => {
		const token = await jwt.sign({
			sessionCode: userData[1].sessionCode,
			expires: Date.now() + 3000000
		}, <string>process.env.JWT_SECRET);

		st(app)
			.get('/messages/text')
			.query({text: 'e'})
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect(res => {
				expect(res.body.data).toHaveLength(4);
				expect(res.body.data[0]).toMatchObject({message: 'Name'});
			})
			.end(done);
	});
});
