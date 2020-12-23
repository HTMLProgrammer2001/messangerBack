import Nexmo from './NexmoNotify.service';
import Log from './LogNotify.service';
import {INotify} from './INotify';


let notifyService: INotify;

switch (process.env.NOTIFY_TYPE) {
	case 'nexmo':
		notifyService = Nexmo;
		break;

	default:
		notifyService = Log;
}

export default notifyService;
