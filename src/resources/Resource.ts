abstract class Resource<T>{
	private jsonData: Object = null;
	protected abstract getData(): Object;
	constructor(protected data: T){}

	async json(){
		this.jsonData = await this.getData();
	}

	toJSON(){
		return this.jsonData;
	}
}

export default Resource;
