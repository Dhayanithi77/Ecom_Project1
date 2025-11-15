
require('dotenv').config(); 
const express = require('express');
const path  = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mysql = require('mysql2/promise'); 
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL; 
app.use('/api', authRoutes);


const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
dbPool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database.');
    connection.release(); 
  })
  .catch(err => {
    console.error('!!! Error connecting to MySQL database:');
    console.error(`!!! Make sure database '${process.env.DB_NAME}' exists and credentials in .env are correct.`);
    console.error(err.message);
    
  });
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?'; 

    try {
        const [results] = await dbPool.query(query, [username, password]);

        if (results.length > 0) {
            console.log(`Login successful for user: ${username}`);
            res.json({ success: true, message: 'Login successful!' });
        } else {
            console.log(`Login failed for user: ${username}`);
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error('Database error during login:', err);
        res.status(500).json({ success: false, message: 'Database error during login.' });
    }
});
app.post('/stripe-checkout', async (req, res) => {
    const { items } = req.body; 

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid cart items provided.' });
    }

    try {
        const line_items = items.map(item => {
            const priceString = String(item.price).replace(/[₹,]/g, '');
            const unitAmount = parseFloat(priceString);

            if (isNaN(unitAmount) || unitAmount <= 0) {
                throw new Error(`Invalid price format for item: ${item.title}`);
            }
            const unitAmountInPaise = Math.round(unitAmount * 100);

            return {
                price_data: {
                    currency: 'inr', 
                    product_data: {
                        name: item.title,
                        images: [item.productImg], 
                    },
                    unit_amount: unitAmountInPaise,
                },
                quantity: parseInt(item.quantity, 10), 
            };
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${BASE_URL}/success.html`, 
            cancel_url: `${BASE_URL}/cancel.html`,    
        });
        res.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ error: `Checkout failed: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on ${BASE_URL}`);
    console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`Ensure your Stripe Webhook endpoint (if used) is configured correctly.`);
    console.log(`---`);
    console.log(`Access Login Page: ${BASE_URL}/`);
    console.log(`(After login, you'll need JS to redirect to ${BASE_URL}/shop.html)`);
    console.log(`Access Shop Page Directly: ${BASE_URL}/shop.html`);
});


