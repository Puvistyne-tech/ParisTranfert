import { Features } from "@/components/home/Features";
import { VehicleClasses } from "@/components/home/VehicleClasses";
import { Hero } from "@/components/home/Hero";
import { Testimonials } from "@/components/home/Testimonials";
import { BriefServices } from "@/components/home/BriefServices";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BriefServices />
      <VehicleClasses />
      <Features />
      <Testimonials />
    </>
  );
}
