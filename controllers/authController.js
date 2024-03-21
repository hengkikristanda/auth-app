const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userService = require("../services/userService");
const emailService = require("../services/emailService");
const { validateInputPassword, generateRandomPassword } = require("../utils/commonUtils");
const dotenv = require("dotenv");

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

const generateToken = (user) => {
	dotenv.config({ path: ".env.properties" });
	return jwt.sign(
		{
			id: user.id,
			userName: user.userId,
			role: user.userRoleId,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: "1h",
		}
	);
};

const register = async (req, res) => {
	try {
		const { username, password, retypePassword } = req.body;

		const responseBody = new ResponseBody();

		if (!username || !password || !retypePassword) {
			responseBody.responseMessage = "Username, Password, and ReType Password can't be blank";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		if (password !== retypePassword) {
			responseBody.responseMessage = "Password mismatch";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		const isValidPassword = validateInputPassword(password);
		if (!isValidPassword) {
			responseBody.responseMessage =
				"Passwords must have at least 8 characters and contain at least one of the following: uppercase letters, lowercase letters, numbers";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		// Check if the username already exists
		const existingUser = await userService.findByUserId(username);

		if (existingUser) {
			responseBody.responseMessage = "Username already exists";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		await userService.register(username, password);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "Your accout has been successfully created";
		responseBody.statusCode = 201;
		res.status(201).json(responseBody);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const login = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		const { username, password } = req.body;

		responseBody.responseMessage = "Invalid username or password";
		responseBody.statusCode = 400;

		if (!username || !password) {
			return res.status(400).json(responseBody);
		}

		const user = await userService.findByUserId(username);

		if (!user) {
			return res.status(400).json(responseBody);
		}

		if (user.isLocked) {
			responseBody.responseMessage = "Account is locked!";
			responseBody.statusCode = 403;
			return res.status(403).json(responseBody);
		}

		// Compare the provided password with the hashed password in the database
		const passwordMatch = await bcrypt.compare(password, user.encodedPassword);

		if (!passwordMatch) {
			userService.failedAttempt(user);

			if (user.failedAttempts + 1 >= 3) {
				const isLocked = true;
				await user.update({ isLocked });
				responseBody.responseMessage = "Account is locked!";
				responseBody.statusCode = 403;
				return res.status(403).json(responseBody);
			}
			return res.status(400).json(responseBody);
		}

		await user.update({ failedAttempts: 0 });

		// Generate a JWT token with a 1-minute expiration
		const token = generateToken(user);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "Successfully Logged In";
		responseBody.statusCode = 200;
		responseBody.response = {
			userId: user.userId,
			firstName: user.firstName,
			token: token,
		};

		return res.status(200).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		responseBody.statusCode = 500;
		res.status(500).json(responseBody);
	}
};

const updatePassword = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		const { username, oldPassword, newPassword, confirmNewPassword } = req.body;

		if (!username || !oldPassword || !newPassword || !confirmNewPassword) {
			responseBody.responseMessage =
				"Old Password, New Password, and Confirm New Password is required";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		if (newPassword !== confirmNewPassword) {
			responseBody.responseMessage = "Password mismatch";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		const isValidPassword = validateInputPassword(newPassword);
		if (!isValidPassword) {
			responseBody.responseMessage =
				"New Passwords must have at least 8 characters and contain at least one of the following: uppercase letters, lowercase letters, numbers";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		const existingUser = await userService.findByUserId(username);

		if (!existingUser) {
			responseBody.responseMessage = "User Not Found";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		if (existingUser.isLocked) {
			responseBody.responseMessage = "Account is locked!";
			responseBody.statusCode = 403;
			return res.status(403).json(responseBody);
		}

		const passwordMatch = await bcrypt.compare(oldPassword, existingUser.encodedPassword);

		if (!passwordMatch) {
			userService.failedAttempt(existingUser);

			if (existingUser.failedAttempts + 1 >= 3) {
				const isLocked = true;
				await existingUser.update({ isLocked });
				responseBody.responseMessage = "Account is locked!";
				responseBody.statusCode = 403;
				return res.status(403).json(responseBody);
			}
			responseBody.responseMessage = "Invalid password";
			responseBody.statusCode = 401;
			return res.status(401).json(responseBody);
		}

		await userService.updatePassword(existingUser.id, newPassword);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "Successfully Update Password";
		responseBody.statusCode = 201;
		res.status(201).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = "Internal Server Error";
		responseBody.statusCode = 201;
		res.status(500).json(responseBody);
	}
};

const resetPassword = async (req, res) => {
	const responseBody = new ResponseBody();

	try {
		const { username } = req.body;

		if (!username) {
			responseBody.responseMessage = "Email address is required";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		const existingUser = await userService.findByUserId(username);

		if (!existingUser) {
			responseBody.responseMessage = "User Not Found";
			responseBody.statusCode = 400;
			return res.status(400).json(responseBody);
		}

		const newRandomPassword = generateRandomPassword();

		const updatedUser = await userService.updatePassword(existingUser.id, newRandomPassword);
		if (updatedUser[0] > 0) {
			result = await emailService.sendResetPasswordEmail(existingUser.userId, newRandomPassword);
		}

		responseBody.isSuccess = true;
		responseBody.responseMessage = "New Password has been sent to your email.";
		responseBody.statusCode = 201;
		res.status(201).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = "Internal Server Error";
		responseBody.statusCode = 500;
		res.status(500).json(responseBody);
	}
};

const testConnection = async (req, res) => {
	try {
		const ipAddress = req.ip;

		res.status(200).json({
			message: "Success",
			source: ipAddress,
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	register,
	login,
	updatePassword,
	resetPassword,
	testConnection,
};
