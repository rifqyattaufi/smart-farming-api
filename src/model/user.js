const dbPool = require('../config/database');

const getAllUser = () => {
    const SQLQuery = 'SELECT * FROM user';

    return dbPool.execute(SQLQuery);
};

const createUser = (data) => {
    const SQLQuery = `INSERT INTO user (nama, nim, alamat) VALUES ('${data.nama}', '${data.nim}', '${data.alamat}')`;
 
    return dbPool.execute(SQLQuery);
};

const updateUser = (data, id) => {
    const SQLQuery = `UPDATE user SET nama = '${data.nama}', nim = '${data.nim}', alamat = '${data.alamat}' WHERE id = ${id}`;

    return dbPool.execute(SQLQuery);
}

const deleteUser = (id) => {
    const SQLQuery = `DELETE FROM user WHERE id = ${id}`;

    return dbPool.execute(SQLQuery);
}

module.exports = {
    getAllUser,
    createUser,
    updateUser,
    deleteUser
};