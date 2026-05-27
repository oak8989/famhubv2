import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Get all tasks for family
router.get('/', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, status } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    let query = 'SELECT * FROM tasks WHERE family_id = ?';
    const params = [familyId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY due_date ASC, created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, title, description, priority, dueDate, assignedTo } = req.body;

  if (!familyId || !title) {
    return res.status(400).json({ error: 'Family ID and title are required' });
  }

  try {
    const taskId = uuidv4();
    db.prepare(`
      INSERT INTO tasks (id, family_id, title, description, priority, due_date, assigned_to, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(taskId, familyId, title, description || null, priority || 'medium', dueDate || null, assignedTo || null, req.user.id);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  try {
    let completedAt = null;
    if (status === 'completed') {
      completedAt = new Date().toISOString();
    }

    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, assigned_to = ?, completed_at = ?
      WHERE id = ?
    `).run(title, description, status, priority, dueDate, assignedTo, completedAt, id);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
