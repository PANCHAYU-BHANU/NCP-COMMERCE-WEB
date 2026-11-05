import React from 'react';

export const Input = React.forwardRef(({ label, icon: Icon, error, className = '', ...props }, ref) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-xl border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'} 
          ${Icon ? 'pl-9 sm:pl-10' : 'pl-3'} pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Select = React.forwardRef(({ label, icon: Icon, options, placeholder, error, className = '', ...props }, ref) => {
  const hasEmptyOption = options?.some(opt => opt.value === '');
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <select
          ref={ref}
          className={`block w-full rounded-xl border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'} 
          ${Icon ? 'pl-9 sm:pl-10' : 'pl-3'} pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer`}
          {...props}
        >
          {!hasEmptyOption && <option value="" disabled>{placeholder || 'Select an option'}</option>}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
