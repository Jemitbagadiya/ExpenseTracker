const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// 🔥 FRONTEND SERVE (IMPORTANT)
app.use(express.static(path.join(__dirname, "../frontend")));

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Atlas Connected ✅"))
.catch(err => console.log(err));

// ================= USER MODEL =================
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

// ================= TRANSACTION MODEL =================
const transactionSchema = new mongoose.Schema({
    user_id: String,
    amount: Number,
    type: String,
    category: String,
    note: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// ================= ROUTES =================

// 🔥 ROOT → INDEX.HTML OPEN
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ================= AUTH =================

// SIGNUP
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists ❌" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "Signup successful ✅" });

    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found ❌" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password ❌" });
        }

        const token = jwt.sign(
            { id: user._id },
            "secretkey",
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful ✅",
            token,
            user_id: user._id
        });

    } catch (err) {
        res.status(500).json(err);
    }
});

// ================= USER =================

// GET USER
app.get("/get-user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE USER
app.put("/update-user/:id", async (req, res) => {
    try {
        const { name, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true }
        );

        res.json(updatedUser);

    } catch (err) {
        res.status(500).json(err);
    }
});

// ================= TRANSACTIONS =================

// ADD TRANSACTION
app.post("/add-transaction", async (req, res) => {
    try {
        const { user_id, amount, type, category, note } = req.body;

        const newTransaction = new Transaction({
            user_id,
            amount,
            type,
            category,
            note
        });

        await newTransaction.save();

        res.json({ message: "Transaction added ✅" });

    } catch (err) {
        res.status(500).json(err);
    }
});

// GET TRANSACTIONS
app.get("/get-transactions/:user_id", async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user_id: req.params.user_id
        });

        res.json(transactions);

    } catch (err) {
        res.status(500).json(err);
    }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});