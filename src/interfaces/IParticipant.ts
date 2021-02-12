import {Types} from 'mongoose';
import {PartRoles} from '../constants/PartRoles';


export type IParticipant = {
	user: string | Types.ObjectId,
	role?: PartRoles,
	bannedAt?: Date,
	leaveAt?: Date
}
