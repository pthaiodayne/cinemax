const { pool } = require('../db/connection');

class Combo {
  static async create(comboData) {
  const { combo_name, price, image_url } = comboData;

  const [result] = await pool.execute(
    'INSERT INTO combo (name, price, image_url) VALUES (?, ?, ?)',
    [combo_name, price, image_url || null]
  );

  // Lấy combo vừa tạo theo id tự sinh
  return result.insertId;
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

    // Map combo_name to name for database
    const mappedData = { ...comboData };
    if (mappedData.combo_name !== undefined) {
      mappedData.name = mappedData.combo_name;
      delete mappedData.combo_name;
    }

    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] !== undefined && key !== 'combo_id') {
        fields.push(`${key} = ?`);
        params.push(mappedData[key]);
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
