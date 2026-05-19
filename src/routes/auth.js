const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, isActive } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      isActive: true,
    });

    res.json({
      message: 'User register successfully',
      data: user,
    });
  } catch (error) {
    console.log(error);
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
  }
});

module.exports = router;
