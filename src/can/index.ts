import {IRule} from '../interfaces/IRule';


class Gate{
	private rules: Record<string, IRule[]> = {};

	async can(action: string, ...args: any[]): Promise<boolean>{
		if(!this.rules[action])
			return true;

		const results = await Promise.all(this.rules[action].map(rule => rule(...args)));
		return results.every(i => i);
	}

	addRule(action: string, rule: IRule){
		if(this.rules[action])
			this.rules[action].push(rule);
		else
			this.rules[action] = [rule];
	}

	removeRule(action: string, rule: IRule): boolean{
		//check action rules exists
		let rules = this.rules[action];
		if(!rules)
			return false;

		//check rule exists
		let index = rules.indexOf(rule);
		if(index == -1)
			return false;

		//delete it
		rules.splice(index, 1);
		return true;
	}

	clearAction(action: string){
		this.rules[action] = [];
	}
}

export default new Gate();
