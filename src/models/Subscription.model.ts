import {Document, model, Schema} from 'mongoose';


export interface ISubscriptionData {
	user: string,
	token: string,
	expires: Date,
	push: any
}

export interface ISubscription extends Document, ISubscriptionData {}

const SubscriptionSchema = new Schema<ISubscription>({
	user: {
		type: String,
		ref: 'User'
	},
	token: String,
	expires: Date,
	push: Object
});

export default model<ISubscription>('Subscription', SubscriptionSchema);
