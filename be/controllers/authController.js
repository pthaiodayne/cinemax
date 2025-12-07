const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models/User');

//register new customer
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone, dob, gender } = req.body;

    //check: user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create customer
    const userId = await Customer.create({
      email,
      password_hash: hashedPassword,
      name,
      phone,
      dob,
      gender
    });

    //JWT token - using for authentication
    const token = jwt.sign(
      { userId, email, userType: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: {
        userId,
        email,
        name,
        phone,
        userType: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
};

//login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check user (checks both Customer and Staff tables)
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    //JWT token - using for authentication
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email, 
        userType: user.userType,
        role: user.role || 'customer'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
};

//user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId, req.user.userType);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        userType: req.user.userType,
        role: user.role,
        date_join: user.date_join || user.last_active
      }
    });
  } catch (error) {
    next(error);
  }
};

//update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gender } = req.body;
    const { Customer, Staff } = require('../models/User');

    let updated;
    if (req.user.userType === 'customer') {
      updated = await Customer.update(req.user.userId, { name, phone, gender });
    } else {
      updated = await Staff.update(req.user.userId, { name, phone, gender });
    }

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await User.findById(req.user.userId, req.user.userType);

    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all customers (Staff only)
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { pool } = require('../db/connection');
    
    const [customers] = await pool.execute(
      `SELECT user_id, name, email, phone, dob, gender, date_join 
       FROM customer 
       ORDER BY name ASC`
    );

    console.log(`Staff retrieved ${customers.length} customers`);

    res.json({
      count: customers.length,
      customers
    });
  } catch (error) {
    next(error);
  }
};
