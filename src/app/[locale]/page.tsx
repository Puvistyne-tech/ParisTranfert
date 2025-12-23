import { BriefServices } from "@/components/home/BriefServices";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { ImageCarousel } from "@/components/home/ImageCarousel";
import { Testimonials } from "@/components/home/Testimonials";
import { VehicleClasses } from "@/components/home/VehicleClasses";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ImageCarousel />
      <BriefServices />
      <VehicleClasses />
      <Features />
      <Testimonials />
    </>
  );
}
