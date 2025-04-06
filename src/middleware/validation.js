const { verifyAccessToken } = require("../config/jwt");

const authenticate = (roles = []) => {
    return (req, res, next) => {
        const headerToken = req.headers["authorization"];
        const token = headerToken && headerToken.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const user = verifyAccessToken(token);
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.user = user;

        if (roles.length > 0 && !roles.includes(user.role)) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        next();
    };
};

module.exports = { authenticate };
