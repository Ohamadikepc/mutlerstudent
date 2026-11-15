require("dotenv").config();
const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3465;
const sequelize = require("./database/database.js");

const studentRouter = require("./routes/studentrouter.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static(path.join(__dirname, "upload")));

app.use("/api/students", studentRouter);



app.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
});

const DBConnect = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

DBConnect();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});