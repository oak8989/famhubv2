import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'family-hub-secret-change-in-production';

// Register
router.post('/register', (req, res) => {
  const db = req.app.get('db');
  const { email, password, name, familyName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const familyId = uuidv4();

    // Create user
    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)')
      .run(userId, email, hashedPassword, name);

    // Create family with user as admin
    const fName = familyName || `${name}'s Family`;
    db.prepare('INSERT INTO families (id, name) VALUES (?, ?)').run(familyId, fName);
    db.prepare('INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)')
      .run(familyId, userId, 'admin');

    const token = jwt.sign(
      { id: userId, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: userId, email, name },
      family: { id: familyId, name: fName, role: 'admin' },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = req.app.get('db');
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get family info
    const family = db.prepare(`
      SELECT f.id, f.name, fm.role 
      FROM families f 
      JOIN family_members fm ON f.id = fm.family_id 
      WHERE fm.user_id = ?
    `).get(user.id);

    res.json({ user, family });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
