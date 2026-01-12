'use client";'
import { cn } from "@/lib/utils";

export default function Button({
  type = "button",
  onClick,
  className,
  children,
  text,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn("custom-btn", className)}
      onClick={onClick}
      {...props}
    >
      {text || children}
    </button>
  );
}
