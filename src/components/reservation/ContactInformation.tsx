"use client";

import { Mail, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { getClientByEmail } from "@/lib/supabaseService";
import type { Client } from "@/components/models/clients";

interface ContactInformationProps {
  formData: Record<string, any>;
  errorFields: Set<string>;
  onFormFieldChange: (field: string, value: string) => void;
}

export function ContactInformation({
  formData,
  errorFields,
  onFormFieldChange,
}: ContactInformationProps) {
  const t = useTranslations("reservation.step2");
  const [showAllFields, setShowAllFields] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const previousEmailRef = useRef<string>("");

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if email exists when email is valid and changed
  useEffect(() => {
    const email = formData.email?.trim();
    
    // Only check if email is valid format and not empty
    if (!email || !emailRegex.test(email)) {
      setShowAllFields(false);
      setIsExistingUser(false);
      setEmailChecked(false);
      previousEmailRef.current = "";
      return;
    }

    // If email changed from a previously checked email, hide fields immediately
    if (emailChecked && email !== previousEmailRef.current) {
      setShowAllFields(false);
      setIsExistingUser(false);
      setEmailChecked(false);
    }

    // Don't check if email hasn't changed
    if (email === previousEmailRef.current) {
      return;
    }

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(async () => {
      // Double-check email hasn't changed during debounce
      const currentEmail = formData.email?.trim();
      if (!currentEmail || currentEmail !== email) {
        return;
      }

      previousEmailRef.current = email;
      setIsCheckingEmail(true);
      try {
        const client = await getClientByEmail(email);
        
        if (client) {
          // User exists - prefill data only if fields are empty
          setIsExistingUser(true);
          setShowAllFields(true);
          
          // Only prefill if fields are empty (don't overwrite user input)
          if (!formData.firstName || formData.firstName.trim() === "") {
            onFormFieldChange("firstName", client.firstName);
          }
          if (!formData.lastName || formData.lastName.trim() === "") {
            onFormFieldChange("lastName", client.lastName);
          }
          if (!formData.phone || formData.phone.trim() === "") {
            onFormFieldChange("phone", client.phone);
          }
        } else {
          // User doesn't exist - show fields for new user
          setIsExistingUser(false);
          setShowAllFields(true);
          // Only clear fields if they were from a previous existing user check
          // Don't clear if user has manually entered data
        }
        setEmailChecked(true);
      } catch (error) {
        console.error("Error checking email:", error);
        // On error, show fields anyway
        setIsExistingUser(false);
        setShowAllFields(true);
        setEmailChecked(true);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email]);

  // Reset state when email is cleared
  useEffect(() => {
    if (!formData.email || formData.email.trim() === "") {
      setShowAllFields(false);
      setIsExistingUser(false);
      setEmailChecked(false);
      previousEmailRef.current = "";
    }
  }, [formData.email]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    onFormFieldChange("email", newEmail);
    
    // If email is being changed and we had a checked email, hide fields immediately
    if (emailChecked && newEmail.trim() !== previousEmailRef.current) {
      setShowAllFields(false);
      setIsExistingUser(false);
      setEmailChecked(false);
      // Reset the ref so the useEffect will trigger a new check
      previousEmailRef.current = "";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t("contactInformation")}
      </h3>

      {/* Email Field - Always visible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          {t("emailAddressLabel")}
          <span className="text-red-500 ml-1">*</span>
          {isCheckingEmail && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Checking...)
            </span>
          )}
        </label>
        <Input
          type="email"
          placeholder={t("enterEmailAddress")}
          value={formData.email || ""}
          onChange={handleEmailChange}
          className={`w-full ${errorFields.has("email") ? "border-red-500 dark:border-red-500 border-2" : ""}`}
        />
      </div>

      {/* Other fields - shown after email is checked */}
      {showAllFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {t("firstNameLabel")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder={t("enterFirstName")}
              value={formData.firstName || ""}
              onChange={(e) => onFormFieldChange("firstName", e.target.value)}
              className={`w-full ${
                errorFields.has("firstName")
                  ? "border-red-500 dark:border-red-500 border-2"
                  : ""
              }`}
            />
            {isExistingUser && formData.firstName && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Prefilled from your account (editable)
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {t("lastNameLabel")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              placeholder={t("enterLastName")}
              value={formData.lastName || ""}
              onChange={(e) => onFormFieldChange("lastName", e.target.value)}
              className={`w-full ${
                errorFields.has("lastName")
                  ? "border-red-500 dark:border-red-500 border-2"
                  : ""
              }`}
            />
            {isExistingUser && formData.lastName && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Prefilled from your account (editable)
              </p>
            )}
          </div>

          {/* Phone Number - Always editable */}
          <div className="md:col-span-2">
            <PhoneInput
              label={t("phoneNumberLabel")}
              placeholder={t("enterPhoneNumber")}
              value={formData.phone || ""}
              onChange={(value) => onFormFieldChange("phone", value || "")}
              error={errorFields.has("phone") ? t("phoneNumberLabel") : undefined}
              required
            />
            {isExistingUser && formData.phone && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Prefilled from your account (editable)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
