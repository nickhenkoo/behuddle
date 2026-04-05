"use client";

import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      text: "Tell about yourself and your idea (or your skills)",
    },
    {
      number: "02",
      text: "Look at people who are looking for you",
    },
    {
      number: "03",
      text: "Message. Meet. Start building.",
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 w-full border-t border-black/10 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-display text-[clamp(1.75rem,4vw+0.5rem,3rem)] font-semibold tracking-tight text-black text-center">
            How it works
          </h2>
        </motion.div>

        <div className="flex flex-col gap-10 md:gap-14">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex items-center gap-6 md:gap-10${index === 2 ? " md:mt-6" : ""}`}
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                  delay: index * 0.15,
                }}
                className="font-display text-[clamp(3rem,7vw,5rem)] font-bold text-black/15 shrink-0 tabular-nums"
              >
                {step.number}
              </motion.div>
              <div className="font-display text-[clamp(1.1rem,2.5vw+0.5rem,1.75rem)] font-medium text-black leading-snug">
                {step.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
