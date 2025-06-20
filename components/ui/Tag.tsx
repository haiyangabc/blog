import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
  onRemove?: () => void;
  removable?: boolean;
}

const Tag: React.FC<TagProps> = ({ children, variant = 'primary', onRemove, removable = false }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'secondary':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'muted':
        return 'bg-muted/10 text-muted border border-muted/20';
      case 'accent':
        return 'bg-accent/10 text-accent border border-accent/20';
      case 'destructive':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border border-primary/20';
    }
  };

  const classes = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all ${getVariantClasses()}`;

  return (
    <span className={classes}>
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1.5 text-xs hover:text-gray-700 transition-colors"
        >
          <i className="fa fa-times-circle" />
        </button>
      )}
    </span>
  );
};

export default Tag;