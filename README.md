# Finance Tracker - Full-Stack Financial Planning Application

A modern, beautiful financial planning application built with React, TailwindCSS, Node.js, Express, and MongoDB. Track your expenses with stunning visualizations and insightful analytics.

## ✨ Features

- **Beautiful Dashboard UI** - Glassmorphism design with smooth animations
- **Expense Tracking** - Add expenses with amount, category, date, and notes
- **Smart Analytics** - Daily, weekly, and monthly spending summaries
- **Interactive Charts** - Bar charts, line charts, and pie charts for data visualization
- **Category Management** - 7 predefined categories with custom icons
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Real-time Updates** - Instant data refresh after adding expenses

## 🚀 Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS (latest)
- Recharts (for data visualization)
- Axios (API calls)
- date-fns (date formatting)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- Express Validator

## 📁 Project Structure

```
finance/
├── backend/
│   ├── models/
│   │   └── Expense.js
│   ├── controllers/
│   │   └── expenseController.js
│   ├── routes/
│   │   └── expenseRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ExpenseForm.jsx
    │   │   ├── ExpenseList.jsx
    │   │   ├── SummaryCards.jsx
    │   │   ├── DailyChart.jsx
    │   │   ├── WeeklyChart.jsx
    │   │   └── MonthlyChart.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── tailwind.config.js
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env` file):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-app
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be running at `http://localhost:5173`

## 📡 API Endpoints

### Expenses
- `POST /api/expenses` - Add a new expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/summary/daily` - Get daily summary
- `GET /api/expenses/summary/weekly` - Get weekly summary
- `GET /api/expenses/summary/monthly` - Get monthly summary

### Request Body Example (POST /api/expenses)
```json
{
  "amount": 500,
  "category": "Food",
  "date": "2025-11-23",
  "notes": "Lunch at restaurant"
}
```

## 🎨 Categories

- 🍔 Food
- 🚗 Transport
- 🎮 Entertainment
- 🛍️ Shopping
- 📄 Bills
- ⚕️ Health
- 📦 Other

## 🔮 Future Enhancements

- User authentication
- Budget setting and alerts
- Yearly reports
- Export data to CSV/PDF
- Multiple currency support
- Recurring expenses
- Receipt upload

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Built with ❤️ using React, TailwindCSS, Node.js & MongoDB
