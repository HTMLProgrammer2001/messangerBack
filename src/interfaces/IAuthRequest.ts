import {Request} from 'express';

import {IUser} from '../models/User.model';


export interface IAuthRequest extends Request{
	user?: IUser
}
