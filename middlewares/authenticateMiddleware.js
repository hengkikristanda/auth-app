// authenticateMiddleware.js

const jwt = require("jsonwebtoken");

const authenticateMiddleware = (req, res, next) => {
	// Get the token from the request headers or cookies

	console.log(req);

	const token = req.headers.authorization || req.cookies.token;

	if (!token) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	try {
		// Verify the token using the secret key
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Check expiration
		if (decoded.expiresIn <= Date.now() / 1000) {
			return res.status(401).json({ error: "Unauthorized: Token has expired" });
		}

		// Attach the user information to the request for further handling in route handlers
		req.user = decoded;

		// Move to the next middleware or route handler
		next();
	} catch (error) {
		console.error(error);
		return res.status(401).json({ error: "Unauthorized: Invalid token" });
	}
};

module.exports = authenticateMiddleware;
