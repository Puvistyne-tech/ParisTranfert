"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { getTestimonials } from "@/lib/supabaseService";

export function Testimonials() {
  const t = useTranslations("testimonials");
  const tCommon = useTranslations("common");
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            {tCommon("loading")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-1/3 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
            {t("title")}
          </h2>
          <p className="text-xl lg:text-2xl xl:text-3xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="testimonial-card p-6">
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold mr-4`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="text-base lg:text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100">
                        {testimonial.name}
                      </h4>
                      <div className="flex text-warning-500 dark:text-warning-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm lg:text-base xl:text-lg text-gray-600 dark:text-gray-400 italic">
                    "{testimonial.comment}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
