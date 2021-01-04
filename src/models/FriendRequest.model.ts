import {Schema, Document, model} from 'mongoose';


export interface IFriendRequestData {
	from: Schema.Types.ObjectId,
	to: Schema.Types.ObjectId,
	confirmed?: boolean
}

export interface IFriendRequest extends Document, IFriendRequestData{}

const FriendRequestSchema = new Schema<IFriendRequest>({
	from: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	to: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	confirmed: {
		type: Boolean,
		default: false
	}
});

export default model<IFriendRequest>('FriendRequest', FriendRequestSchema);
