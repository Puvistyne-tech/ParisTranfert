import type { Metadata } from "next";
import { BriefServices } from "@/components/home/BriefServices";
import { DisneylandPromo } from "@/components/home/DisneylandPromo";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { ImageCarousel } from "@/components/home/ImageCarousel";
import { Testimonials } from "@/components/home/Testimonials";
import { VehicleClasses } from "@/components/home/VehicleClasses";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: {
    title: "Luxury Private Chauffeur & 24/7 Airport Transfer Service in Paris",
    description:
      "Luxury private chauffeur service in Paris offering premium CDG airport transfers, professional airport taxi service, and 24/7 private chauffeur travel across France.",
  },
  fr: {
    title:
      "Service de Chauffeur Privé de Luxe & Transfert Aéroport 24/7 à Paris",
    description:
      "Service de chauffeur privé de luxe à Paris proposant des transferts aéroport premium CDG, taxi aéroport professionnel et service 24/7 en France.",
  },
  es: {
    title:
      "Servicio de Chófer Privado de Lujo y Traslados al Aeropuerto 24/7 en París",
    description:
      "Servicio de chófer privado de lujo en París con traslados premium al aeropuerto CDG, taxi aeropuerto profesional y servicio 24/7 en toda Francia.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] ?? metaByLocale.en;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://prestigeshuttlegroup.com/${locale}`,
    },
    twitter: {
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ImageCarousel />
      <DisneylandPromo />
      <BriefServices />
      <VehicleClasses />
      <Features />
      <Testimonials />
    </>
  );
}
