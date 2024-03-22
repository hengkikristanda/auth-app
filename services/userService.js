const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { generateTimestampBasedUUID } = require("../utils/commonUtils");

const findByUserId = (userId) => {
	try {
		return User.findOne({ where: { userId } });
	} catch (error) {
		console.log(error);
	}
};

const findAll = (userId) => {
	try {
		if (userId) {
			return User.findAll({ where: { userId } });
		}
		return User.findAll();
	} catch (error) {
		console.log(error);
	}
};

const create = async (username, firstName, lastName, phone, password, userRoleId) => {
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		return User.create({
			id: uuidv4(),
			userId: username,
			firstName,
			lastName,
			phone,
			encodedPassword: hashedPassword,
			userRoleId,
		});
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

const update = async (userId, firstName, lastName, phone) => {
	try {
		return User.update({ firstName, lastName, phone }, { where: { userId } });
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

module.exports = {
	findByUserId,
	create,
	failedAttempt,
	updatePassword,
	update,
	findAll,
};
