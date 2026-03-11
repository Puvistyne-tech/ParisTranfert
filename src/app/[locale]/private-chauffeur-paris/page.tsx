import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import {
  Award,
  Briefcase,
  Calendar,
  Car,
  Clock,
  Crown,
  Heart,
  MapPin,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privateChaufPage.meta' })

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://prestigeshuttlegroup.com/${locale}/private-chauffeur-paris`,
    },
    alternates: {
      canonical: `https://prestigeshuttlegroup.com/${locale}/private-chauffeur-paris`,
    },
  }
}

export default async function PrivateChauffeurParisPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'privateChaufPage' })

  const features = [
    { icon: Car, key: 'mercedes' },
    { icon: Star, key: 'professional' },
    { icon: Clock, key: 'hourly' },
    { icon: Briefcase, key: 'business' },
    { icon: Heart, key: 'events' },
    { icon: MapPin, key: 'tours' },
  ] as const

  const useCaseIcons = [
    { icon: Briefcase, key: 'business' },
    { icon: Car, key: 'airport' },
    { icon: Crown, key: 'events' },
    { icon: MapPin, key: 'tours' },
    { icon: ShoppingBag, key: 'shopping' },
    { icon: Users, key: 'medical' },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section
        className="text-white pt-24 pb-20"
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              {t('breadcrumb.home')}
            </Link>
            <span>/</span>
            <span className="text-white">{t('breadcrumb.current')}</span>
          </nav>

          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              {t('hero.badge')}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold font-display mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 leading-relaxed mb-10 max-w-3xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/reservation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-xl hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Calendar className="w-5 h-5" />
                {t('hero.cta')}
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/60 hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t(`features.${key}.title` as Parameters<typeof t>[0])}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(`features.${key}.description` as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('useCases.title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {useCaseIcons.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                  {t(`useCases.${key}` as Parameters<typeof t>[0])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '500+', label: 'Happy Clients' },
              { icon: Car, value: '15+', label: 'Mercedes Fleet' },
              { icon: Clock, value: '24/7', label: 'Available' },
              { icon: Award, value: '5★', label: 'Rated' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center mb-1">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {value}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 text-white"
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">
            {t('booking.title')}
          </h2>
          <p className="text-xl opacity-80 mb-10 leading-relaxed">
            {t('booking.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-xl hover:bg-blue-50 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
            >
              <Calendar className="w-5 h-5" />
              {t('booking.cta')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/60 hover:bg-white/10 hover:border-white transition-all duration-300 text-lg"
            >
              {t('booking.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
