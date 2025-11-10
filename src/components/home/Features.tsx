"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getFeatures } from "@/lib/supabaseService";
import {
    WifiHigh,
    PlayCircle,
    Battery,
    Baby,
    CreditCard,
    UserCheck,
    LucideIcon,
} from "lucide-react";

export function Features() {
    const t = useTranslations("features");
    const tCommon = useTranslations("common");
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeatures() {
            try {
                const data = await getFeatures();
                setFeatures(data);
            } catch (error) {
                console.error("Error loading features:", error);
            } finally {
                setLoading(false);
            }
        }
        loadFeatures();
    }, []);

    // Map feature keys to appropriate icons
    const featureIcons: Record<string, LucideIcon> = {
        wifi: WifiHigh,
        entertainment: PlayCircle,
        chargers: Battery,
        childSafety: Baby,
        payment: CreditCard,
        drivers: UserCheck,
    };

    if (loading) {
        return (
            <section id="about" className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-600 dark:text-gray-400">{tCommon("loading")}</div>
                </div>
            </section>
        );
    }

    return (
        <section id="about" className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-10 left-1/4 w-80 h-80 bg-violet-300/20 dark:bg-violet-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, 60, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-10 right-1/4 w-72 h-72 bg-fuchsia-300/20 dark:bg-fuchsia-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -50, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
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
                    <h2 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
                        {t("title")}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature: any, index: number) => {
                        const Icon = featureIcons[feature.key] || WifiHigh;
                        return (
                            <motion.div
                                key={feature.key}
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                            >
                                <div
                                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center feature-icon`}
                                >
                                    <Icon className="text-white text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                    {t(`${feature.key}.title`)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t(`${feature.key}.description`)}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
