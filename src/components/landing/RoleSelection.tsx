"use client";

import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, useAnimation } from "framer-motion";
import { useRef, useState, MouseEvent } from "react";
import Link from "next/link";
import { Lightbulb, Code2, ArrowRight } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  delay: number;
  hoverText: string;
}

function RoleCard({ title, description, icon, href, delay, hoverText }: RoleCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const iconControls = useAnimation();
  const iconBgControls = useAnimation();

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  async function handleMouseEnter() {
    setHovered(true);
    iconBgControls.start({ backgroundColor: "#1A1918", color: "#ffffff", transition: { duration: 0.25 } });
    await iconControls.start({ rotate: [-8, 8, -4, 2, 0], transition: { duration: 0.55, ease: "easeInOut" } });
  }

  function handleMouseLeave() {
    setHovered(false);
    iconBgControls.start({ backgroundColor: "#FAFAFA", color: "#1A1918", transition: { duration: 0.3 } });
    iconControls.start({ rotate: 0, transition: { duration: 0.4, ease: "easeOut" } });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="w-full h-full"
    >
    <Link 
      href={href} 
      className="group block w-full outline-none focus-visible:ring-4 focus-visible:ring-sage focus-visible:ring-offset-4 rounded-[2rem]"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{ y: hovered ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative h-full flex flex-col justify-between p-8 md:p-12 rounded-[2rem] bg-white border border-neutral-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-[box-shadow,border-color] duration-500 group-hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.04)] group-hover:border-neutral-300"
      >
        {/* Dynamic Spotlight Effect */}
        <motion.div
          className="absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                450px circle at ${mouseX}px ${mouseY}px,
                rgba(138, 154, 134, 0.08),
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative z-10">
          <motion.div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-inset ring-neutral-200/50 shadow-sm overflow-hidden"
            animate={iconBgControls}
            initial={{ backgroundColor: "#FAFAFA", color: "#1A1918" }}
          >
            <motion.div animate={iconControls}>
              {icon}
            </motion.div>
          </motion.div>
          
          <h3 className="font-display text-[2.25rem] font-semibold text-[#1A1918] mb-4 tracking-tight">
            {title}
          </h3>
          
          <p className="text-[#1A1918]/60 text-[15.5px] leading-[1.6] max-w-[280px]">
            {description}
          </p>
        </div>

        <div className="relative z-10 mt-12 flex items-center gap-2 text-[14.5px] font-medium transition-opacity duration-200" style={{ opacity: hovered ? 1 : 0.45 }}>
          <span className="relative grid" style={{ gridTemplate: '"stack" / 1fr' }}>
            <span className="[grid-area:stack] transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2 text-[#1A1918] whitespace-nowrap">
              Get started
            </span>
            <span className="[grid-area:stack] transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 text-sage whitespace-nowrap">
              {hoverText}
            </span>
          </span>
          <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 text-sage group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
        </div>

        {/* Subtle decorative edge lighting */}
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/50 pointer-events-none" />
      </motion.div>
    </Link>
    </motion.div>
  );
}

export function RoleSelection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yContent = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="roles"
      ref={ref}
      className="py-24 md:py-32 px-6 w-full max-w-5xl mx-auto bg-background overflow-hidden"
    >
      <motion.div style={{ y: yContent }} className="flex flex-col items-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold text-[#1A1918] leading-[1.1] tracking-tight">
            Find your match
          </h2>
          <p className="mt-5 text-[#1A1918]/60 text-[16px] md:text-[18px] max-w-[480px] mx-auto leading-relaxed">
            Every great product needs a visionary to dream it and a builder to make it real. Which one are you?
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
          <RoleCard
            title="Visionary"
            description="I have a brilliant idea and domain expertise, but need a technical partner to build it."
            icon={<Lightbulb className="w-6 h-6 stroke-[1.5]" />}
            href="/login?role=idea"
            delay={0.1}
            hoverText="Show your vision"
          />
          <RoleCard
            title="Builder"
            description="I have the technical skills to build products, and I'm looking for a great idea to bring to life."
            icon={<Code2 className="w-6 h-6 stroke-[1.5]" />}
            href="/login?role=builder"
            delay={0.2}
            hoverText="Start building"
          />
        </div>
      </motion.div>
    </section>
  );
}
