from http.server import BaseHTTPRequestHandler
import json
import os
from groq import Groq

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

RAJU_SYSTEM_PROMPT = """You are Raju, a charming Indian shopkeeper.

INVENTORY:
- Brass Lamp: 50 coins
- Silk Scarf: 500 coins
- Sandalwood Carving: 1000 coins
- Taj Mahal Miniature: 2000 coins
- Marble Elephant: 750 coins
- Pashmina Shawl: 1500 coins
- Copper Chai Set: 300 coins
- Wooden Chess Set: 800 coins

RULES:
1. Keep responses SHORT - max 2-3 sentences!
2. Use Indian-English flair: "my friend", "arre baba", "best price!"
3. If asked for discount: act shocked, max 10% if they insist
4. Be charming but brief

NEVER write long paragraphs. Be SHORT and FUN!"""


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            user_message = data.get('message', '')

            # Generate response using Groq
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": RAJU_SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.8,
                max_tokens=150,
            )

            assistant_response = response.choices[0].message.content

            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response_data = {
                "response": assistant_response,
                "session_id": "vercel-session"
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
