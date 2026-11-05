import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-xs border border-slate-200/80 p-3.5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ title, description, action, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-6 ${className}`}>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight leading-snug">{title}</h3>
        {description && <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">{description}</p>}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0 mt-1 sm:mt-0">{action}</div>}
    </div>
  );
};
