import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../utils/api';

export default function Tasks() {
  const { family } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    if (family?.id) {
      loadTasks();
    }
  }, [family, filter]);

  const loadTasks = async () => {
    try {
      const status = filter === 'all' ? null : filter;
      const response = await tasksAPI.getTasks(family.id, status);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.createTask({
        ...newTask,
        familyId: family.id,
      });
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const toggleTaskComplete = async (task) => {
    try {
      await tasksAPI.updateTask(task.id, {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed',
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await tasksAPI.deleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Family Tasks</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Task
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.status === 'completed' ? 'task-completed' : ''}`}>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.status === 'completed'}
                onChange={() => toggleTaskComplete(task)}
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className={`priority-${task.priority}`}>● {task.priority}</span>
                  {task.due_date && ` • Due: ${new Date(task.due_date).toLocaleDateString()}`}
                </div>
              </div>
              <button className="btn btn-danger" onClick={() => deleteTask(task.id)}>Delete</button>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            No tasks found. Create one to get started!
          </p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Task</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
