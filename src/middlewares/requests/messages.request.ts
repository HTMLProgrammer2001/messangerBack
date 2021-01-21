import {body, param, query} from 'express-validator';

import existsCustomValidator from '../validators/exists.validator';
import Dialog from '../../models/Dialog.model';
import Message from '../../models/Message.model';


export const getMessagesByTextValidators = [
	body('text').optional().isString().withMessage('Text must be string'),
	query('page').optional().isNumeric().withMessage('Page must be numeric'),
	query('pageSize').optional().isNumeric().withMessage('Page size must be numeric')
];

export const getMessagesForChatValidators = [
	param('dialog').isString().withMessage('Invalid dialog id format')
		.custom(existsCustomValidator(Dialog, '_id')).withMessage('No dialog with this id'),

	query('page').optional().isNumeric().withMessage('Page must be numeric'),
	query('pageSize').optional().isNumeric().withMessage('Page size must be numeric')
];

export const createMessageValidators = [
	body('dialog').isString().withMessage('Invalid dialog id format')
		.custom(existsCustomValidator(Dialog, '_id')).withMessage('No dialog with this id'),
	body('message').isString().withMessage('Message is required'),
	body('type').isNumeric().withMessage('Invalid type')
];

export const deleteMessageValidators = [
	query('messages').isArray(),
	query('forOthers').isBoolean()
];

export const editMessageValidators = [
	param('messageID').isString().withMessage('Invalid message id format')
		.custom(existsCustomValidator(Message, '_id')).withMessage('No message with this id'),

	body('message').isString().withMessage('Message is required'),
	body('type').isNumeric().withMessage('Invalid type')
];
