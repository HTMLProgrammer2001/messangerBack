import {EventEmitter} from 'events';

import NewMessageEvent from './events/NewMessage.event';
import WSNewMessageListener from './listeners/WSNewMessage.listener';


const emitter = new EventEmitter();

//connect listeners to events
emitter.on(NewMessageEvent.getName(), WSNewMessageListener);

export default emitter;
