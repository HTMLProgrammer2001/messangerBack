import {IListener} from '../../interfaces/IListener';
import BanEvent from '../events/Ban.event';
import {io} from '../../ws/';


const wsBanUserListener: IListener = async (event: BanEvent) => {
	const banUser = event.getBanUser(),
		user = event.getUser();

	//send to socket
	io.to(banUser.toString()).emit('toggleBan', user.toString());
};

export default wsBanUserListener;
