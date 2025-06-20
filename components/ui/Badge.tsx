import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'muted':
        return 'bg-muted text-muted-foreground';
      case 'accent':
        return 'bg-accent text-accent-foreground';
      case 'destructive':
        return 'bg-destructive text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const classes = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;