const { pool } = require('../db/connection');

class Combo {
  static async create(comboData) {
    const { name, price, image_url, combo_id } = comboData;

    //insert combo
    const [result] = await pool.execute(
      'INSERT INTO combo (combo_id, name, price, image_url) VALUES (?, ?, ?, ?)',
      [combo_id || null, name, price, image_url]
    );
    
    //get the generated combo_id if not provided
    if (!combo_id) {
      const [rows] = await pool.execute('SELECT LAST_INSERT_ID() as id');
      return rows[0].id;
    }
    return combo_id;
  }

  static async findById(comboId) {
    const [rows] = await pool.execute(
      'SELECT * FROM combo WHERE combo_id = ?',
      [comboId]
    );
    return rows[0];
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM combo ORDER BY price ASC'
    );
    return rows;
  }

  static async update(comboId, comboData) {
    const fields = [];
    const params = [];

    Object.keys(comboData).forEach(key => {
      if (comboData[key] !== undefined && key !== 'combo_id') {
        fields.push(`${key} = ?`);
        params.push(comboData[key]);
      }
    });

    if (fields.length === 0) return false;

    params.push(comboId);
    const query = `UPDATE combo SET ${fields.join(', ')} WHERE combo_id = ?`;

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async delete(comboId) {
    const [result] = await pool.execute(
      'DELETE FROM combo WHERE combo_id = ?',
      [comboId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Combo;
