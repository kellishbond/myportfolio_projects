const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001; // Backend port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database
let subscriptions = [];

// --- API Endpoints ---

// Create a new subscription
app.post('/subscriptions', (req, res) => {
    const { name, cost, billingCycle, nextRenewalDate, category } = req.body;

    // Basic validation
    if (!name || typeof cost !== 'number' || !billingCycle || !nextRenewalDate) {
        return res.status(400).json({ message: 'Missing required fields or invalid data type for cost.' });
    }

    const newSubscription = {
        id: uuidv4(),
        userId: 'default-user', // Placeholder for now
        name,
        cost,
        billingCycle,
        nextRenewalDate,
        category: category || null, // Optional
        createdAt: new Date().toISOString()
    };
    subscriptions.push(newSubscription);
    res.status(201).json(newSubscription);
});

// Get all subscriptions
app.get('/subscriptions', (req, res) => {
    res.status(200).json(subscriptions);
});

// Get a single subscription by ID (Optional, but good practice)
app.get('/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json(subscription);
});

// Update an existing subscription
app.put('/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const { name, cost, billingCycle, nextRenewalDate, category } = req.body;

    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === id);
    if (subscriptionIndex === -1) {
        return res.status(404).json({ message: 'Subscription not found' });
    }

    // Basic validation for update
    if (name === undefined || typeof cost !== 'number' || billingCycle === undefined || nextRenewalDate === undefined) {
        return res.status(400).json({ message: 'Missing required fields or invalid data type for cost for update.' });
    }

    const updatedSubscription = {
        ...subscriptions[subscriptionIndex],
        name: name || subscriptions[subscriptionIndex].name,
        cost: cost !== undefined ? cost : subscriptions[subscriptionIndex].cost,
        billingCycle: billingCycle || subscriptions[subscriptionIndex].billingCycle,
        nextRenewalDate: nextRenewalDate || subscriptions[subscriptionIndex].nextRenewalDate,
        category: category !== undefined ? category : subscriptions[subscriptionIndex].category,
        updatedAt: new Date().toISOString()
    };
    subscriptions[subscriptionIndex] = updatedSubscription;
    res.status(200).json(updatedSubscription);
});

// Delete a subscription
app.delete('/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(sub => sub.id !== id);

    if (subscriptions.length === initialLength) {
        return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(204).send(); // No content, successful deletion
});

// --- Email Sending Logic (using Ethereal for testing) ---
let transporter;

async function setupEmailTransporter() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
    console.log(`Ethereal email test account ready: User: ${testAccount.user}, Pass: ${testAccount.pass}`);
    console.log(`Preview URLs will be sent to this account's inbox on Ethereal.`);
}

setupEmailTransporter().catch(console.error);

async function sendReminderEmail(subscription) {
    if (!transporter) {
        console.error('Transporter not initialized yet.');
        return;
    }

    const mailOptions = {
        from: '"Subscription Tracker" <noreply@subtracker.example.com>',
        to: 'user@example.com', // Placeholder: In a real app, this would be the user's email
        subject: `Reminder: Your subscription for "${subscription.name}" is renewing soon!`,
        text: `Hi there,\n\nThis is a friendly reminder that your subscription for "${subscription.name}" for $${subscription.cost} per ${subscription.billingCycle} is due for renewal on ${new Date(subscription.nextRenewalDate).toLocaleDateString()}.\n\nThanks,\nThe Subscription Tracker Team`,
        html: `<p>Hi there,</p><p>This is a friendly reminder that your subscription for "<strong>${subscription.name}</strong>" for <strong>$${subscription.cost} per ${subscription.billingCycle}</strong> is due for renewal on <strong>${new Date(subscription.nextRenewalDate).toLocaleDateString()}</strong>.</p><p>Thanks,<br>The Subscription Tracker Team</p>`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // Preview URL only available when sending through Ethereal
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// --- Scheduled Job for Reminders ---
// Runs every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
    console.log('Running daily check for subscription renewals...');
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 3); // 3 days in advance

    subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.nextRenewalDate);
        // Check if renewalDate is within the next 3 days (inclusive of the 3rd day)
        // and specifically if the renewal date is the reminderDate (ignoring time)
        if (
            renewalDate.getFullYear() === reminderDate.getFullYear() &&
            renewalDate.getMonth() === reminderDate.getMonth() &&
            renewalDate.getDate() === reminderDate.getDate()
        ) {
            console.log(`Sending reminder for: ${sub.name} (renews on ${sub.nextRenewalDate})`);
            sendReminderEmail(sub);
        }
    });
}, {
    scheduled: true,
    timezone: "America/New_York" // Example: Use appropriate timezone
});


// Start the server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log('Email reminder cron job scheduled.');
});

// Basic error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
