const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const database = require('../database');

const authenticateToken = require('../middlewares/authenticateToken')


router.post('/signin', async (req, res) => {
    try {
        const { id, password } = req.body;

        const sql = 'SELECT * FROM users WHERE id = ?';
        database.query(sql, id, (err, result) => {
            if (err) {
                console.error('Error retrieving user from database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(401).json({ error: 'Authentication failed. Invalid username or password.' });
            }

            const user = result[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!isMatch) {
                    return res.status(401).json({ error: 'Authentication failed. Invalid username or password.' });
                }

                const accessToken = generateAccessToken(user.id);
                const refreshToken = generateRefreshToken(user.id);

                res.json({ accessToken, refreshToken });
            });
        });
    } catch (err) {
        console.error('Error during signin:', err);
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/signin/new_token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error('Error verifying refresh token:', err);
                return res.status(401).json({ error: 'Invalid refresh token' });
            }

            // Создание и выдача нового bearer токена
            const accessToken = generateAccessToken(decoded.userId);
            res.json({ accessToken });
        });
    } catch (err) {
        console.error('Error during token renewal:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { id, password } = req.body;

        const checkSql = 'SELECT * FROM users WHERE id = ?';
        database.query(checkSql, id, (err, result) => {
            if (err) {
                console.error('Error checking user in database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length > 0) {
                return res.status(409).json({ error: 'User already exists' });
            }

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const sql = 'INSERT INTO users (id, password) VALUES (?, ?)';
                const values = [id, hash];
                database.query(sql, values, (err, result) => {
                    if (err) {
                        console.error('Error adding user to database:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    const accessToken = generateAccessToken(id);
                    const refreshToken = generateRefreshToken(id);

                    res.json({ accessToken, refreshToken });
                });
            });
        });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/info', authenticateToken, async (req, res) => {
    res.json({ id: req.user });
});

router.get('/logout', async (req, res) => {
    res.sendStatus(204);
});

function generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}


function generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET);
}
module.exports = router;
