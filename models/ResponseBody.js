class ResponseBody {
	constructor(success = false, message = "") {
		this.success = success;
		this.message = message;
	}
	set isSuccess(value) {
		this.success = value;
	}
	set responseMessage(value) {
		this.message = value;
	}
}

module.exports = ResponseBody;
