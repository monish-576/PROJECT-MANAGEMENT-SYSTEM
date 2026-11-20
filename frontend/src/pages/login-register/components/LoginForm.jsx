import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { authAPI } from '../../../services/api';
import { useUser } from '../../../context/UserContext';

const LoginForm = ({ onSuccess }) => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await authAPI.login(formData.email.trim(), formData.password);
      setSuccessMsg('Login successful! Redirecting...');
      login(response.user, response.token);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      const msg = error.response?.data?.msg || error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="Mail" size={18} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@company.com"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-slate-700">Password</label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="Lock" size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'} rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <span className="text-slate-600 text-xs sm:text-sm">Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <Icon name="ArrowRight" size={16} />
          </>
        )}
      </button>

      <div className="pt-2 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Demo Account: <span className="font-mono text-slate-700">user@example.com</span>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
