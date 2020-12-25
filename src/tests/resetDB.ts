import Code from '../models/Code.model';
import Dialog from '../models/Dialog.model';
import Message from '../models/Message.model';
import User from '../models/User.model';


const resetDB = async () => {
	await Code.deleteMany({});
	await Dialog.deleteMany({});
	await Message.deleteMany({});
	await User.deleteMany({});
};

export default resetDB;
