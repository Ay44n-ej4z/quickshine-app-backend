import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECURE_KEY = process.env.ADMIN_SECURE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecretkey';

const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, secureKey } = req.body;

    const existingAdmin = await prisma.user.findFirst({
      where: { role: { name: 'admin' } },
    });

    if (existingAdmin && secureKey !== SECURE_KEY) {
      return res.status(403).json({ message: 'Unauthorized: Invalid secure key' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const role = await prisma.role.findFirst({ where: { name: 'admin' } });
    if (!role) return res.status(500).json({ message: 'Admin role not found' });

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        roleId: role.id,
      },
    });

    return res.status(201).json({ message: 'Admin registered', admin });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error });
  }
};

const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.user.findFirst({
      where: { email, role: { name: 'admin' } },
      include: { role: true },
    });

    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, role: admin.role.name }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({ token, admin });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error });
  }
};

export  {
  registerAdmin,
  loginAdmin,
};
