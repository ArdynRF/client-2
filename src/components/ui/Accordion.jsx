import { ChevronDownIcon } from "../icons";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const Accordion = ({ title, type, children, isOpened, handleAccordion }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpened ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpened]);

  return (
    <div className="space-y-2 border-b border-b-gray-300 pb-3">
      <div className="accordion-button" onClick={() => handleAccordion(type)}>
        <span>{title}</span>
        <ChevronDownIcon
          className={cn(
            "transition-transform duration-300",
            isOpened && "rotate-180"
          )}
        />
      </div>
      <div
        ref={contentRef}
        style={{ maxHeight: height }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
