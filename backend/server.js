const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 5000;
const AI_MODEL_API = 'http://127.0.0.1:8000/predict'; // URL of the Python Flask API

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// --- MongoDB Connection ---
mongoose.connect('mongodb://localhost:27017/bankDashboard')
    .then(() => {
        console.log("✅ Successfully connected to MongoDB");
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
    });


// --- Client Schema and Model ---
const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    income: { type: Number, required: true },
    loans: { type: Number, required: true },
    score: { type: Number, required: true }, // Loan repayment score
    offer: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);

// --- API Routes ---

/**
 * @route   GET /api/clients
 * @desc    Get all clients from the database
 */
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 }); // Sort by newest first
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error while fetching clients.' });
    }
});

/**
 * @route   POST /api/clients
 * @desc    Add a new client and get their repayment score from the AI model
 */
app.post('/api/clients', async (req, res) => {
    try {
        const { name, age, income, loans } = req.body;

        // 1. Validate incoming data
        if (!name || !age || !income || loans === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields: name, age, income, and loans.' });
        }

        // 2. Call the Python AI Model Service
        const features = [parseInt(age), parseInt(income), parseInt(loans)];
        let score, offer, message;

        try {
            const aiResponse = await axios.post(AI_MODEL_API, { features });
            score = aiResponse.data.repayment_score;
        } catch (aiError) {
            console.error('Error calling AI model API:', aiError.message);
            // Assign a default low score if AI service fails
            score = 0.1;
        }


        // 3. Generate offer and message based on the score
        if (score > 0.8) {
            offer = "خصم 15% على الفوائد";
            message = `تهانينا ${name}! بناءً على تقييمك الممتاز، يسعدنا أن نقدم لك خصمًا خاصًا.`;
        } else if (score > 0.5) {
            offer = "تمديد فترة السداد";
            message = `مرحباً ${name}, أنت مؤهل لتمديد فترة سداد قرضك لتخفيف الأقساط الشهرية.`;
        } else {
            offer = "مراجعة الحساب مطلوبة";
            message = `السيد/ة ${name}, نود تحديد موعد لمراجعة حسابك وبحث أفضل الحلول المالية لك.`;
        }

        // 4. Create and save the new client to MongoDB
        const newClient = new Client({
            name,
            age,
            income,
            loans,
            score,
            offer,
            message
        });

        const savedClient = await newClient.save();
        res.status(201).json(savedClient); // Return the newly created client

    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ message: 'Server error while creating the client.' });
    }
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Node.js backend server running on http://localhost:${PORT}`);
});
