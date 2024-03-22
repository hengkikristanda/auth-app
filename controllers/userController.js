const userService = require("../services/userService");
const ResponseBody = require("../models/ResponseBody");
const { validateInputPassword, generateRandomPassword } = require("../utils/commonUtils");

const getUser = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		responseBody.responseMessage = "User Id is required";
		responseBody.statusCode = 400;

		const userId = req.params.userId;

		if (!userId) {
			return res.status(400).json(responseBody);
		}

		const user = await userService.findByUserId(userId);

		if (!user) {
			responseBody.responseMessage = "User Not Found";
			return res.status(400).json(responseBody);
		}

		responseBody.isSuccess = true;
		responseBody.responseMessage = "User Found";
		responseBody.code = 200;
		responseBody.response = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.userId,
			phone: user.phone,
		};
		return res.status(200).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		responseBody.statusCode = 500;
		res.status(500).json(responseBody);
	}
};

const updateUserInfo = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		const id = req.params.userId;

		const { firstName, lastName, email, phone } = req.body;

		if (!email) {
			responseBody.message = "Email address is required";
			return res.status(400).json(responseBody);
		}

		const user = await userService.findByPk(id);

		if (!user) {
			responseBody.responseMessage = "User Not Found";
			return res.status(400).json(responseBody);
		}

		/* const existingUser = await userService.findByUserId(email);
		if (existingUser && existingUser.id !== id) {
			responseBody.responseMessage = "Email address already exist/used by another user.";
			return res.status(400).json(responseBody);
		} */

		user.firstName = firstName;
		user.lastName = lastName;
		user.phone = phone;
		user.userId = email;

		await userService.update(user);

		responseBody.responseMessage = "Successfully update user data";
		responseBody.code = 200;
		responseBody.isSuccess = true;
		return res.status(200).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		responseBody.statusCode = 500;
		res.status(500).json(responseBody);
	}
};

const fetchAll = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		responseBody.isSuccess = false;
		responseBody.responseMessage = "No Users data fouond";
		responseBody.statusCode = 404;

		// const userId = req.params.userId;

		// if (!userId) {
		// 	return res.status(400).json(responseBody);
		// }

		const users = await userService.findAll();

		if (users) {
			responseBody.isSuccess = true;
			responseBody.responseMessage = "Data fetch successfully";
			responseBody.data = users;
			return res.status(200).json(responseBody);
		}

		return res.status(400).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		responseBody.statusCode = 500;
		res.status(500).json(responseBody);
	}
};

module.exports = { getUser, updateUserInfo, fetchAll };
