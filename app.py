"""
==========================================
  ELEGANCE DRESS STORE — FLASK BACKEND
  Email notification server using Gmail SMTP
==========================================
  Setup:
  1. pip install flask flask-cors
  2. Set your Gmail App Password below
  3. Run: python app.py
  4. Open: http://localhost:5000
==========================================
"""

from flask import Flask, request, jsonify, send_from_directory
import urllib.parse
import urllib.request
from flask_cors import CORS
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)  # Allow cross-origin requests from the frontend

# ==================== EMAIL CONFIG ====================
# Using Gmail SMTP — Update these with your Gmail credentials
SENDER_EMAIL    = "april86shop@gmail.com"           # Your Gmail address
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD", "YOUR_APP_PASSWORD_HERE") # Gmail App Password
RECEIVER_EMAIL  = "april86shop@gmail.com"           # Where order emails go

# ==================== SERVE FRONTEND ====================
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# ==================== SEND EMAIL API ====================
@app.route('/send-order-email', methods=['POST'])
def send_order_email():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data received'}), 400

        order_id    = data.get('orderId', 'N/A')
        customer    = data.get('customer', {})
        items       = data.get('items', [])
        subtotal    = data.get('subtotal', 0)
        shipping    = data.get('shipping', 0)
        total       = data.get('total', 0)
        order_date  = data.get('date', datetime.now().strftime('%d/%m/%Y %I:%M %p'))

        # ---- Build HTML email ----
        items_html = ""
        items_text = ""
        for item in items:
            item_total = item['price'] * item['qty']
            items_html += f"""
            <tr>
              <td style="padding:10px 12px; border-bottom:1px solid #f0e0e8;">{item['name']}</td>
              <td style="padding:10px 12px; border-bottom:1px solid #f0e0e8; text-align:center;">{item['size']}</td>
              <td style="padding:10px 12px; border-bottom:1px solid #f0e0e8; text-align:center;">{item['qty']}</td>
              <td style="padding:10px 12px; border-bottom:1px solid #f0e0e8; text-align:right; color:#c9547a; font-weight:600;">₹{item_total:,}</td>
            </tr>"""
            items_text += f"  • {item['name']} (Size: {item['size']}) × {item['qty']} = ₹{item_total:,}\n"

        shipping_display = "FREE 🎉" if shipping == 0 else f"₹{shipping:,}"

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f5f0f8; font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:620px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 30px rgba(0,0,0,0.12);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#c9547a,#a83d62); padding:36px 40px; text-align:center;">
      <div style="font-size:28px; font-weight:800; color:#fff; letter-spacing:-0.5px;">✦ april-86</div>
      <div style="color:rgba(255,255,255,0.85); font-size:14px; margin-top:6px; letter-spacing:1px;">PREMIUM DRESS COLLECTION</div>
    </div>

    <!-- Success Banner -->
    <div style="background:#f0faf4; border-bottom:3px solid #2ed573; padding:20px 40px; text-align:center;">
      <div style="font-size:36px; margin-bottom:6px;">✅</div>
      <h1 style="margin:0; font-size:22px; color:#1a1a2e;">Order Placed Successfully!</h1>
      <p style="margin:8px 0 0; color:#6b6b8a; font-size:14px;">Thank you for shopping with april-86</p>
    </div>

    <!-- Body Content -->
    <div style="padding:32px 40px;">

      <!-- Order ID -->
      <div style="background:#fdf3f7; border:1px solid #f0d0de; border-radius:10px; padding:16px 20px; margin-bottom:28px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; color:#6b6b8a; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Order ID</span>
        <span style="font-size:16px; font-weight:800; color:#c9547a;">{order_id}</span>
      </div>

      <!-- Customer Details -->
      <h2 style="font-size:15px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 14px; border-bottom:2px solid #f0e0e8; padding-bottom:10px;">
        📦 Delivery Details
      </h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:14px;">
        <tr><td style="padding:7px 0; color:#6b6b8a; width:40%;">👤 Name</td><td style="padding:7px 0; font-weight:600; color:#1a1a2e;">{customer.get('name','')}</td></tr>
        <tr><td style="padding:7px 0; color:#6b6b8a;">📞 Phone</td><td style="padding:7px 0; font-weight:600; color:#1a1a2e;">{customer.get('phone','')}</td></tr>
        <tr><td style="padding:7px 0; color:#6b6b8a;">📧 Email</td><td style="padding:7px 0; font-weight:600; color:#1a1a2e;">{customer.get('email','')}</td></tr>
        <tr><td style="padding:7px 0; color:#6b6b8a;">📍 Address</td><td style="padding:7px 0; font-weight:600; color:#1a1a2e;">{customer.get('address','')}, {customer.get('city','')}&nbsp;–&nbsp;{customer.get('pin','')}</td></tr>
        <tr><td style="padding:7px 0; color:#6b6b8a;">📅 Date</td><td style="padding:7px 0; font-weight:600; color:#1a1a2e;">{order_date}</td></tr>
      </table>

      <!-- Items -->
      <h2 style="font-size:15px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.8px; margin:0 0 14px; border-bottom:2px solid #f0e0e8; padding-bottom:10px;">
        🛍️ Items Ordered
      </h2>
      <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:20px;">
        <thead>
          <tr style="background:#fdf3f7;">
            <th style="padding:10px 12px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#6b6b8a;">Product</th>
            <th style="padding:10px 12px; text-align:center; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#6b6b8a;">Size</th>
            <th style="padding:10px 12px; text-align:center; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#6b6b8a;">Qty</th>
            <th style="padding:10px 12px; text-align:right; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#6b6b8a;">Amount</th>
          </tr>
        </thead>
        <tbody>{items_html}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#fdf3f7; border-radius:10px; padding:16px 20px; margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; font-size:14px; color:#6b6b8a; padding:5px 0;">
          <span>Subtotal</span><span>₹{subtotal:,}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px; color:#6b6b8a; padding:5px 0;">
          <span>Shipping</span><span style="color:#2ed573; font-weight:600;">{shipping_display}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:17px; font-weight:800; color:#1a1a2e; padding:10px 0 0; border-top:1px solid #e8d0de; margin-top:8px;">
          <span>Grand Total</span><span style="color:#c9547a;">₹{total:,}</span>
        </div>
      </div>

      <!-- Payment -->
      <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <div style="font-size:13px; text-transform:uppercase; letter-spacing:0.5px; color:#856404; font-weight:700; margin-bottom:12px; text-align:center;">💳 Payment Instructions</div>

        <!-- Step 1 -->
        <div style="display:flex; align-items:flex-start; margin-bottom:14px;">
          <div style="background:#ffc107; color:#fff; font-weight:800; border-radius:50%; width:26px; height:26px; min-width:26px; display:flex; align-items:center; justify-content:center; font-size:13px; margin-right:12px;">1</div>
          <div>
            <div style="font-size:14px; font-weight:700; color:#533f03; margin-bottom:2px;">Send Payment</div>
            <div style="font-size:13px; color:#856404;">Pay <strong>₹{total:,}</strong> via <strong>GPay / PhonePe / Paytm</strong> to:</div>
            <div style="font-size:22px; font-weight:800; color:#c9547a; margin:4px 0;">📱 9344709406</div>
            <div style="font-size:12px; color:#856404;">Name: <strong>April-86 Shop</strong></div>
          </div>
        </div>

        <!-- Step 2 -->
        <div style="display:flex; align-items:flex-start;">
          <div style="background:#ffc107; color:#fff; font-weight:800; border-radius:50%; width:26px; height:26px; min-width:26px; display:flex; align-items:center; justify-content:center; font-size:13px; margin-right:12px;">2</div>
          <div>
            <div style="font-size:14px; font-weight:700; color:#533f03; margin-bottom:2px;">Send Payment Screenshot to Owner</div>
            <div style="font-size:13px; color:#856404;">After payment, send the screenshot to confirm your order:</div>
            <div style="margin-top:6px; font-size:13px; color:#533f03;">
              📲 <strong>WhatsApp:</strong> 9344709406<br>
              📧 <strong>Email:</strong> april86shop@gmail.com
            </div>
            <div style="margin-top:6px; font-size:12px; color:#856404; font-style:italic;">⚠️ Your order will be confirmed only after payment screenshot is received.</div>
          </div>
        </div>
      </div>

      <!-- Delivery Note -->
      <div style="background:#e8f5e9; border-radius:10px; padding:14px 20px; text-align:center; color:#2e7d32; font-size:13px; margin-bottom:8px;">
        🚚 Your order will be delivered within <strong>3–5 business days</strong>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0f0a18; padding:24px 40px; text-align:center;">
      <div style="font-size:18px; font-weight:800; color:#c9547a; margin-bottom:8px;">✦ april-86</div>
      <div style="font-size:12px; color:rgba(255,255,255,0.4); line-height:1.6;">
        Premium Dress Collection | Chennai, Tamil Nadu, India<br>
        📞 9344709406 | 📧 april86shop@gmail.com
      </div>
      <div style="font-size:11px; color:rgba(255,255,255,0.25); margin-top:12px;">
        © 2025 april-86. All rights reserved. Made with ❤️ in India.
      </div>
    </div>
  </div>
