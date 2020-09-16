const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token)
            return res.status(401).json({ error: "Authorization denied." });
        const verifiedToken = jwt.verify(token, process.env.JWT_KEY);
        if (!verifiedToken)
            return res.status(401).json({ error: "Authorization denied." });

        req.user = verifiedToken.id;
        next();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }

}

module.exports = auth;