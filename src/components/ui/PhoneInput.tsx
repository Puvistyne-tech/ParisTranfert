"use client";

import { forwardRef, useId } from "react";
import PhoneInputWithCountry from "react-phone-number-input";
import type { Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: Value | undefined) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, helperText, value, onChange, placeholder, required, className, id, disabled }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div
          className={cn(
            "w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500",
            error && "border-red-500 dark:border-red-400 focus-within:border-red-500 dark:focus-within:border-red-400",
            className,
          )}
        >
          <PhoneInputWithCountry
            international
            defaultCountry="FR"
            value={value as Value | undefined}
            onChange={(nextValue) => onChange?.(nextValue)}
            placeholder={placeholder}
            disabled={disabled}
            focusInputOnCountrySelection={false}
            className={cn(
              "PhoneInput",
              "w-full px-4 py-3 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none",
            )}
            numberInputProps={{
              id: inputId,
              className: cn(
                "PhoneInputInput",
                "w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
              ),
            }}
            countrySelectProps={{
              className: "PhoneInputCountrySelect bg-transparent border-none text-gray-900 dark:text-white",
            }}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
        <style jsx global>{`
          .PhoneInput {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .PhoneInputCountrySelect {
            padding: 0.5rem;
            border-radius: 0.375rem;
            background: transparent;
            color: rgb(17 24 39);
            font-size: 0.875rem;
          }
          .dark .PhoneInputCountrySelect {
            color: rgb(255 255 255);
          }
          .PhoneInputInput {
            flex: 1;
            min-width: 0;
          }
          .PhoneInputCountryIcon {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 0.25rem;
          }
          .PhoneInputCountryIcon--border {
            box-shadow: none;
          }
        `}</style>
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
