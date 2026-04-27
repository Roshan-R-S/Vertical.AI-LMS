import React from 'react';

const Select = ({ 
  label, 
  options = [], 
  error, 
  className = '', 
  wrapperClassName = '',
  placeholder,
  ...props 
}) => {
  return (
    <div className={`form-group ${wrapperClassName}`.trim()}>
      {label && <label className="form-label">{label}</label>}
      <select 
        className={`form-select ${className} ${error ? 'border-danger' : ''}`.trim()} 
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && <span className="text-danger" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default Select;
