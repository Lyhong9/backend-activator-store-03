const express = require("express");
const app = express();
const port = 3000;
app.use(express.json()); // for body parser
const db = require("./models");
const path = require("path");

const userRoute = require("./src/routes/user");
const authRoute = require("./src/routes/auth");
const authMiddleware = require("./src/middlewares/authMiddleware");
const productRoute = require("./src/routes/product");
const categoryRoute = require("./src/routes/category");
const fileUpload = require('express-fileupload');
const customerRoute = require("./src/routes/customer")
const orderDetailRoute = require("./src/routes/orderdetail");
const orderRoute = require("./src/routes/order");

const cors = require("cors"); // Import the CORS middleware
const allowedOrigins = [
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in the whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE", // Specify allowed methods
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    createParentPath: true,
  }),
);

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/customers", customerRoute);
app.use("/api/v1/orderdetails", orderDetailRoute);
app.use("/api/v1/orders", orderRoute);

db.sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.error("Connection failed:", err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});