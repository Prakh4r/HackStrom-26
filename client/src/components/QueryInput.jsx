import { useState } from 'react';
import './QueryInput.css';

const examples = [
  'Shipment arriving at Jebel Ali in 3 days — identify risks',
  'Container ship heading to Rotterdam, ETA 5 days via Standard Class',
  'Urgent cargo to Singapore port in 2 days, First Class shipping',
  'Bulk shipment to Mumbai port expected in 7 days',
  'Express delivery to Los Angeles, arriving tomorrow',
];

export default function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSubmit(query.trim());
    }
  };

  const handleExample = (example) => {
    setQuery(example);
    onSubmit(example);
  };

  return (
    <div className="query-input-wrapper">
      <form onSubmit={handleSubmit} className="query-form">
        <div className="input-container">
          <span className="input-icon">🔍</span>
          <input
            id="shipment-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your shipment... e.g., 'Shipment arriving at Jebel Ali in 3 days'"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <span className="spinner" style={{ width: 18, height: 18 }}></span>
            ) : (
              'Analyze Risk'
            )}
          </button>
        </div>
      </form>
      <div className="example-queries">
        <span className="examples-label">Try:</span>
        {examples.map((ex, i) => (
          <button
            key={i}
            className="example-btn"
            onClick={() => handleExample(ex)}
            disabled={loading}
          >
            {ex.length > 50 ? ex.slice(0, 50) + '...' : ex}
          </button>
        ))}
      </div>
    </div>
  );
}
