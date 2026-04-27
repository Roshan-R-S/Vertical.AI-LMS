import React from 'react';

const Badge = ({ 
  variant = 'neutral', 
  children, 
  icon,
  className = '',
  ...props 
}) => {
  const variantClass = `badge-${variant}`;
  
  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
      {icon && <span className="badge-icon-wrapper" style={{ marginRight: '4px', display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
