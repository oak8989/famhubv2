import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Get all events for family
router.get('/', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    const events = db.prepare(`
      SELECT * FROM calendar_events 
      WHERE family_id = ? 
      ORDER BY start_time ASC
    `).all(familyId);

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create event
router.post('/', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, title, description, startTime, endTime, location, category, assignedTo } = req.body;

  if (!familyId || !title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Family ID, title, start time, and end time are required' });
  }

  try {
    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO calendar_events (id, family_id, title, description, start_time, end_time, location, category, assigned_to, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, familyId, title, description || null, startTime, endTime, location || null, category || 'general', assignedTo || null, req.user.id);

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(eventId);
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { title, description, startTime, endTime, location, category, assignedTo } = req.body;

  try {
    db.prepare(`
      UPDATE calendar_events 
      SET title = ?, description = ?, start_time = ?, end_time = ?, location = ?, category = ?, assigned_to = ?
      WHERE id = ?
    `).run(title, description, startTime, endTime, location, category, assignedTo, id);

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
