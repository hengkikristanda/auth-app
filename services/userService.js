const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateTimestampBasedUUID } = require("../utils/commonUtils");

const findByUserId = (userId) => {
	try {
		return User.findOne({ where: { userId } });
	} catch (error) {
		console.log(error);
	}
};

const findByPk = (id) => {
	try {
		return User.findOne({ where: { id } });
	} catch (error) {
		console.log(error);
	}
};

const register = async (username, password) => {
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const id = generateTimestampBasedUUID();
		return User.create({ id, userId: username, encodedPassword: hashedPassword });
	} catch (error) {
		console.log(error);
		throw new Error("Error Creating New User");
	}
};

const updatePassword = async (userId, newPassword) => {
	try {
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		return User.update(
			{ failedAttempts: 0, encodedPassword: hashedPassword },
			{ where: { id: userId } }
		);
	} catch (error) {
		console.log(error);
		throw new Error("Error Updating Password");
	}
};

const update = async (user) => {
	console.log(user.id);
	console.log(user.firstName);
	console.log(user.lastName);
	console.log(user.phone);

	try {
		return User.update(
			{
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone,
			},
			{ where: { id: user.id } }
		);
	} catch (error) {
		console.log(error);
		throw new Error("Error Updating Password");
	}
};

const failedAttempt = (user) => {
	try {
		user.increment("failedAttempts");
	} catch (error) {
		console.log(error);
		throw new Error("Error Updating Failed Attempt");
	}
};

module.exports = { findByUserId, register, failedAttempt, updatePassword, update, findByPk };
