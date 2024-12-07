const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Import your database connection

const router = express.Router();
const JWT_SECRET = 'your_secret_key'; // Use a strong secret key

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user[0].user_id, role: user[0].role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            token,
            user: { id: user[0].user_id, name: user[0].name, role: user[0].role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
