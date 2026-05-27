# Family Hub - Self-Hosted Family Organization

A self-hosted alternative to Familywall that combines all essential family organization features in one application. **No messages or photos sections** - just the tools you need to stay organized.

## Features

- 📅 **Shared Calendar** - Schedule events, appointments, and activities for the whole family
- ✅ **Task Management** - Create and assign chores and tasks with priorities and due dates
- 🛒 **Shopping Lists** - Collaborative shopping lists that sync across all family members
- 🍽️ **Meal Planning** - Plan weekly meals and organize recipes

## Tech Stack

### Backend
- Node.js with Express
- SQLite database (better-sqlite3)
- JWT authentication
- RESTful API

### Frontend
- React 18
- Vite
- React Router
- Axios for API calls
- date-fns for date handling
- Custom CSS styling

## Project Structure

```
family-hub/
├── backend/
│   ├── src/
│   │   ├── index.js          # Main server file
│   │   ├── routes/
│   │   │   ├── auth.js       # Authentication routes
│   │   │   ├── calendar.js   # Calendar events API
│   │   │   ├── tasks.js      # Tasks API
│   │   │   ├── shopping.js   # Shopping lists API
│   │   │   └── meals.js      # Meal planning API
│   │   └── middleware/
│   │       └── auth.js       # JWT auth middleware
│   ├── data/                 # SQLite database storage
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx           # Main app component
    │   ├── main.jsx          # Entry point
    │   ├── index.css         # Global styles
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Calendar.jsx
    │   │   ├── Tasks.jsx
    │   │   ├── Shopping.jsx
    │   │   └── Meals.jsx
    │   ├── utils/
    │   │   └── api.js        # API client
    │   └── components/       # Reusable components
    ├── index.html
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /workspace/family-hub
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (from `backend` directory):
   ```bash
   npm start
   ```
   The API will run on `http://localhost:3001`

2. **Start the frontend dev server** (from `frontend` directory, in a new terminal):
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Usage

1. Open `http://localhost:3000` in your browser
2. Click "Sign up" to create your account
3. After registration, you'll be logged in automatically
4. Use the sidebar to navigate between features:
   - **Calendar**: Add and view family events
   - **Tasks**: Create and manage household tasks
   - **Shopping**: Create shared shopping lists
   - **Meals**: Plan your weekly meals

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Calendar
- `GET /api/calendar?familyId=xxx` - Get all events
- `POST /api/calendar` - Create event
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

### Tasks
- `GET /api/tasks?familyId=xxx&status=pending` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Shopping
- `GET /api/shopping/lists?familyId=xxx` - Get shopping lists
- `POST /api/shopping/lists` - Create list
- `POST /api/shopping/lists/:listId/items` - Add item
- `PUT /api/shopping/items/:id` - Update item (check/uncheck)
- `DELETE /api/shopping/items/:id` - Delete item
- `DELETE /api/shopping/lists/:id` - Delete list

### Meals
- `GET /api/meals/plans?familyId=xxx&startDate=xxx&endDate=xxx` - Get meal plans
- `POST /api/meals/plans` - Create meal plan entry
- `PUT /api/meals/plans/:id` - Update meal plan
- `DELETE /api/meals/plans/:id` - Delete meal plan
- `GET /api/meals/recipes?familyId=xxx` - Get recipes
- `POST /api/meals/recipes` - Create recipe

## Security Notes

- Change the default JWT secret in production by setting the `JWT_SECRET` environment variable
- The database is stored in `backend/data/familyhub.db`
- For production deployment, consider adding HTTPS and proper authentication hardening

## Environment Variables

### Backend
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens (default: 'family-hub-secret-change-in-production')

## License

MIT License - Feel free to use this for your personal family organization needs!
