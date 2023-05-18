const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) {
            return res.sendStatus(401);
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } catch (err) {
        console.error('Error during token authentication:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = authenticateToken;
