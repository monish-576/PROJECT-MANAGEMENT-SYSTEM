import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { authAPI } from '../../../services/api';
import { useUser } from '../../../context/UserContext';

const RegisterForm = ({ onSuccess }) => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await authAPI.register(
        formData.username.trim(),
        formData.email.trim(),
        formData.password,
        formData.fullName.trim()
      );
      setSuccessMsg('Account created successfully! Logging you in...');
      login(response.user, response.token);
      setTimeout(() => {
        onSuccess();
      }, 600);
    } catch (error) {
      const msg = error.response?.data?.msg || error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center space-x-2">
          <Icon name="AlertCircle" size={18} className="text-red-500 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center space-x-2">
          <Icon name="CheckCircle2" size={18} className="text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon name="User" size={16} />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Jane Doe"
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${errors.fullName ? 'border-red-400' : 'border-slate-300'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon name="AtSign" size={16} />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="janedoe"
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${errors.username ? 'border-red-400' : 'border-slate-300'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="Mail" size={16} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@company.com"
            className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-300'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon name="Lock" size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Min. 6 chars"
              className={`w-full pl-9 pr-9 py-2 bg-slate-50 border ${errors.password ? 'border-red-400' : 'border-slate-300'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon name="Lock" size={16} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter password"
              className={`w-full pl-9 pr-9 py-2 bg-slate-50 border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-300'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <Icon name="ArrowRight" size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
