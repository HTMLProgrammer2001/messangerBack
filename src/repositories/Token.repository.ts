import {Schema} from 'mongoose';

import Token, {ITokenData} from '../models/Token.model';


class TokenRepository{
	async createToken(data: ITokenData){
		//create code
		let token = new Token(data);
		return token.save();
	}

	async removeByToken(token: string){
		return Token.remove({token});
	}

	async findByToken(token: string){
		return Token.findOne({token});
	}

	async update(id: Schema.Types.ObjectId, data: Partial<ITokenData>){
		await Token.updateOne({_id: id}, data);
		return Token.findById(id);
	}
}

export default new TokenRepository();
