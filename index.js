require("dotenv").config();
const PORT = process.env.PORT || 5000;
const express = require("express");

const app = express();

// Import routes
const indexRouter = require("./src/routes/indexRoute");
const peternakanRouter = require("./src/routes/peternakan/peternakanIndex");
const perkebunanRouter = require("./src/routes/perkebunan/perkebunanIndex");
const storeRouter = require("./src/routes/store/storeIndex");

const apiRouter = express.Router();

// Use routes
apiRouter.use("/", indexRouter);
apiRouter.use("/peternakan", peternakanRouter);
apiRouter.use("/perkebunan", perkebunanRouter);
apiRouter.use("/store", storeRouter);

//middleware
app.use(express.json());

app.use("/api", apiRouter);
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found on this server.",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    message: "Internal Server Error",
  });
});

// const User = require("./src/model/user");
// app.get("/", (req, res) => {
//   try {
//     User.findAll().then((data) => {
//       res.json(data);
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//       detail: error,
//     });
//   }
// });

// app.post("/", (req, res) => {
//   try {
//     User.create(req.body).then((data) => {
//       res.status(201).json({
//         message: "User created",
//         data: data,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//       detail: error,
//     });
//   }
// });

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
