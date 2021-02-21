import sqs from './SQSMesQueue.service';
import log from './LogQueue.service';
import {IMQ} from './IMQ';


let mq: IMQ = null;

switch (process.env.MQ_TYPE) {
	case 'sqs':
		mq = sqs;
		break;
	default:
		mq = log;
}

export default mq;
