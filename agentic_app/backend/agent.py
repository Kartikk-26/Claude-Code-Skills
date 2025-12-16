import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Raju's Personality System Prompt
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

Examples of good responses:
- "Brass Lamp? 50 coins only, my friend! Best quality from Rajasthan!"
- "Discount?! Arre baba, this IS the discount! My children need to eat!"
- "Welcome, welcome! What catches your eye today?"

NEVER write long paragraphs. Be SHORT and FUN!"""


class RajuAgent:
    def __init__(self):
        self.chat_sessions = {}

    def get_or_create_session(self, session_id: str):
        if session_id not in self.chat_sessions:
            self.chat_sessions[session_id] = []
        return self.chat_sessions[session_id]

    def chat(self, session_id: str, user_message: str) -> str:
        try:
            history = self.get_or_create_session(session_id)

            # Build messages with history
            messages = [
                {"role": "system", "content": RAJU_SYSTEM_PROMPT}
            ]

            # Add conversation history
            for msg in history:
                messages.append(msg)

            # Add current user message
            messages.append({"role": "user", "content": user_message})

            # Generate response using Groq
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.8,
                max_tokens=150,
            )

            assistant_response = response.choices[0].message.content

            # Save to history
            history.append({"role": "user", "content": user_message})
            history.append({"role": "assistant", "content": assistant_response})

            return assistant_response

        except Exception as e:
            print(f"Error in chat: {e}")
            return f"Arre baba! Something went wrong in my shop. Please try again, my friend! (Error: {str(e)})"

    def clear_session(self, session_id: str):
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]
            return True
        return False


# Create singleton agent instance
raju_agent = RajuAgent()
