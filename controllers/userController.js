const userService = require("../services/userService");
const bcrypt = require("bcryptjs");
const emailService = require("../services/emailService");
const ResponseBody = require("../models/ResponseBody");
const { validateInputPassword, generateRandomPassword } = require("../utils/commonUtils");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const USER_ROLE = {
	admin: "58a52be7-1410-4850-87a4-a1c8bdfd1da1",
	op: "7514bb70-d7f7-4a52-a2c8-5095d1de6c7f",
};

const create = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		let { username, firstName, lastName, phone, password, userRoleId, retypePassword } = req.body;

		if (!username || !password || !retypePassword) {
			responseBody.responseMessage =
				"Username/Email Address, Password, and ReType Password can't be blank";
			return res.status(400).json(responseBody);
		}

		// Check if the username already exists
		const existingUser = await userService.findByUserId(username);

		if (existingUser) {
			responseBody.responseMessage = "Username already exists";
			return res.status(400).json(responseBody);
		}

		if (password !== retypePassword) {
			responseBody.responseMessage = "Password mismatch";
			return res.status(400).json(responseBody);
		}

		const isValidPassword = validateInputPassword(password);
		if (!isValidPassword) {
			responseBody.responseMessage =
				"Passwords must have at least 8 characters and contain at least one of the following: uppercase letters, lowercase letters, numbers";
			return res.status(400).json(responseBody);
		}

		userRoleId = USER_ROLE[userRoleId];

		if (!userRoleId) {
			userRoleId = USER_ROLE.admin;
		}

		await userService.create(username, firstName, lastName, phone, password, userRoleId);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "Your accout has been successfully created";
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

		if (!username || !password) {
			return res.status(400).json(responseBody);
		}

		const user = await userService.findByUserId(username);

		if (!user) {
			return res.status(400).json(responseBody);
		}

		if (user.isLocked) {
			responseBody.responseMessage = "Account is locked!";
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
				return res.status(403).json(responseBody);
			}
			return res.status(400).json(responseBody);
		}

		await user.update({ failedAttempts: 0 });

		// Generate a JWT token with a 1-minute expiration
		const token = generateToken(user);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "Successfully Logged In";
		responseBody.response = {
			userId: user.userId,
			userName: `${user.firstName} ${user.lastName}`,
			token: token,
		};

		return res.status(200).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		res.status(500).json(responseBody);
	}
};

const updateUserInfo = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		const userId = req.params.userId; // email address as userId

		if (!userId) {
			responseBody.message = "Email address is required";
			return res.status(400).json(responseBody);
		}

		const user = await userService.findByUserId(userId);

		if (!user) {
			responseBody.responseMessage = "No data found for the provided User: " + userId;
			return res.status(400).json(responseBody);
		}

		const { firstName, lastName, phone } = req.body;

		const [updatedRows] = await userService.update(userId, firstName, lastName, phone);

		if (updatedRows === 0) {
			responseBody.responseMessage =
				"No updates were made. User may not exist or data is the same.";
			return res.status(200).json(responseBody);
		}

		responseBody.responseMessage = "Successfully update user data";
		responseBody.code = 200;
		responseBody.isSuccess = true;
		return res.status(200).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		res.status(500).json(responseBody);
	}
};

const resetPassword = async (req, res) => {
	const responseBody = new ResponseBody();

	try {
		const userId = req.params.userId;

		if (!userId) {
			responseBody.responseMessage = "User Id/Email address is required";
			return res.status(400).json(responseBody);
		}

		const existingUser = await userService.findByUserId(userId);

		if (!existingUser) {
			responseBody.responseMessage = "User Not Found";
			return res.status(400).json(responseBody);
		}

		const newRandomPassword = generateRandomPassword();

		const [updatedUser] = await userService.updatePassword(existingUser.id, newRandomPassword);
		if (updatedUser === 0) {
			responseBody.responseMessage =
				"No updates were made. User may not exist or data is the same.";
			return res.status(200).json(responseBody);
		}

		result = await emailService.sendEmail(existingUser.userId, "resetPassword", newRandomPassword);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "New Password has been sent to your email.";
		res.status(201).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = "Internal Server Error";
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
			return res.status(400).json(responseBody);
		}

		if (newPassword !== confirmNewPassword) {
			responseBody.responseMessage = "Password mismatch";
			return res.status(400).json(responseBody);
		}

		const isValidPassword = validateInputPassword(newPassword);
		if (!isValidPassword) {
			responseBody.responseMessage =
				"New Passwords must have at least 8 characters and contain at least one of the following: uppercase letters, lowercase letters, numbers";
			return res.status(400).json(responseBody);
		}

		const existingUser = await userService.findByUserId(username);

		if (!existingUser) {
			responseBody.responseMessage = "User Not Found";
			return res.status(400).json(responseBody);
		}

		if (existingUser.isLocked) {
			responseBody.responseMessage = "Account is locked!";
			return res.status(403).json(responseBody);
		}

		const passwordMatch = await bcrypt.compare(oldPassword, existingUser.encodedPassword);

		if (!passwordMatch) {
			userService.failedAttempt(existingUser);

			if (existingUser.failedAttempts + 1 >= 3) {
				const isLocked = true;
				await existingUser.update({ isLocked });
				responseBody.responseMessage = "Account is locked!";
				return res.status(403).json(responseBody);
			}
			responseBody.responseMessage = "Invalid password";
			return res.status(401).json(responseBody);
		}

		await userService.updatePassword(existingUser.id, newPassword);

		responseBody.isSuccess = true;
		responseBody.responseMessage = "Successfully Update Password";
		res.status(201).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = "Internal Server Error";
		res.status(500).json(responseBody);
	}
};

const fetchAll = async (req, res) => {
	const responseBody = new ResponseBody();
	try {
		responseBody.isSuccess = false;
		responseBody.responseMessage = "No Users data found";

		const userId = req.params.userId;

		const users = await userService.findAll(userId);

		if (users && users.length) {
			responseBody.isSuccess = true;
			responseBody.responseMessage = "Data fetch successfully";
			responseBody.data = users;
			return res.status(200).json(responseBody);
		}

		return res.status(400).json(responseBody);
	} catch (error) {
		console.error(error);
		responseBody.responseMessage = error;
		res.status(500).json(responseBody);
	}
};

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

module.exports = { updateUserInfo, fetchAll, create, resetPassword, login, updatePassword };
