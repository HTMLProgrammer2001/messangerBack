import emitter from './emitter';
import {IEvent} from '../interfaces/IEvent';


export const dispatch = (event: IEvent) => {
	emitter.emit((event.constructor as any).getName(), event);
	console.log((event.constructor as any).getName());
};
