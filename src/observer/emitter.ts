import {EventEmitter} from 'events';

import NewMessageEvent from './events/NewMessage.event';
import NewDialogEvent from './events/NewDialog.event';

import WSNewMessageListener from './listeners/WSNewMessage.listener';
import WSNewDialogListener from './listeners/WSNewDialog.listener';


const emitter = new EventEmitter();

//connect listeners to events
emitter.on(NewMessageEvent.getName(), WSNewMessageListener);
emitter.on(NewDialogEvent.getName(), WSNewDialogListener);

export default emitter;
