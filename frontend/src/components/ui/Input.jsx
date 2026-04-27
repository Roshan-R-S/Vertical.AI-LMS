import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  wrapperClassName = '',
  ...props 
}) => {
  return (
    <div className={`form-group ${wrapperClassName}`.trim()}>
      {label && <label className="form-label">{label}</label>}
      <input 
        className={`form-input ${className} ${error ? 'border-danger' : ''}`.trim()} 
        {...props} 
      />
      {error && <span className="text-danger" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default Input;
