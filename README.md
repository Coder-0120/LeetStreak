# 🔥📊 LeetStreak – Track. Code. Stay Consistent. 💻🚀  

**LeetStreak** is a full-stack web application designed to help developers maintain consistency in competitive programming.  
It integrates with the LeetCode GraphQL API to track user submissions, visualize coding statistics, and send automated reminder emails using a cron scheduler.
<img width="1920" height="1080" alt="Screenshot (277)" src="https://github.com/user-attachments/assets/5590134a-1d6f-4bff-9ec9-70f369340adf" />


---

## 🌟 What is LeetStreak?

**LeetStreak** helps developers stay consistent on LeetCode by providing:

- 📈 Real-time submission tracking  
- 📊 Visual problem-solving analytics  
- ⏰ Automated reminder emails  
- 🔕 Option to enable/disable reminders  
- 🤖 AI-powered DSA Instructor for instant doubt solving  
- 👤 Secure user authentication  

It ensures you never lose consistency while also helping you **learn and improve in real-time**.

---

## 🚀 Key Features

### 🔐 Authentication & Security  
🔑 Secure Login & Signup  
🔒 Password hashing  
🛡️ Protected routes for dashboards  
💾 User session persistence  

---

### 📊 LeetCode Submission Tracking  
🔎 Fetches data using LeetCode GraphQL API  
📥 Tracks accepted submissions  
📅 Detects daily activity  
📌 Stores user submission history  
⚡ Syncs data periodically  

---

### 📈 Problem-Solving Analytics  
📊 Total problems solved  
🟢 Easy / 🟡 Medium / 🔴 Hard breakdown  
📅 Submission activity over time  
📉 Performance insights  

---

### 🤖 AI-Powered DSA Instructor (NEW 🚀)

An integrated AI chatbot that helps users understand Data Structures & Algorithms concepts instantly.

#### 💡 Features:
- 🤖 Answers **only DSA-related questions**  
- 📚 Provides **simple explanations with examples**  
- 💻 Generates **code snippets when needed**  
- 🚫 Politely rejects non-DSA queries  
- ⚡ Real-time chat inside the dashboard  

#### 🧠 How it works:
- User asks a question from dashboard  
- Frontend sends request via Axios  
- Backend securely processes the request  
- AI generates a DSA-focused response  
- Answer is displayed instantly  

#### 🔐 Security:
- API key stored securely using environment variables  
- No exposure of sensitive data on frontend  

---

### ⏰ Automated Email Reminders  
📨 Sends reminder emails if user hasn’t coded  
⏳ Cron job runs at scheduled intervals  
📧 Email integration via backend service  
🔕 Users can enable or disable reminders anytime  

---

### ⚙️ Reminder Control System  
🎛️ Toggle switch in user settings  
✅ Enable reminders when preparing actively  
🚫 Disable reminders anytime  
💾 Preference stored securely in database  
🔄 Cron checks user preference before sending email  

---

### 🔔 Smart Notifications  
🎉 Success & error alerts  
⚠️ Reminder alerts  
💡 Real-time feedback  

---

### 📱 Responsive UI  
📱 Mobile-friendly  
💻 Optimized for desktop  
🎨 Clean & modern dashboard  

---

## 🛠️ Tech Stack  

🖥️ Frontend: React.js + TypeScript  
⚙️ Backend: Node.js, Express.js  
🗄️ Database: MongoDB  
📡 API Integration: LeetCode GraphQL API  
🤖 AI Integration: Google Gemini API  
⏰ Scheduler: Node Cron  
📧 Email Service: SMTP / Brevo  

---

## ⚡ Getting Started  

### 🔽 Clone Repository  

```bash
git clone https://github.com/Coder-0120/LeetStreak.git
cd LeetStreak
```

---

### 📦 Install Backend Dependencies  

```bash
cd server
npm install
```

---

### 📦 Install Frontend Dependencies  

```bash
cd client
npm install
```

---

### 🔑 Create a `.env` File (Server)

Add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CRON_SCHEDULE=*/240 * * * *
```

---

### ▶️ Run Development Server  

From root directory:

```bash
npm run dev
```

Frontend will run at:  
http://localhost:3000  

Backend will run at:  
http://localhost:5000  

---

## 🎯 Why LeetStreak?  

- 💼 Ideal for internship & placement preparation  
- 📊 Data-driven progress tracking  
- ⏰ Automated accountability  
- 🔕 Full control over reminder notifications  

---

## 📌 Future Improvements  

- 📱 Push notifications  
- 🏆 Leaderboard feature  
- 📅 Weekly & monthly reports  
- 🌐 OAuth login (Google authentication)  

---

## 👨‍💻 Author  

Developed to help developers stay consistent and grow daily 🚀  

If you like this project, ⭐ star the repository and share it!
