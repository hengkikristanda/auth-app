const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { generateRandomPassword } = require("../utils/commonUtils");

const EMAIL_CONFIG = {
	test: {
		from: `iLimist Test Mail <${process.env.SMTP_USER_NOREPLY}>`,
		subject: "Test sending email",
		text: "This is an example email",
	},
	resetPassword: {
		from: `iLimits CMS Reset Password <${process.env.SMTP_USER_NOREPLY}>`,
		subject: "Reset Password",
	},
};

function generateResetPasswordEmailBody(newPassword) {
	return [
		`<!DOCTYPE html>`,
		`<html>`,
		`<head>`,
		`<title>Password Reset</title>`,
		`</head>`,
		`<body>`,
		`<div style="font-family: Arial, sans-serif; padding: 20px;">`,
		`<h2 style="color: hsl(115, 43%, 52%);">Your Password Has Been Reset</h2>`,
		`<p>Hello,</p>`,
		`<p>As requested, we've reset your password. Here is your new temporary password:</p>`,
		`<p style="font-weight: bold; color: #333; background-color: #f4f4f4; padding: 10px; display: inline-block;">${newPassword}</p>`,
		`<p>Please use this new password to log into your account and immediately change it to something only you know.</p>`,
		`<a href="https://cms.ilimits.id/" style="display: inline-block; background-color: hsl(115, 43%, 52%); color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In</a>`,
		`<p>If you did not request a password reset, please contact our support team immediately.</p>`,
		`<p>Thanks,<br>The Team</p>`,
		`</div>`,
		`</body>`,
		`</html>`,
	].join("");
}

function generateEmailBody(newPassword) {
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <style>
                /* Add your custom styles here */
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: hsl(115, 43%, 52%);
                }
				h3 {
					font-weight: bold;
				}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Reset Your iLimits CMS Password</h1>
                <p>Your password has been successfully reset. Your new password is: <h3>${newPassword}</h3></p>
				<p>Please use this password to log in to your account and consider changing it for security reasons.</p>
            </div>
        </body>
        </html>
    `;
}

const transporterNoReply = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: true,
	auth: {
		user: process.env.SMTP_USER_NOREPLY,
		pass: process.env.SMTP_PASS_NOREPLY,
	},
});

const sendTestEmail = async (email) => {
	const mailOptions = {
		from: `iLimist Admin <${process.env.SMTP_USER_NOREPLY}>`,
		to: email,
		subject: "Example Email",
		text: "This is an example email.",
		html: "<b>Hello world?</b>", // html body
	};

	try {
		const info = await transporterNoReply.sendMail(mailOptions);
		console.log("Email sent:", info.response);
		return { success: true, message: "Email sent successfully!" };
	} catch (error) {
		console.error("Error sending email:", error);
		return { success: false, message: "Error sending email" };
	}
};

const sendEmail = async (email, purpose, content) => {
	const mailOptions = {
		from: EMAIL_CONFIG[purpose].from,
		to: email,
		subject: EMAIL_CONFIG[purpose].subject,
	};

	try {
		if (purpose === "resetPassword" && content) {
			mailOptions.html = generateResetPasswordEmailBody(content);
		}

		const info = await transporterNoReply.sendMail(mailOptions);
		console.log("Email sent:", info.response);
		return { success: true, message: "Email sent successfully!" };
	} catch (error) {
		console.error("Error sending email:", error);
		return { success: false, message: "Error sending email" };
	}
};

const sendResetPasswordEmail = async (email, newRandomPassword) => {
	const mailOptions = {
		from: process.env.SMTP_USER_NOREPLY,
		to: email,
		subject: "iLimits CMS: Request for Reset Password",
		html: generateEmailBody(newRandomPassword),
	};

	try {
		const info = await transporterNoReply.sendMail(mailOptions);
		console.log("Email sent:", info.response);
		return { success: true, message: "Email sent successfully!" };
	} catch (error) {
		console.error("Error sending email:", error);
		return { success: false, message: "Error sending email" };
	}
};

module.exports = { sendTestEmail, sendResetPasswordEmail, sendEmail };
