import { PrismaClient } from '@prisma/client';
import app from './app';

const PORT = process.env.PORT || 5000;

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Connect to the database when the app starts
async function startServer() {
  try {
    // Connecting Prisma Client to the database
    await prisma.$connect();
    console.log('Connected to the database successfully');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit process with failure
  }
}

startServer();
