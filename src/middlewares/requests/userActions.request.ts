import {body} from 'express-validator';

import User from '../../models/User.model';
import Code from '../../models/Code.model';
import uniqueCustomValidator from '../validators/unique.validator';
import existsCustomValidator from '../validators/exists.validator';
import {IAuthRequest} from '../../interfaces/IAuthRequest';
import {Response} from 'express';
import {Document} from 'mongoose';


export const loginValidators = [
	body('phone').isMobilePhone('any').withMessage('Phone must be valid phone number').bail()
		.custom(existsCustomValidator(User, 'phone')).withMessage('User with this phone not exists')
];

export const confirmValidators = [
	body('code').exists().withMessage('Code is required').bail()
		.isNumeric().withMessage('Code must be numeric').bail()
		.isLength({max: 8, min: 8}).withMessage('Code must be 8 digits').bail()
		.custom(existsCustomValidator(Code, 'code')).withMessage('This code not exists')
];

export const resendValidators = [
	body('phone').isMobilePhone('any').withMessage('Phone must be valid phone number')
		.custom(existsCustomValidator(User, 'phone')).withMessage('User with this phone not exists'),
	body('type').isNumeric().withMessage('Type must be numeric')
];

export const signValidators = [
	body('name').isLength({min: 4, max: 32}).withMessage('Name must be from 4 to 32 symbols'),
	body('nickname').isLength({min: 4, max: 32}).withMessage('Nick must be from 4 to 32 symbols')
		.custom(uniqueCustomValidator(User, 'nickname')).withMessage('User with this nickname already exists'),

	body('phone').isMobilePhone('any').withMessage('Phone must be valid phone number')
		.custom(uniqueCustomValidator(User, 'phone')).withMessage('User with this phone already signed in')
];

const ignoreUser = (req: IAuthRequest, res: Response, doc: Document) => {
	return Boolean(req.user && doc.equals(req.user));
};

export const editMeValidators = [
	body('name').isLength({min: 4, max: 32}).withMessage('Name must be from 4 to 32 symbols'),
	body('nickname').isLength({min: 4, max: 32}).withMessage('Nick must be from 4 to 32 symbols')
		.custom(uniqueCustomValidator(User, 'nickname', ignoreUser))
		.withMessage('User with this nickname already exists'),

	body('phone').isMobilePhone('any').withMessage('Phone must be valid phone number')
		.custom(uniqueCustomValidator(User, 'phone', ignoreUser)).withMessage('User with this phone already signed in'),

	body('avatar').optional(),
	body('description').optional().isString().withMessage('Must be a string')
];
