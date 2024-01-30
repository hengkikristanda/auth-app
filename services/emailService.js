const nodemailer = require("nodemailer");
const { generateRandomPassword } = require("../utils/commonUtils");
require("dotenv").config();

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
		from: "noreply@soliditi.tech",
		to: email,
		subject: "Example Email",
		text: "This is an example email.",
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

const sendResetPasswordEmail = async (email, newRandomPassword) => {
	const mailOptions = {
		from: "noreply@soliditi.tech",
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

module.exports = { sendTestEmail, sendResetPasswordEmail };
