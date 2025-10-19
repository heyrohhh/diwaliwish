const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (process.env.SMTP_SECURE === 'true'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify transporter on startup
transporter.verify()
    .then(() => console.log('✅ SMTP transporter ready'))
    .catch(err => console.error('❌ SMTP transporter verification failed:', err.message));

// Test endpoint to quickly check email
app.get('/test-email', async (req, res) => {
    try {
        let info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.EMAIL_TO,
            subject: 'Test Email',
            text: 'This is a test email from local server'
        });
        console.log('Email info:', info.response);
        res.send('Test email sent! Check console for info.');
    } catch (err) {
        console.error('Error sending test email:', err);
        res.status(500).send('Failed: ' + err.message);
    }
});

// Submit route to handle form submissions
app.post('/submit', async (req, res) => {
    try {
        const { name, relation, message, upi, gameNumber, prize, sender } = req.body;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.EMAIL_TO || process.env.SMTP_USER,
            subject: '🪔 New Diwali Website Response',
            text: `Name: ${name || 'N/A'}
Relation: ${relation || 'N/A'}
Sender: ${sender || 'N/A'}
Message: ${message || 'N/A'}
UPI: ${upi || 'N/A'}
Game Number: ${gameNumber || 'N/A'}
Prize: ${prize || 'N/A'}`
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
console.log('Received form data:', req.body);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// SPA fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
