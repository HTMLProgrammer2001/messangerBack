abstract class Resource<T>{
	private jsonData: Object = null;
	protected abstract getData(): Object;
	constructor(protected data: T, protected userID: any){}

	async json(){
		this.jsonData = this.data ? await this.getData() : null;
	}

	toJSON(){
		return this.jsonData;
	}
}

export default Resource;
