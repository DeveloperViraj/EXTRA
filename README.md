#  Personal Finance Tracker (Full-Stack Expense Management App)

This project is a full-stack personal finance tracker that helps users record, categorize, and analyze their income and expenses.
It is designed to demonstrate real-world CRUD operations, backend API design, and clean data modeling using MongoDB.

The focus of this project is on practical full-stack fundamentals, not just UI.

---

##  Tech Stack

### Frontend
- React
- JavaScript
- Axios
- CSS / Tailwind (if applicable)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

##  Core Features

- Add, edit, and delete expenses
- Track income and expense history
- Categorize transactions (food, rent, travel, etc.)
- View current balance and transaction summary
- Persistent data storage using MongoDB
- Clean REST API structure

---

##  High-Level Flow

1. User interacts with the frontend UI
2. Frontend sends HTTP requests to backend APIs
3. Backend validates and processes the data
4. Data is stored or fetched from MongoDB
5. Updated data is returned to the frontend
6. UI updates automatically based on responses

---

##  Project Structure

```txt
personal-finance-tracker/
├── client/                # Frontend (React)
│   ├── src/
│   └── package.json
│
├── server/                # Backend (Node + Express)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   └── server.js
│
└── README.md
```

---

##  Installation & Setup

### Clone the repository
```bash
git clone https://github.com/DeveloperViraj/EXTRA.git
cd personal-finance-tracker
```

### Install dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

---

##  Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance
```

---

##  Running the Project

Start backend:
```bash
cd server
npm run dev
```

Start frontend:
```bash
cd client
npm start
```

Backend runs on:
```
http://localhost:5000
```

Frontend runs on:
```
http://localhost:3000
```

---

##  Why This Project Matters

This project demonstrates:
- Full-stack CRUD operations
- REST API design
- MongoDB schema modeling
- Frontend-backend integration
- Clean project structure
