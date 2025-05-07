import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import adminRoutes from './routes/adminRoutes'; 

dotenv.config();

const app = express();
app.use(express.json());

// Instantiate Prisma Client
const prisma = new PrismaClient();
app.use(express.json());
app.use('/admin', adminRoutes);


// API endpoint to check if everything is working
app.get('/', async (req, res) => {
  try {
    // Check if Prisma can connect to the DB
    const users = await prisma.user.findMany();
    res.json({ message: 'API is running...', users });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

export default app;
