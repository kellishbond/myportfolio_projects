import React from 'react';
import PropTypes from 'prop-types';

function CostSummary({ subscriptions }) {
  const calculateTotals = () => {
    let totalMonthly = 0;
    let totalYearly = 0;

    subscriptions.forEach(sub => {
      const cost = parseFloat(sub.cost);
      if (isNaN(cost)) return;

      switch (sub.billingCycle.toLowerCase()) {
        case 'daily':
          totalMonthly += cost * 30; // Approximation
          totalYearly += cost * 365;
          break;
        case 'weekly':
          totalMonthly += cost * 4; // Approximation
          totalYearly += cost * 52;
          break;
        case 'monthly':
          totalMonthly += cost;
          totalYearly += cost * 12;
          break;
        case 'yearly':
          totalMonthly += cost / 12;
          totalYearly += cost;
          break;
        default:
          console.warn(`Unknown billing cycle: ${sub.billingCycle} for sub: ${sub.name}`);
      }
    });

    return { totalMonthly, totalYearly };
  };

  const { totalMonthly, totalYearly } = calculateTotals();

  return (
    <div className="cost-summary-container">
      <h2>Cost Summary</h2>
      <div className="cost-summary-item">
        <strong>Total Monthly Cost:</strong> ${totalMonthly.toFixed(2)}
      </div>
      <div className="cost-summary-item">
        <strong>Total Yearly Cost:</strong> ${totalYearly.toFixed(2)}
      </div>
    </div>
  );
}

CostSummary.propTypes = {
  subscriptions: PropTypes.arrayOf(PropTypes.shape({
    cost: PropTypes.number.isRequired,
    billingCycle: PropTypes.string.isRequired,
  })).isRequired,
};

export default CostSummary;
