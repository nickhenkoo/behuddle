import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { RoleSelection } from "@/components/landing/RoleSelection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Manifesto } from "@/components/landing/Manifesto";
import { CallToAction } from "@/components/landing/CallToAction";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

function Divider() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 flex justify-center">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-sage/20 to-transparent" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-background relative font-sans text-foreground">
      <Navbar />
      <Hero />
      <Divider />
      <RoleSelection />
      <Divider />
      <HowItWorks />
      <Divider />
      <Manifesto />
      <Divider />
      <FAQ />
      <Divider />
      <CallToAction />
      <Footer />
    </main>
  );
}
