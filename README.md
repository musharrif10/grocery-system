# 🛒 Grocery Management System

A full-stack (MERN) application designed to manage grocery inventory, track sales, and provide business analytics. This system includes features for stock management, automated low-stock alerts, and user authentication.

## 🚀 Key Features

-   **Dashboard Analytics**: Visualize total revenue, sales trends, and top-selling products.
-   **Inventory Management**: Full CRUD (Create, Read, Update, Delete) functionality for products.
-   **Sales Tracking**: Record transactions and automatically deduct stock from inventory.
-   **Low Stock Alerts**: Automated email notifications (via `node-cron` & `nodemailer`) when products fall below a specific threshold.
-   **User Authentication**: Secure Login/Register using `bcryptjs` and `JWT`.
-   **Modern UI**: Responsive design built with React and Tailwind CSS.

## 🛠️ Tech Stack

-   **Frontend**: React.js, Tailwind CSS, Axios, React Router.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose ORM).
-   **Other Tools**: JSON Web Tokens (JWT), Node-cron (Scheduling), Nodemailer (Emailing).

## 📂 Project Structure

```text
├── backend/            # Express server, MongoDB models, API routes, schedulers
└── frontend/           # React frontend, Tailwind CSS, Axios services
```

## ⚙️ Installation

### 1. Prerequisite
-   Node.js installed.
-   MongoDB Atlas account (or local MongoDB).

### 2. Clone the Repository
```bash
git clone https://github.com/musharrif10/grocery-system.git
cd grocery-system
```

### 3. Setup Backend
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

### 4. Setup Frontend
1.  Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the React app:
    ```bash
    npm start
    ```

## 🚦 Usage

1.  Start the backend server: `npm run dev` (inside `/backend`).
2.  Start the frontend application: `npm start` (inside `/frontend`).
3.  Access the app at `http://localhost:3000`.

## 📄 License

This project is licensed under the ISC License.
