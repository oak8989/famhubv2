import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mealsAPI } from '../utils/api';
import { format, startOfWeek, addDays } from 'date-fns';

export default function Meals() {
  const { family } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('plan');
  const [showModal, setShowModal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    date: '',
    mealType: 'breakfast',
    recipeName: '',
    notes: '',
  });

  useEffect(() => {
    if (family?.id) {
      loadMealPlans();
    }
  }, [family]);

  const loadMealPlans = async () => {
    try {
      const today = new Date();
      const start = format(startOfWeek(today), 'yyyy-MM-dd');
      const end = format(addDays(start, 6), 'yyyy-MM-dd');
      
      const response = await mealsAPI.getMealPlans(family.id, start, end);
      setMealPlans(response.data);
    } catch (error) {
      console.error('Failed to load meal plans:', error);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      await mealsAPI.createMealPlan({
        ...newMeal,
        familyId: family.id,
      });
      setShowModal(false);
      setNewMeal({ date: '', mealType: 'breakfast', recipeName: '', notes: '' });
      loadMealPlans();
    } catch (error) {
      console.error('Failed to create meal plan:', error);
    }
  };

  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMealsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlans.filter(meal => meal.date === dateStr);
  };

  return (
    <div>
      <div className="header">
        <h1>Meal Planning</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Meal
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'plan' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('plan')}
          >
            Weekly Plan
          </button>
          <button
            className={`btn ${activeTab === 'recipes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </button>
        </div>

        {activeTab === 'plan' && (
          <div className="meal-plan-grid">
            {weekDays.map(day => {
              const dayMeals = getMealsForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div key={day.toISOString()} className="meal-day-card">
                  <div className="meal-day-title" style={{ color: isToday ? '#667eea' : 'inherit' }}>
                    {format(day, 'EEE')}
                    <div style={{ fontSize: '12px', fontWeight: 'normal' }}>
                      {format(day, 'MMM d')}
                    </div>
                  </div>
                  
                  {dayMeals.map(meal => (
                    <div key={meal.id} className="meal-entry">
                      <div className="meal-type">{meal.meal_type}</div>
                      <div className="meal-name">{meal.recipe_name}</div>
                      {meal.notes && (
                        <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
                          {meal.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayMeals.length === 0 && (
                    <div style={{ fontSize: '13px', color: '#a0aec0', padding: '8px 0' }}>
                      No meals planned
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            <p>Recipe management coming soon!</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              Store your favorite family recipes and easily add them to your meal plan.
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Meal to Plan</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAddMeal}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newMeal.date}
                  onChange={e => setNewMeal({...newMeal, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <select
                  className="form-select"
                  value={newMeal.mealType}
                  onChange={e => setNewMeal({...newMeal, mealType: e.target.value})}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recipe/Meal Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newMeal.recipeName}
                  onChange={e => setNewMeal({...newMeal, recipeName: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  value={newMeal.notes}
                  onChange={e => setNewMeal({...newMeal, notes: e.target.value})}
                  placeholder="Any special instructions or ingredients..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
