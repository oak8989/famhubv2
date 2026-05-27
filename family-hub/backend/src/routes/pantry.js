import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Get all pantry items for family
router.get('/', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId } = req.query;
  
  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    const items = db.prepare(`
      SELECT * FROM pantry_items 
      WHERE family_id = ? 
      ORDER BY category, name ASC
    `).all(familyId);

    res.json(items);
  } catch (error) {
    console.error('Get pantry items error:', error);
    res.status(500).json({ error: 'Failed to fetch pantry items' });
  }
});

// Add item to pantry
router.post('/', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, name, barcode, quantity, unit, category, expirationDate, location, notes } = req.body;

  if (!familyId || !name) {
    return res.status(400).json({ error: 'Family ID and name are required' });
  }

  try {
    const itemId = uuidv4();
    db.prepare(`
      INSERT INTO pantry_items (id, family_id, name, barcode, quantity, unit, category, expiration_date, location, notes, added_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(itemId, familyId, name, barcode || null, quantity || '1', unit || null, category || null, expirationDate || null, location || null, notes || null, req.user.id);

    const item = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(itemId);
    res.status(201).json(item);
  } catch (error) {
    console.error('Add pantry item error:', error);
    res.status(500).json({ error: 'Failed to add pantry item' });
  }
});

// Update pantry item
router.put('/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { name, barcode, quantity, unit, category, expirationDate, location, notes } = req.body;

  try {
    db.prepare(`
      UPDATE pantry_items 
      SET name = ?, barcode = ?, quantity = ?, unit = ?, category = ?, expiration_date = ?, location = ?, notes = ?
      WHERE id = ?
    `).run(name, barcode, quantity, unit, category, expirationDate, location, notes, id);

    const item = db.prepare('SELECT * FROM pantry_items WHERE id = ?').get(id);
    res.json(item);
  } catch (error) {
    console.error('Update pantry item error:', error);
    res.status(500).json({ error: 'Failed to update pantry item' });
  }
});

// Delete pantry item
router.delete('/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM pantry_items WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete pantry item error:', error);
    res.status(500).json({ error: 'Failed to delete pantry item' });
  }
});

// Search pantry by barcode
router.get('/barcode/:barcode', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { barcode } = req.params;
  const { familyId } = req.query;

  try {
    const items = db.prepare(`
      SELECT * FROM pantry_items 
      WHERE barcode = ? AND family_id = ?
    `).all(barcode, familyId);

    res.json(items);
  } catch (error) {
    console.error('Search by barcode error:', error);
    res.status(500).json({ error: 'Failed to search by barcode' });
  }
});

// Get expiring items
router.get('/expiring', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, days = 7 } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

    const items = db.prepare(`
      SELECT * FROM pantry_items 
      WHERE family_id = ? 
      AND expiration_date IS NOT NULL 
      AND expiration_date <= ?
      ORDER BY expiration_date ASC
    `).all(familyId, cutoffDate.toISOString().split('T')[0]);

    res.json(items);
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

export default router;
