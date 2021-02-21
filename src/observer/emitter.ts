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
import SQSNewMessageListener from './listeners/SQSNewMessage.listener';


const emitter = new EventEmitter();

//connect listeners to events
emitter.addListener(NewMessageEvent.getName(), WSNewMessageListener);
emitter.addListener(NewMessageEvent.getName(), SQSNewMessageListener);
emitter.addListener(NewDialogEvent.getName(), WSNewDialogListener);
emitter.addListener(BanEvent.getName(), WSBanUserListener);
emitter.addListener(UpdateMessageEvent.getName(), WSUpdateMessageListener);
emitter.addListener(DeleteMessageEvent.getName(), WSDeleteMessageListener);

export default emitter;
