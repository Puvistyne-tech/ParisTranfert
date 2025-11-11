import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CustomDropdownProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: { value: string | number; label: string }[];
  className?: string;
  placeholder?: string;
  isSlider?: boolean;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
}

export function CustomDropdown({
  label,
  value,
  onChange,
  options,
  className,
  placeholder = "Select an option...",
  isSlider = false,
  sliderMin = 1,
  sliderMax = 9,
  sliderStep = 1,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(value as number);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    onChange(newValue);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-left flex items-center justify-between",
          isOpen && "border-blue-500 dark:border-blue-400",
        )}
      >
        <span
          className={cn(
            selectedOption
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400",
          )}
        >
          {isSlider
            ? `${sliderValue} passengers`
            : selectedOption?.label || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {isSlider ? (
            <div className="p-4">
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Passengers: {sliderValue}
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    step={sliderStep}
                    value={sliderValue}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100}%, #e5e7eb ${((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    {Array.from(
                      { length: sliderMax - sliderMin + 1 },
                      (_, i) => (
                        <span key={i}>{i + sliderMin}</span>
                      ),
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100",
                    value === option.value &&
                      "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
