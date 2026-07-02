import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  const Component = hoverEffect ? motion.div : 'div';
  const motionProps = hoverEffect ? { whileHover: { y: -4 }, transition: { duration: 0.2 } } : {};

  return (
    <Component
      ref={ref}
      className={twMerge(
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
});
Card.displayName = 'Card';

const CardHeader = ({ className, children, ...props }) => (
  <div className={twMerge('px-6 py-4 border-b border-slate-100 dark:border-slate-800', className)} {...props}>
    {children}
  </div>
);
CardHeader.displayName = 'CardHeader';

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={twMerge('text-lg font-bold text-slate-900 dark:text-white', className)} {...props}>
    {children}
  </h3>
);
CardTitle.displayName = 'CardTitle';

const CardContent = ({ className, children, ...props }) => (
  <div className={twMerge('p-6', className)} {...props}>
    {children}
  </div>
);
CardContent.displayName = 'CardContent';

const CardFooter = ({ className, children, ...props }) => (
  <div className={twMerge('px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800', className)} {...props}>
    {children}
  </div>
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
