import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavigationButtonProps {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  role?: string;
  currentUserRole?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  id,
  icon: Icon,
  label,
  isActive,
  onClick,
  role,
  currentUserRole
}) => {
  // Hide admin buttons for non-admin users
  if (role === 'ADMIN' && currentUserRole !== 'ADMIN') {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`
        group/btn relative w-full flex flex-col items-center justify-center
        bg-gray-50 hover:bg-orange-50 border-2 border-gray-100 hover:border-primary/40
        rounded-xl py-2 px-1 transition-all duration-200
        ${isActive
          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
          : 'text-gray-600 hover:text-primary'
        }
        md:flex-row md:gap-4 md:px-5 md:py-4 md:rounded-2xl
        active:scale-95
      `}
    >
      {/* Icon */}
      <Icon
        size={24}
        className={`
          transition-all duration-200
          ${isActive
            ? 'text-white'
            : 'text-gray-500 group-hover/btn:text-primary'
          }
          md:group-hover/btn:scale-110
        `}
      />

      {/* Label - Hidden on mobile, visible on desktop */}
      <span className={`
        text-xs font-bold uppercase tracking-tight mt-1
        ${isActive ? 'text-white' : 'text-gray-500 group-hover/btn:text-primary'}
        md:text-base md:mt-0 md:block
      `}>
        {label}
      </span>

      {/* Active indicator for mobile */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full md:hidden" />
      )}

      {/* Hover effect for desktop */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200
        ${isActive ? 'bg-white/10' : 'bg-primary/5'}
        md:rounded-2xl
      `} />
    </button>
  );
};

export default NavigationButton;