import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

const INVENTORY = [
  { name: "Brass Lamp", price: 50, icon: "🪔" },
  { name: "Silk Scarf", price: 500, icon: "🧣" },
  { name: "Sandalwood Carving", price: 1000, icon: "🪵" },
  { name: "Taj Mahal Miniature", price: 2000, icon: "🕌" },
  { name: "Marble Elephant", price: 750, icon: "🐘" },
  { name: "Pashmina Shawl", price: 1500, icon: "🧥" },
  { name: "Copper Chai Set", price: 300, icon: "☕" },
  { name: "Wooden Chess Set", price: 800, icon: "♟️" },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        type: 'bot',
        text: "Namaste! Welcome to my shop! Click any item on the left or ask me anything. Best prices guaranteed!"
      }
    ]);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const endpoint = API_URL ? `${API_URL}/chat` : '/api/chat';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      });

      const data = await response.json();
      if (!sessionId) setSessionId(data.session_id);
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "Arre baba! Connection problem. Please try again!"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      type: 'bot',
      text: "Namaste! Welcome back to Raju's Royal Artifacts! What can I show you today?"
    }]);
    setSessionId(null);
  };

  const quickMessage = (msg) => {
    setInput(msg);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="shop-brand">
          <div className="shop-logo">🏪</div>
          <h2>Raju's Royal Artifacts</h2>
          <p>Digital Bazaar</p>
        </div>

        <div className="inventory-section">
          <h3>📦 Inventory</h3>
          <div className="inventory-list">
            {INVENTORY.map((item, i) => (
              <div key={i} className="inventory-item" onClick={() => quickMessage(`How much for ${item.name}?`)}>
                <span className="item-icon">{item.icon}</span>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{item.price} coins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="new-chat-btn" onClick={clearChat}>
            ✨ New Conversation
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="header-info">
            <div className="raju-avatar">
              <span>🧔🏽</span>
            </div>
            <div className="header-text">
              <h1>Chat with Raju</h1>
              <span className="status">● Online - Ready to bargain!</span>
            </div>
          </div>
        </header>

        <div className="messages-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.type}`}>
                {msg.type === 'bot' && (
                  <div className="avatar bot-avatar">🧔🏽</div>
                )}
                <div className={`message-bubble ${msg.type}`}>
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                  <div className="avatar user-avatar">👤</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="avatar bot-avatar">🧔🏽</div>
                <div className="message-bubble bot typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="quick-replies">
          <button onClick={() => quickMessage("What do you have?")}>What do you have?</button>
          <button onClick={() => quickMessage("Give me a discount!")}>Give me discount!</button>
          <button onClick={() => quickMessage("That's too expensive!")}>Too expensive!</button>
        </div>

        <form className="input-area" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to Raju..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <span>Send</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
