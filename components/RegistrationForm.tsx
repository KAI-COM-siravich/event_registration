'use client';

import { useState } from 'react';
import { registerCustomer } from '../actions/register';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobPosition: '',
    company: '',
    travelMethod: '',
    needHotel: false,
    plannedUpgrade: '',
    projectByYear: '',
    salesOwner: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerCustomer(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && <p>Registration successful!</p>}
      {error && <p>{error}</p>}

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <input
        type="text"
        name="jobPosition"
        placeholder="Job Position"
        value={formData.jobPosition}
        onChange={handleChange}
      />

      <input
        type="text"
        name="company"
        placeholder="Company Name"
        value={formData.company}
        onChange={handleChange}
      />

      <input
        type="text"
        name="travelMethod"
        placeholder="Travel Method"
        value={formData.travelMethod}
        onChange={handleChange}
      />

      <label>
        Need Hotel:
        <input
          type="checkbox"
          name="needHotel"
          checked={formData.needHotel}
          onChange={handleChange}
        />
      </label>

      <input
        type="text"
        name="plannedUpgrade"
        placeholder="Planned Upgrade"
        value={formData.plannedUpgrade}
        onChange={handleChange}
      />

      <input
        type="text"
        name="projectByYear"
        placeholder="Project By Year"
        value={formData.projectByYear}
        onChange={handleChange}
      />

      <input
        type="text"
        name="salesOwner"
        placeholder="Sales Owner"
        value={formData.salesOwner}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
};

export default RegistrationForm;