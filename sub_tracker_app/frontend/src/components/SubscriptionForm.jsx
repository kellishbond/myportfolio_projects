import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const initialFormState = {
  name: '',
  cost: '',
  billingCycle: 'monthly', // Default value
  nextRenewalDate: '',
  category: '',
};

function SubscriptionForm({ onSave, onCancel, existingSubscription }) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (existingSubscription) {
      setFormData({
        name: existingSubscription.name || '',
        cost: existingSubscription.cost || '',
        billingCycle: existingSubscription.billingCycle || 'monthly',
        // Ensure date is in YYYY-MM-DD for the input field
        nextRenewalDate: existingSubscription.nextRenewalDate ? existingSubscription.nextRenewalDate.split('T')[0] : '',
        category: existingSubscription.category || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [existingSubscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.cost === '' || !formData.billingCycle || !formData.nextRenewalDate) {
        alert('Please fill in all required fields: Name, Cost, Billing Cycle, and Next Renewal Date.');
        return;
    }
    const costAsNumber = parseFloat(formData.cost);
    if (isNaN(costAsNumber) || costAsNumber < 0) {
        alert('Please enter a valid positive number for cost.');
        return;
    }

    onSave({ ...existingSubscription, ...formData, cost: costAsNumber });
    setFormData(initialFormState); // Reset form
  };

  return (
    <div className="subscription-form-container">
      <h2>{existingSubscription ? 'Edit Subscription' : 'Add New Subscription'}</h2>
      <form onSubmit={handleSubmit} className="subscription-form">
        <div className="form-group">
          <label htmlFor="name">Subscription Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cost">Cost:</label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="billingCycle">Billing Cycle:</label>
          <select
            id="billingCycle"
            name="billingCycle"
            value={formData.billingCycle}
            onChange={handleChange}
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="nextRenewalDate">Next Renewal Date:</label>
          <input
            type="date"
            id="nextRenewalDate"
            name="nextRenewalDate"
            value={formData.nextRenewalDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category (Optional):</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {existingSubscription ? 'Save Changes' : 'Add Subscription'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

SubscriptionForm.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  existingSubscription: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    cost: PropTypes.number,
    billingCycle: PropTypes.string,
    nextRenewalDate: PropTypes.string,
    category: PropTypes.string,
  }),
};

export default SubscriptionForm;
