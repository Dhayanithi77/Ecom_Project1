
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// Forgot Password - Update Password by Email
router.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update the password
      db.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ message: 'Password update failed' });
          }

          return res.status(200).json({ message: 'Password updated successfully' });
        }
      );
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
