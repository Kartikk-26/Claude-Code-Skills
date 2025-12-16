from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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


@app.route('/', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/api/chat', methods=['GET', 'POST', 'OPTIONS'])
def chat():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        return response

    # Health check for GET
    if request.method == 'GET':
        return jsonify({"status": "ok", "message": "Raju's API is running!"})

    try:
        # Initialize Groq client inside try block
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            return jsonify({"error": "GROQ_API_KEY not configured", "response": "Arre baba! Server not configured properly!"}), 500

        client = Groq(api_key=api_key)

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received", "response": "Arre baba! Send me a message!"}), 400

        user_message = data.get('message', '')
        if not user_message:
            return jsonify({"error": "No message provided", "response": "Arre baba! What do you want to say?"}), 400

        # Generate response using Groq
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": RAJU_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.8,
            max_tokens=150,
        )

        assistant_response = completion.choices[0].message.content

        return jsonify({
            "response": assistant_response,
            "session_id": "vercel-session"
        })

    except Exception as e:
        return jsonify({"error": str(e), "response": "Arre baba! Something went wrong!"}), 500
