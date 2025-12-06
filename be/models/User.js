const { pool } = require('../db/connection');

class Customer {
  static async create(customerData) {
    const { email, password_hash, name, phone, dob, gender } = customerData;
    const [result] = await pool.execute(
      `INSERT INTO customer (email, password_hash, name, phone, dob, gender, date_join) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [email, password_hash, name, phone, dob, gender]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM customer WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(userId) {
    const [rows] = await pool.execute(
      'SELECT user_id, email, name, phone, dob, gender, date_join FROM customer WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  static async update(userId, customerData) {
    const { name, phone, gender } = customerData;
    const [result] = await pool.execute(
      'UPDATE customer SET name = ?, phone = ?, gender = ? WHERE user_id = ?',
      [name, phone, gender, userId]
    );
    return result.affectedRows > 0;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT user_id, email, name, phone, dob, gender, date_join FROM customer ORDER BY date_join DESC'
    );
    return rows;
  }

  static async delete(userId) {
    const [result] = await pool.execute(
      'DELETE FROM customer WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

class Staff {
  static async create(staffData) {
    const { email, password_hash, name, phone, dob, gender, role, theater_id, manager_id } = staffData;
    const [result] = await pool.execute(
      `INSERT INTO staff (email, password_hash, name, phone, dob, gender, role, theater_id, manager_id, last_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, password_hash, name, phone, dob, gender, role, theater_id, manager_id]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(userId) {
    const [rows] = await pool.execute(
      `SELECT s.user_id, s.email, s.name, s.phone, s.dob, s.gender, s.role, 
            s.theater_id, s.manager_id, s.last_active, t.name as theater_name
       FROM staff s
       LEFT JOIN theater t ON s.theater_id = t.theater_id
       WHERE s.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async update(userId, staffData) {
    const fields = [];
    const params = [];

    Object.keys(staffData).forEach(key => {
      if (staffData[key] !== undefined && key !== 'user_id') {
        fields.push(`${key} = ?`);
        params.push(staffData[key]);
      }
    });

    if (fields.length === 0) return false;

    params.push(userId);
    const query = `UPDATE staff SET ${fields.join(', ')} WHERE user_id = ?`;

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT s.user_id, s.email, s.name, s.phone, s.role, s.theater_id, 
             t.name as theater_name, s.last_active
      FROM staff s
      LEFT JOIN theater t ON s.theater_id = t.theater_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      query += ' AND s.role = ?';
      params.push(filters.role);
    }

    if (filters.theater_id) {
      query += ' AND s.theater_id = ?';
      params.push(filters.theater_id);
    }

    query += ' ORDER BY s.last_active DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

//universal user finder (searches both Customer and Staff)
class User {
  static async findByEmail(email) {
    //try Customer first
    let user = await Customer.findByEmail(email);
    if (user) {
      user.userType = 'customer';
      return user;
    }
    
    //try Staff
    user = await Staff.findByEmail(email);
    if (user) {
      user.userType = 'staff';
      return user;
    }
    
    return null;
  }

  static async findById(userId, userType) {
    if (userType === 'customer') {
      return await Customer.findById(userId);
    } else if (userType === 'staff') {
      return await Staff.findById(userId);
    }
    return null;
  }
}

module.exports = { User, Customer, Staff };
