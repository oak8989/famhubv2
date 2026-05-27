import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Get meal plans for family
router.get('/plans', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, startDate, endDate } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    let query = 'SELECT * FROM meal_plans WHERE family_id = ?';
    const params = [familyId];

    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date ASC, meal_type ASC';

    const meals = db.prepare(query).all(...params);
    res.json(meals);
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ error: 'Failed to fetch meal plans' });
  }
});

// Create meal plan entry
router.post('/plans', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, date, mealType, recipeName, notes } = req.body;

  if (!familyId || !date || !mealType) {
    return res.status(400).json({ error: 'Family ID, date, and meal type are required' });
  }

  try {
    const planId = uuidv4();
    db.prepare(`
      INSERT INTO meal_plans (id, family_id, date, meal_type, recipe_name, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(planId, familyId, date, mealType, recipeName || null, notes || null, req.user.id);

    const plan = db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(planId);
    res.status(201).json(plan);
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({ error: 'Failed to create meal plan' });
  }
});

// Update meal plan
router.put('/plans/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { date, mealType, recipeName, notes } = req.body;

  try {
    db.prepare(`
      UPDATE meal_plans 
      SET date = ?, meal_type = ?, recipe_name = ?, notes = ?
      WHERE id = ?
    `).run(date, mealType, recipeName, notes, id);

    const plan = db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(id);
    res.json(plan);
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({ error: 'Failed to update meal plan' });
  }
});

// Delete meal plan
router.delete('/plans/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM meal_plans WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ error: 'Failed to delete meal plan' });
  }
});

// Get all recipes for family
router.get('/recipes', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID required' });
  }

  try {
    const recipes = db.prepare(`
      SELECT * FROM recipes 
      WHERE family_id = ? 
      ORDER BY name ASC
    `).all(familyId);

    res.json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Create recipe
router.post('/recipes', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { familyId, name, ingredients, instructions, prepTime, cookTime, servings, category } = req.body;

  if (!familyId || !name) {
    return res.status(400).json({ error: 'Family ID and recipe name are required' });
  }

  try {
    const recipeId = uuidv4();
    db.prepare(`
      INSERT INTO recipes (id, family_id, name, ingredients, instructions, prep_time, cook_time, servings, category, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(recipeId, familyId, name, ingredients || null, instructions || null, prepTime || null, cookTime || null, servings || null, category || null, req.user.id);

    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update recipe
router.put('/recipes/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { name, ingredients, instructions, prepTime, cookTime, servings, category } = req.body;

  try {
    db.prepare(`
      UPDATE recipes 
      SET name = ?, ingredients = ?, instructions = ?, prep_time = ?, cook_time = ?, servings = ?, category = ?
      WHERE id = ?
    `).run(name, ingredients, instructions, prepTime, cookTime, servings, category, id);

    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
    res.json(recipe);
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete recipe
router.delete('/recipes/:id', authMiddleware, (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
