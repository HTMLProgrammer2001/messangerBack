import {IListener} from '../../interfaces/IListener';
import NewMessageEvent from '../events/NewMessage.event';


const WSNewMessageListener: IListener = (event: NewMessageEvent) => {
	console.log(event.getMessage());
};

export default WSNewMessageListener;
