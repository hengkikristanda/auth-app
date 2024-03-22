const emailService = require("../services/emailService");
const userService = require("../services/userService");
const { generateRandomPassword } = require("../utils/commonUtils");

const send = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).send({ error: "Email address is required" });
		}

		const emailPurpose = req.params.purpose;

		if (emailPurpose) {
			let result;

			if (emailPurpose === "test") {
				result = await emailService.sendTestEmail(email);
			} else if (emailPurpose === "resetPassword") {
				const existingUser = await userService.findByUserId(email);
				if (!existingUser) {
					return res.status(400).send({ error: "User Not Found" });
				}

				const newRandomPassword = generateRandomPassword();

				const updatedUser = await userService.updatePassword(existingUser.id, newRandomPassword);
				if (updatedUser[0] > 0) {
					result = await emailService.sendResetPasswordEmail(
						existingUser.userId,
						newRandomPassword
					);
				}
			}

			if (result.success) {
				return res.status(200).send({ message: result.message });
			} else {
				return res.status(500).send({ message: result.message });
			}
		}
		return res.status(404).send({ error: "Request Not Found" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const testSendEmail = async (req, res) => {
	try {
		const email = req.params.emailAddress;
		if (!email) {
			return res.status(400).send({ error: "Email address is required" });
		}

		// result = await emailService.sendTestEmail(email);
		result = await emailService.sendEmail(email, "resetPassword");

		if (result.success) {
			return res.status(200).send({ message: result.message });
		}
		return res.status(500).send({ message: result.message });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

module.exports = { send, testSendEmail };
