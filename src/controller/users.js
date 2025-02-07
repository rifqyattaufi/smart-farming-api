const getAllUsers = (req, res) => {
    res.json({
        message: 'Handling GET request to /users'
    });
}

const createUser = (req, res) => {
    res.json({
        message: 'Handling POST request to /users'
    });
}

module.exports = {
    getAllUsers,
    createUser
};