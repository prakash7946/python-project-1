"""
==========================================
  ELEGANCE DRESS STORE — FLASK BACKEND
  WhatsApp notification server (CallMeBot)
==========================================
  Setup:
  1. pip install flask flask-cors
  2. Set your CallMeBot API key below
  3. Run: python app.py
  4. Open: http://localhost:5000
==========================================
"""

from flask import Flask, request, jsonify, send_from_directory
import urllib.parse
import urllib.request
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)  # Allow cross-origin requests from the frontend

# ==================== SERVE FRONTEND ====================
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)


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

        # Build item lines with image links
        base_url = request.host_url.rstrip('/')
        item_parts = []
        for item in items:
            img_path = item.get('image', '').lstrip('/')
            img_url  = f"{base_url}/{img_path}" if img_path else ''
            line = (
                f"  • {item['name']} (Size: {item['size']}) x{item['qty']} "
                f"= Rs.{item['price'] * item['qty']:,}"
            )
            if img_url:
                line += f"\n    📷 Image: {img_url}"
            item_parts.append(line)
        item_lines = "\n".join(item_parts)

        shipping_display = "FREE" if shipping == 0 else f"Rs.{shipping:,}"

        message = (
            f"NEW ORDER - april-86\n"
            f"------------------------\n"
            f"Order ID: {order_id}\n"
            f"Date: {order_date}\n\n"
            f"CUSTOMER:\n"
            f"Name: {customer.get('name', '')}\n"
            f"Phone: {customer.get('phone', '')}\n"
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
            
        if CALLMEBOT_APIKEY == "1234567":
            print("\n" + "="*55)
            print("  📲 WHATSAPP NOT CONFIGURED (Dummy Key) — Simulating send...")
            print("="*55 + "\n")
            return jsonify({'success': True, 'message': 'WhatsApp message sent directly to owner! (Simulated)'})

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
    print("  📲 WhatsApp: " + OWNER_WHATSAPP)
    print("=" * 50)
    app.run(debug=True, port=5000)
