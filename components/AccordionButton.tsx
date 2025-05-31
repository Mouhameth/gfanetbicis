interface AccordionProps {
  title: string;
  width: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}

const AccordionButton: React.FC<AccordionButtonProps> = ({ 
  label, 
  icon, 
  onClick, 
  primary = false 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium 
        transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${primary 
          ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500" 
          : "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