</body>
</html>
"""

        # ---- Plain text fallback ----
        text_body = f"""
✦ ELEGANCE DRESS STORE — ORDER CONFIRMATION ✦
==============================================

ORDER PLACED SUCCESSFULLY! ✅
Order ID: {order_id}
Date: {order_date}

DELIVERY DETAILS:
-----------------
Name:    {customer.get('name','')}
Phone:   {customer.get('phone','')}
Email:   {customer.get('email','')}
Address: {customer.get('address','')}, {customer.get('city','')} - {customer.get('pin','')}

ITEMS ORDERED:
--------------
{items_text}

Subtotal:  ₹{subtotal:,}
Shipping:  {shipping_display}
TOTAL:     ₹{total:,}

💳 PAYMENT INSTRUCTIONS:
-------------------------
STEP 1 — Send Payment:
  Pay ₹{total:,} via GPay / PhonePe / Paytm to:
  📱 9344709406  (Name: April-86 Shop)

STEP 2 — Send Payment Screenshot to Owner:
  After payment, send the screenshot to confirm your order:
  📲 WhatsApp : 9344709406
  📧 Email    : april86shop@gmail.com

⚠️  Your order will be confirmed only after payment screenshot is received.

Your order will be delivered within 3-5 business days.

Thank you for shopping with april-86! 🎉
Team april-86 | april86shop@gmail.com
"""

        # ---- Send via Gmail SMTP ----
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"✦ Order Confirmed! #{order_id} — april-86 Dress Store"
        msg['From']    = f"april-86 Dress Store <{SENDER_EMAIL}>"
        msg['To']      = RECEIVER_EMAIL

        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        # Send confirmation email to customer
        customer_email = customer.get('email', '')

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            # Send to store owner
            server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
            # Always send confirmation to customer if they provided an email
            if customer_email:
                customer_msg = MIMEMultipart('alternative')
                customer_msg['Subject'] = f"✦ Your Order #{order_id} is Confirmed! — april-86"
                customer_msg['From']    = f"april-86 Dress Store <{SENDER_EMAIL}>"
                customer_msg['To']      = customer_email
                customer_msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
                customer_msg.attach(MIMEText(html_body, 'html', 'utf-8'))
                server.sendmail(SENDER_EMAIL, customer_email, customer_msg.as_string())
                print(f"📧 Confirmation email sent to customer: {customer_email}")

        print(f"✅ Order email sent! Order ID: {order_id} | Customer: {customer.get('name','')}")
        return jsonify({'success': True, 'message': 'Email sent successfully!'})

    except smtplib.SMTPAuthenticationError:
        print("❌ Gmail authentication failed. Check your App Password.")
        return jsonify({'success': False, 'error': 'Email authentication failed. Check your Gmail App Password.'}), 500
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== WHATSAPP CONFIG ====================
# Uses CallMeBot FREE WhatsApp API to send messages DIRECTLY to the owner.
# One-time activation (do this once from the owner's phone):
#   1. Save this number in WhatsApp contacts: +34 644 59 78 11  (Name: CallMeBot)
#   2. Send this exact message to CallMeBot on WhatsApp:
#      "I allow callmebot to send me messages"
#   3. You will receive an API key. Paste it below.
#   4. Restart app.py
OWNER_WHATSAPP   = "919344709406"           # Owner's WhatsApp with country code (91=India)
CALLMEBOT_APIKEY = "1234567"  # CallMeBot API key


# ==================== WHATSAPP STATUS API ====================
@app.route('/whatsapp-status', methods=['GET'])
def whatsapp_status():
    configured = CALLMEBOT_APIKEY != "YOUR_CALLMEBOT_APIKEY"
    return jsonify({'configured': configured})


# ==================== SEND WHATSAPP API ====================
@app.route('/send-whatsapp', methods=['POST'])
def send_whatsapp():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data received'}), 400

        order_id   = data.get('orderId', 'N/A')
        customer   = data.get('customer', {})
        items      = data.get('items', [])
        subtotal   = data.get('subtotal', 0)
        shipping   = data.get('shipping', 0)
        total      = data.get('total', 0)
        order_date = data.get('date', datetime.now().strftime('%d/%m/%Y %I:%M %p'))

        # Build item lines
        item_lines = "\n".join([
            f"  • {item['name']} (Size: {item['size']}) x{item['qty']} = Rs.{item['price'] * item['qty']:,}"
            for item in items
        ])

        shipping_display = "FREE" if shipping == 0 else f"Rs.{shipping:,}"

        message = (
            f"NEW ORDER - april-86\n"
            f"------------------------\n"
            f"Order ID: {order_id}\n"
            f"Date: {order_date}\n\n"
            f"CUSTOMER:\n"
            f"Name: {customer.get('name', '')}\n"
            f"Phone: {customer.get('phone', '')}\n"
            f"Email: {customer.get('email', '')}\n"
            f"Address: {customer.get('address', '')}, {customer.get('city', '')} - {customer.get('pin', '')}\n\n"
            f"ITEMS ORDERED:\n"
            f"{item_lines}\n\n"
            f"------------------------\n"
            f"Subtotal: Rs.{subtotal:,}\n"
            f"Shipping: {shipping_display}\n"
            f"TOTAL: Rs.{total:,}\n\n"
            f"Payment: GPay/PhonePe/Paytm to 9344709406\n"
            f"------------------------"
        )

        # Check if API key is configured
        if CALLMEBOT_APIKEY == "YOUR_CALLMEBOT_APIKEY":
            print("\n" + "="*55)
            print("  📲 WHATSAPP NOT CONFIGURED — Do this ONCE to activate:")
            print("  1. Save +34 644 59 78 11 in WhatsApp as 'CallMeBot'")
            print("  2. Send: I allow callmebot to send me messages")
            print("  3. Paste the API key you receive into app.py")
            print("     CALLMEBOT_APIKEY = \"your_key_here\"")
            print("  4. Restart app.py")
            print("="*55 + "\n")
            return jsonify({'success': False, 'error': 'CallMeBot not configured. See server console for setup steps.'})

        # Send directly via CallMeBot API
        encoded_msg = urllib.parse.quote(message)
        callmebot_url = (
            f"https://api.callmebot.com/whatsapp.php"
            f"?phone={OWNER_WHATSAPP}"
            f"&text={encoded_msg}"
            f"&apikey={CALLMEBOT_APIKEY}"
        )
        req = urllib.request.Request(callmebot_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp_text = resp.read().decode('utf-8')
            print(f"CallMeBot response: {resp_text[:120]}")

        print(f"\n✅ WhatsApp sent directly to {OWNER_WHATSAPP} | Order: {order_id}")
        return jsonify({'success': True, 'message': 'WhatsApp message sent directly to owner!'})

    except urllib.error.URLError as e:
        print(f"❌ WhatsApp network error: {e.reason}")
        return jsonify({'success': False, 'error': f'Network error: {e.reason}'}), 500
    except Exception as e:
        print(f"❌ WhatsApp error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== RUN SERVER ====================
if __name__ == '__main__':
    print("=" * 50)
    print("  ✦ ELEGANCE DRESS STORE — Backend Server")
    print("=" * 50)
    print("  🌐 Open: http://localhost:5000")
    print("  📧 Email: " + RECEIVER_EMAIL)
    print("=" * 50)
    app.run(debug=True, port=5000)
