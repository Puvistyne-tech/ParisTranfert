"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCreateContactMessage } from "@/hooks/useReservations";
import type { ContactFormData } from "@/lib/validations";
import { contactSchema } from "@/lib/validations";

export default function ContactPage() {
  const t = useTranslations("contact");
  const createContactMessage = useCreateContactMessage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitError(null);
      await createContactMessage.mutateAsync(data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Failed to send contact message:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to send contact message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              {t("contactInfo")}
            </h2>
            <div className="space-y-6">
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300">
                  <Phone className="text-white w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t("phone")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("phoneSubtitle")}
                  </div>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300">
                  <Mail className="text-white w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t("email")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("emailSubtitle")}
                  </div>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-yellow-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="text-white w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t("address")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("addressSubtitle")}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t("followUs")}
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <span className="text-white text-sm font-bold">f</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <span className="text-white text-sm font-bold">i</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <span className="text-white text-sm font-bold">t</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 shadow-lg">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  {t("sendMessage")}
                </h2>

                {isSubmitted ? (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-success-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Send className="text-white text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t("messageSent")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t("thankYouContacting")}
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setIsSubmitted(false)}
                    >
                      {t("sendAnotherMessage")}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                        <p className="text-sm">{submitError}</p>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label={t("firstName")}
                        {...register("firstName")}
                        error={errors.firstName?.message}
                        required
                      />
                      <Input
                        label={t("lastName")}
                        {...register("lastName")}
                        error={errors.lastName?.message}
                        required
                      />
                    </div>
                    <Input
                      label={t("emailAddress")}
                      type="email"
                      {...register("email")}
                      error={errors.email?.message}
                      required
                    />
                    <Input
                      label={t("phoneNumber")}
                      type="tel"
                      {...register("phone")}
                      error={errors.phone?.message}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("yourMessage")}
                      </label>
                      <textarea
                        {...register("message")}
                        rows={4}
                        className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors duration-300 resize-none"
                        placeholder={t("tellUsHowHelp")}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full btn-premium"
                      isLoading={createContactMessage.isPending}
                      disabled={createContactMessage.isPending}
                    >
                      <Send className="mr-3 w-5 h-5" />
                      {t("sendButton")}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
