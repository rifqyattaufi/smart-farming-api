const express = require('express');

const app = express();
const PORT = 8080;

const usersRouter = require('./src/routes/users');

app.use('/api/users', usersRouter);

app.listen(
    PORT,
    () => console.log(`Server is running on http://localhost:${PORT}`)
);