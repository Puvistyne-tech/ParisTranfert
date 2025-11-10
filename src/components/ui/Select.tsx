"use client";

import { useState, useRef, useEffect, forwardRef, useId } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    options, 
    placeholder = "Select an option...", 
    value = "",
    onChange,
    id,
    required,
    disabled,
    readOnly,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const selectId = id || generatedId;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen]);

    // Close dropdown on escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isOpen]);

    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;
    const hasValue = Boolean(value && selectedOption);

    const handleSelect = (optionValue: string) => {
      if (disabled || readOnly) return;
      
      if (onChange) {
        onChange({ target: { value: optionValue } });
      }
      setIsOpen(false);
    };

    return (
      <div className={cn("w-full", className)} ref={dropdownRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative" ref={ref}>
          <button
            type="button"
            id={selectId}
            onClick={() => {
              if (!disabled && !readOnly) {
                setIsOpen(!isOpen);
              }
            }}
            disabled={disabled || readOnly}
            className={cn(
              "w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 text-left flex items-center justify-between",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              error
                ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 hover:border-gray-300 dark:hover:border-gray-500",
              disabled || readOnly
                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-700 dark:text-gray-400"
                : "bg-white dark:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-required={required}
            {...props}
          >
            <span className={cn(
              "truncate",
              hasValue ? "!text-gray-900 dark:!text-gray-100" : "!text-gray-500 dark:!text-gray-400"
            )}>
              {displayValue}
            </span>
            {!disabled && !readOnly && (
              <span className="ml-2 flex-shrink-0">
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </span>
            )}
          </button>

          {isOpen && !disabled && !readOnly && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="py-1" role="listbox">
                    {options.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{placeholder}</div>
                    ) : (
                  options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      role="option"
                      aria-selected={value === option.value}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition-colors text-gray-900 dark:text-gray-100",
                        "hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none",
                        value === option.value && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      )}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
