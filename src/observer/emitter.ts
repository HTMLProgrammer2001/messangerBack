import {EventEmitter} from 'events';

import NewMessageEvent from './events/NewMessage.event';
import NewDialogEvent from './events/NewDialog.event';
import BanEvent from './events/Ban.event';
import UpdateMessageEvent from './events/UpdateMessage.event';
import DeleteMessageEvent from './events/DeleteMessage.event';

import WSNewMessageListener from './listeners/WSNewMessage.listener';
import WSNewDialogListener from './listeners/WSNewDialog.listener';
import WSBanUserListener from './listeners/WSBanUser.listener';
import WSUpdateMessageListener from './listeners/WSUpdateMessage.listener';
import WSDeleteMessageListener from './listeners/WSDeleteMessage.listener';


const emitter = new EventEmitter();

//connect listeners to events
emitter.on(NewMessageEvent.getName(), WSNewMessageListener);
emitter.on(NewDialogEvent.getName(), WSNewDialogListener);
emitter.on(BanEvent.getName(), WSBanUserListener);
emitter.on(UpdateMessageEvent.getName(), WSUpdateMessageListener);
emitter.on(DeleteMessageEvent.getName(), WSDeleteMessageListener);

export default emitter;
