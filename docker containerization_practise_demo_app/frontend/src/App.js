import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [health, setHealth] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchHealth();
    fetchItems();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/health`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/items`);
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      setNewItem({ name: '', description: '' });
      fetchItems();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MyApp - Docker Demo</h1>
        <p>React Frontend + FastAPI Backend</p>
      </header>

      <main>
        <section className="health-status">
          <h2>Backend Status</h2>
          {health ? (
            <p className="status-healthy">Status: {health.status}</p>
          ) : (
            <p className="status-error">Backend not connected</p>
          )}
        </section>

        <section className="items-section">
          <h2>Items</h2>
          <form onSubmit={addItem}>
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <button type="submit">Add Item</button>
          </form>

          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong>: {item.description || 'No description'}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
