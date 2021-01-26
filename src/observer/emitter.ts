import {EventEmitter} from 'events';

import NewMessageEvent from './events/NewMessage.event';
import NewDialogEvent from './events/NewDialog.event';
import BanEvent from './events/Ban.event';

import WSNewMessageListener from './listeners/WSNewMessage.listener';
import WSNewDialogListener from './listeners/WSNewDialog.listener';
import WSBanUserListener from './listeners/WSBanUser.listener';


const emitter = new EventEmitter();

//connect listeners to events
emitter.on(NewMessageEvent.getName(), WSNewMessageListener);
emitter.on(NewDialogEvent.getName(), WSNewDialogListener);
emitter.on(BanEvent.getName(), WSBanUserListener);

export default emitter;
