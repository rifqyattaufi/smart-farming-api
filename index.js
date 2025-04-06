require("dotenv").config();
const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");

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
app.use(
  cors({
    origin: true,
    credential: true,
    preflightContinue: false,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
app.options("*", cors());
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
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
