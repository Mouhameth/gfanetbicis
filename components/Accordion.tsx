import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdTimer } from "react-icons/md";

export const Accordion: React.FC<AccordionProps> = ({
    title,
    children,
    width,
    defaultOpen = false
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`${width} bg-white shadow-md mb-4 max-w-md  rounded-lg `}>
            {/* Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-2 cursor-pointer bg-gr"
            >
                <div className="flex items-center gap-2">
                    <MdTimer />
                    <h3 className="text-md font-semibold text-gray-800">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-gray-300 p-1 rounded-full transition-colors duration-300">
                        {isOpen ? (
                            <FaChevronUp className="h-4 w-4 text-gray-600" />
                        ) : (
                            <FaChevronDown className="h-4 w-4 text-gray-600" />
                        )}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div
                className={`
          overflow-hidden transition-all duration-500 ease-in-out 
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
            >
                <div className="p-5">
                    <div className="mb-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};