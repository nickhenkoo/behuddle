import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TwoDoors } from "@/components/TwoDoors";
import { HowItWorks } from "@/components/HowItWorks";
import { Manifesto } from "@/components/Manifesto";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-background relative font-sans text-foreground">
      <Navbar />
      <Hero />
      <TwoDoors />
      <HowItWorks />
      <Manifesto />
      <CallToAction />
      <Footer />
    </main>
  );
}
