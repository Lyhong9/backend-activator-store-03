const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const validator = require('validator');

router.put('/change-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check email exists
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: `User email=${email} not found`,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Update password
    user.password = hashedPassword;

    await user.save();

    res.json({
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Change password failed',
      error: error.message,
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      gender,
    } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
      });
    }

    // Check email exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      isActive: true,
    });

    // Hide password
    const userData = user.toJSON();

    delete userData.password;

    res.json({
      message: 'User register successfully',
      data: userData,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Register failed',
      error: error.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //check email in db
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: `User email=${email} not found` });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    //create token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.firstName + ' ' + user.lastName,
      },
      'lyhong-activator-store-03-secret-key',
    );

    res.json({
      message: 'User login successfully',
      data: token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
});

module.exports = router;
