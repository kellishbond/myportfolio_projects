import React from 'react';
import PropTypes from 'prop-types';

// Helper to format date string to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return 'Invalid Date';
  }
};

function SubscriptionList({ subscriptions, onEdit, onDelete }) {
  if (!subscriptions || subscriptions.length === 0) {
    return <p className="no-subscriptions">No subscriptions yet. Add one to get started!</p>;
  }

  return (
    <div className="subscription-list-container">
      <h2>Your Subscriptions</h2>
      <ul className="subscription-list">
        {subscriptions.map((sub) => (
          <li key={sub.id} className="subscription-item">
            <div className="subscription-details">
              <h3>{sub.name}</h3>
              <p><strong>Cost:</strong> ${sub.cost.toFixed(2)} / {sub.billingCycle}</p>
              <p><strong>Next Renewal:</strong> {formatDate(sub.nextRenewalDate)}</p>
              {sub.category && <p><strong>Category:</strong> {sub.category}</p>}
            </div>
            <div className="subscription-actions">
              <button onClick={() => onEdit(sub)} className="btn btn-secondary">Edit</button>
              <button onClick={() => onDelete(sub.id)} className="btn btn-danger">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

SubscriptionList.propTypes = {
  subscriptions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    cost: PropTypes.number.isRequired,
    billingCycle: PropTypes.string.isRequired,
    nextRenewalDate: PropTypes.string.isRequired,
    category: PropTypes.string,
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SubscriptionList;
