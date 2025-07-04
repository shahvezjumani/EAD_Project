# 🚀 Editable Portfolio Builder Web App

## 🌟 Project Overview
I'm excited to present my latest project—a fully **Editable Portfolio Builder Web App** designed to empower users to create and customize their professional portfolios with ease! This web app is built with modern technologies, ensuring a dynamic, responsive, and personalized experience.

## 💻 Tech Stack
- **React.js:** For building an interactive and dynamic user interface.
- **Tailwind CSS:** For sleek and responsive styling.
- **JavaScript, HTML, CSS:** Core technologies for structure, logic, and styling.
- **Database:** To save user data, ensuring a seamless and persistent experience for future visits.

## 🛠️ Key Features
- **Editable Sections:** Users can customize their profile picture, bio, skills, projects, and more.
- **Theme Selector:** Multiple color themes to match personal branding.
- **Data Persistence:** All changes are saved in the Database .
- **User-Friendly Interface:** Intuitive design for easy editing and navigation.

## 📸 Video
### Click to view video
[![Watch the Demo](https://github.com/shahvezjumani/Portfolio_builder_web_app/blob/main/video/thumbnail.jpeg)](https://www.linkedin.com/posts/shahvez-jumani_webdevelopment-reactjs-portfolio-activity-7296833787542315008-KdeL?utm_source=share&utm_medium=member_desktop&rcm=ACoAADnd2OYB1n0TfQB8ltq5Xlw3livNWiEtqT4)


## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed

### 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shahvezjumani/EAD_Project
   cd EAD_Project
   ```

2. **Install frontend dependencies:**
   ```bash
   cd Editable-Portfolio
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables:**

   Create `.env` files in both the frontend and backend directories. Sample files are provided with empty values.

   - For **frontend** (`Editable-Portfolio/.env`):
     ```env
     VITE_BACKEND_URL=http://localhost:<your-backend-port>
     ```

   - For **backend** (`backend/.env`):
     ```env
     PORT=
     MONGODB_URI=
     CORS_ORIGIN=
     ACCESS_TOKEN_SECRET=
     ACCESS_TOKIN_EXPIRY=
     REFRESH_TOKEN_SECRET=
     REFRESH_TOKIN_EXPIRY=
     CLOUDINARY_CLOUD_NAME=
     CLOUDINARY_API_KEY=
     CLOUDINARY_API_SECRET=
     NODE_ENV=
     SMTP_USER=
     SMTP_PASSWORD=
     SMTP_EMAIL=
     ```

   > ⚠️ Replace the above values with your actual environment credentials.

5. **Run the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend should now be running at `http://localhost:5000`.

6. **Run the frontend app:**

   Open a **new terminal**:
   ```bash
   cd Editable-Portfolio
   npm run dev
   ```
   The frontend should now be running at `http://localhost:5173`.

---

### 📂 Folder Structure

```
EAD_Project
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   └── server.js
├── Editable-Portfolio
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── App.jsx
├── .gitignore
├── README.md
└── package.json
```

✅ You now have both frontend and backend running locally. Customize the code and `.env` files as needed!

## 🛠️ Customization
- **Profile Picture & Bio:** Upload an image and write your bio directly in the app.
- **Skills & Projects:** Add, edit, or delete skills and projects with links and descriptions.
- **Theme Selection:** Choose from multiple color themes for your portfolio.

## 🧠 Reflection
This project showcases my front-end development skills, my understanding of React, and my ability to create user-centric applications. It reflects my passion for learning modern frameworks and building practical, real-world projects.

## 📬 Contact
If you have any questions or feedback, feel free to connect with me:
- LinkedIn: [Shahvez Jumani](https://www.linkedin.com/in/shahvez-jumani/)
- GitHub: [shahvezjumani](https://github.com/shahvezjumani)

I hope this portfolio web app helps others build a strong online presence. Let me know if you'd like to collaborate or enhance the project! 🚀

---


