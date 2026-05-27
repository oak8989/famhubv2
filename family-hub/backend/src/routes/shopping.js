import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Get all shopping lists for family
router.get('/lists', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    const lists = db.prepare(`
      SELECT * FROM shopping_lists 
      WHERE family_id = ? 
      ORDER BY created_at DESC
    `).all(familyId);

    // Get items for each list
    const listsWithItems = lists.map(list => {
      const items = db.prepare(`
        SELECT * FROM shopping_items 
        WHERE list_id = ? 
        ORDER BY checked ASC, created_at DESC
      `).all(list.id);
      return { ...list, items };
    });

    res.json(listsWithItems);
  } catch (error) {
    console.error('Get shopping lists error:', error);
    res.status(500).json({ error: 'Failed to fetch shopping lists' });
  }
});

// Create shopping list
router.post('/lists', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, name } = req.body;

  if (!familyId || !name) {
    return res.status(400).json({ error: 'Family ID and name are required' });
  }

  try {
    const listId = uuidv4();
    db.prepare('INSERT INTO shopping_lists (id, family_id, name, created_by) VALUES (?, ?, ?, ?)')
      .run(listId, familyId, name, req.user.id);

    const list = db.prepare('SELECT * FROM shopping_lists WHERE id = ?').get(listId);
    res.status(201).json({ ...list, items: [] });
  } catch (error) {
    console.error('Create shopping list error:', error);
    res.status(500).json({ error: 'Failed to create shopping list' });
  }
});

// Add item to shopping list
router.post('/lists/:listId/items', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { listId } = req.params;
  const { name, quantity, unit, category } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  try {
    const itemId = uuidv4();
    db.prepare(`
      INSERT INTO shopping_items (id, list_id, name, quantity, unit, category, added_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(itemId, listId, name, quantity || '1', unit || null, category || null, req.user.id);

    const item = db.prepare('SELECT * FROM shopping_items WHERE id = ?').get(itemId);
    res.status(201).json(item);
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Toggle item checked status
router.put('/items/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { checked } = req.body;

  try {
    db.prepare('UPDATE shopping_items SET checked = ? WHERE id = ?').run(checked ? 1 : 0, id);
    const item = db.prepare('SELECT * FROM shopping_items WHERE id = ?').get(id);
    res.json(item);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/items/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM shopping_items WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Delete shopping list
router.delete('/lists/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM shopping_items WHERE list_id = ?').run(id);
    db.prepare('DELETE FROM shopping_lists WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete shopping list' });
  }
});

export default router;
