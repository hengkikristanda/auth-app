class ResponseBody {
	constructor(success = false, message = "", code = 200) {
		this.success = success;
		this.message = message;
		this.code = code;
	}
	set isSuccess(value) {
		this.success = value;
	}
	set responseMessage(value) {
		this.message = value;
	}
	set statusCode(value) {
		this.code = value;
	}
}

module.exports = ResponseBody;
