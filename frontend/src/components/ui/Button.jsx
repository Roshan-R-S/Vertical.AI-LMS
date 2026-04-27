import React from 'react';

/**
 * Reusable Button component following the design system.
 * 
 * @param {Object} props
 * @param {('primary'|'secondary'|'ghost')} props.variant - The visual style of the button.
 * @param {('sm'|'md'|'lg')} props.size - The size of the button.
 * @param {boolean} props.iconOnly - If true, the button is styled as an icon-only button.
 * @param {boolean} props.fullWidth - If true, the button takes up the full width of its container.
 * @param {React.ReactNode} props.children - The button content.
 * @param {React.ReactNode} props.icon - An optional icon to display.
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  iconOnly = false, 
  fullWidth = false,
  className = '', 
  children, 
  icon,
  ...props 
}) => {
  const baseClass = iconOnly ? 'btn-icon' : 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()} 
      {...props}
    >
      {icon && <span className="btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
