# 🔥📊 LeetStreak – Track. Code. Stay Consistent. 💻🚀  

**LeetStreak** is a full-stack web application designed to help developers maintain consistency in competitive programming.  
It integrates with the LeetCode GraphQL API to track user submissions, visualize coding statistics, and send automated reminder emails using a cron scheduler.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1685cdc8-7a6a-40eb-a5a3-0b4b7f6fcc6a" />


---

## 🌟 What is LeetStreak?

**LeetStreak** helps developers stay consistent on LeetCode by providing:

- 📈 Real-time submission tracking  
- 📊 Visual problem-solving analytics  
- ⏰ Automated reminder emails  
- 🔕 Option to enable/disable reminders  
- 👤 Secure user authentication  

It ensures you never lose consistency while giving you full control over notifications.

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

### ⏰ Automated Email Reminders  
📨 Sends reminder emails if user hasn’t coded  
⏳ Cron job runs at scheduled intervals  
📧 Email integration via backend service  
🔕 Users can enable or disable reminders anytime from their dashboard settings  

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
<img width="538" height="538" alt="image" src="https://github.com/user-attachments/assets/d3c5cf97-8e41-4617-968c-e2627c1f87fd" />


---

### 📱 Responsive UI  
📱 Mobile-friendly  
💻 Optimized for desktop  
🎨 Clean & modern dashboard  

---

## 🛠️ Tech Stack  

🖥️ Frontend: React.js  
⚙️ Backend: Node.js, Express.js  
🗄️ Database: MongoDB  
📡 API Integration: LeetCode GraphQL API  
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
