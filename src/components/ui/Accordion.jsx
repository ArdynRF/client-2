// components/ui/Accordion.jsx
"use client";

const Accordion = ({ title, children, isOpened, type, handleAccordion }) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => handleAccordion(type)}
        className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpened ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpened ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3">{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
