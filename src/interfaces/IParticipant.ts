import {IUser} from '../models/User.model';
import {PartRoles} from '../constants/PartRoles';


export type IParticipant = {
	user: IUser,
	role: PartRoles,
	bannedAt: Date,
	leaveAt: Date
}
