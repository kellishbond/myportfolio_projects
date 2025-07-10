import React from 'react';
import PropTypes from 'prop-types';

function AnalyticsDashboard({ subscriptions }) {
  const getMonthlyCost = (cost, billingCycle) => {
    const numericCost = parseFloat(cost);
    if (isNaN(numericCost)) return 0;

    switch (billingCycle.toLowerCase()) {
      case 'daily':
        return numericCost * 30; // Approximation
      case 'weekly':
        return numericCost * 4; // Approximation
      case 'monthly':
        return numericCost;
      case 'yearly':
        return numericCost / 12;
      default:
        return 0;
    }
  };

  const calculateCategorySpending = () => {
    const spending = {}; // { categoryName: totalMonthlyCost }

    subscriptions.forEach(sub => {
      const category = sub.category || 'Uncategorized'; // Default if no category
      const monthlyCost = getMonthlyCost(sub.cost, sub.billingCycle);

      if (spending[category]) {
        spending[category] += monthlyCost;
      } else {
        spending[category] = monthlyCost;
      }
    });

    // Convert to array and sort for consistent display, e.g., by amount
    return Object.entries(spending)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total); // Sort by highest spending first
  };

  const categorySpending = calculateCategorySpending();

  if (subscriptions.length === 0) {
    return (
      <div className="analytics-dashboard-container">
        <h2>Spending Analytics</h2>
        <p>No subscription data available to analyze.</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard-container">
      <h2>Spending Analytics (Monthly)</h2>
      {categorySpending.length === 0 ? (
        <p>No categories assigned or no subscriptions with costs.</p>
      ) : (
        <ul className="category-spending-list">
          {categorySpending.map(cat => (
            <li key={cat.name} className="category-spending-item">
              <span>{cat.name}:</span>
              <span>${cat.total.toFixed(2)} / month</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

AnalyticsDashboard.propTypes = {
  subscriptions: PropTypes.arrayOf(PropTypes.shape({
    cost: PropTypes.number.isRequired,
    billingCycle: PropTypes.string.isRequired,
    category: PropTypes.string,
  })).isRequired,
};

export default AnalyticsDashboard;
