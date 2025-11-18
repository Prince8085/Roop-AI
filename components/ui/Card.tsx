
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, action, ...props }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200 ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-start">
          <div>
            {title && <h3 className="font-heading font-semibold text-neutral dark:text-gray-100 text-lg">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};
