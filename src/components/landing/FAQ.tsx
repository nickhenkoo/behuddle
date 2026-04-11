"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "I have an idea. How do I know it won't be stolen?",
    answer:
      "Ideas are cheap, execution is everything. The builders on behuddle are looking for a partner with vision, domain expertise, and the drive to make it happen, not just a bare concept. If you bring real value to the table, they have no reason to build it without you.",
  },
  {
    question: "I'm a builder. Will I get paid for my work?",
    answer:
      "behuddle is not a freelance marketplace. It's a platform for finding co-founders to build something together. You will negotiate equity, revenue sharing, or future compensation directly with your partner once you decide to team up.",
  },
  {
    question: "How is this different from existing forums or subreddits?",
    answer:
      "Forums are noisy and unstructured. behuddle is designed specifically to match complementary skill sets. No endless scrolling through irrelevant posts — just focused profiles of people ready to ship.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes, joining the community and finding your co-founder is completely free during our early access period.",
  },
];

function FAQItem({ item, isOpen, onClick }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-sage/10 last:border-none">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-6 text-left focus:outline-none group"
      >
        <span className="font-display text-[1.15rem] font-medium text-neutral-800 group-hover:text-sage-dark transition-colors leading-[1.35] overflow-visible">
          {item.question}
        </span>
        <div className="flex-shrink-0 ml-6 text-sage/40 group-hover:text-sage transition-colors">
          {isOpen ? <Minus className="w-5 h-5" strokeWidth={1.5} /> : <Plus className="w-5 h-5" strokeWidth={1.5} />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pb-6 text-[1.05rem] font-light text-neutral-500 leading-relaxed pr-8">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 px-6 w-full max-w-3xl mx-auto bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="mb-16"
      >
        <h2 className="font-display text-[clamp(2rem,5vw+0.5rem,3rem)] font-semibold text-foreground leading-[1.2] mb-4 overflow-visible">
          Common questions
        </h2>
        <p className="text-neutral-500 font-light text-lg">
          Everything you need to know about how behuddle works.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        {FAQ_ITEMS.map((item, i) => (
          <FAQItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.div>
    </section>
  );
}
