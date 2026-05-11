require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, balance: user.balance } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, balance: user.balance } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, balance: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

app.post('/api/quotes', authenticateToken, async (req, res) => {
  const { title, description, amount } = req.body;
  try {
    const quote = await prisma.quote.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        userId: req.user.userId
      }
    });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Error creating quote' });
  }
});

app.get('/api/quotes', authenticateToken, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quotes' });
  }
});

app.post('/api/withdraw', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const withdraw = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.userId },
        data: { balance: { decrement: parseFloat(amount) } }
      }),
      prisma.withdrawal.create({
        data: {
          amount: parseFloat(amount),
          userId: req.user.userId
        }
      })
    ]);

    res.json(withdraw[1]);
  } catch (error) {
    res.status(500).json({ error: 'Error processing withdrawal' });
  }
});

app.get('/api/withdrawals', authenticateToken, async (req, res) => {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching withdrawals' });
    }
});

app.get('/api/quotes/:id', async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quote' });
  }
});

app.post('/api/quotes/:id/pay', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });

    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.status === 'PAID') return res.status(400).json({ error: 'Quote is already paid' });

    const sellerEarning = quote.amount * 0.85;

    await prisma.$transaction([
      prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'PAID' }
      }),
      prisma.user.update({
        where: { id: quote.userId },
        data: { balance: { increment: sellerEarning } }
      })
    ]);

    res.json({ message: 'Payment successful', amountPaid: quote.amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing payment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
