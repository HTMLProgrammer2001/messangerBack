import {Types} from 'mongoose';
import {PartRoles} from '../constants/PartRoles';
import {BanType} from '../constants/BanType';


export type IParticipant = {
	user: string | Types.ObjectId,
	role?: PartRoles,
	banTime?: Date,
	banType?: BanType
}
