const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Assuming you're using a MySQL database

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token
        const token = jwt.sign({ userId: user.user_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            user: { userId: user.user_id, name: user.name, role: user.role },
        });
    });
});

module.exports = router;
