# 📧 Email Setup Guide — april-86 Dress Store

## Step 1: Get Your Gmail App Password

Google requires an **App Password** (not your regular Gmail password) for sending emails via SMTP.

### How to create a Gmail App Password:

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification** and enable it (if not already)
4. After enabling, scroll down and click **App passwords**
5. Click **Select app** → choose **Mail**
6. Click **Select device** → choose **Windows Computer**
7. Click **Generate**
8. Google will show you a **16-character password** like: `xxxx xxxx xxxx xxxx`
9. Copy it (without spaces)

---

## Step 2: Add the App Password to app.py

Open `.env` (create the file if it doesn't exist) and set your App Password:

```env
SENDER_PASSWORD="YOUR_APP_PASSWORD_HERE"
```

Then in `app.py` this will be loaded automatically via `dotenv`.

Replace `YOUR_APP_PASSWORD_HERE` with your 16-character App Password.

**Example:**
```python
SENDER_PASSWORD = "abcdabcdabcdabcd"
```

---

## Step 3: Run the Backend Server

Open a terminal in `D:\python project 1\` and run:

```bash
python app.py
```

You should see:
```
==================================================
  ✦ ELEGANCE DRESS STORE — Backend Server
==================================================
  🌐 Open: http://localhost:5000
  📧 Email: april86shop@gmail.com
==================================================
```

---

## Step 4: Open the Website

With the server running, open: **http://localhost:5000**

> ⚠️ Do NOT open `index.html` directly as a file anymore.  
> Always use `http://localhost:5000` so the email API works.

---

## How It Works

```
Customer clicks "Place Order"
        ↓
Browser sends order data to http://localhost:5000/send-order-email
        ↓
Flask server receives the order details
        ↓
Python sends a beautiful HTML email via Gmail SMTP
        ↓
Email arrives in april86shop@gmail.com inbox 📬
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Authentication failed" | Check your App Password is correct in app.py |
| "Connection refused" | Make sure `python app.py` is running |
| "Less secure app" error | Use App Password, NOT your Gmail password |
| Email goes to spam | Add the sender to your contacts |
