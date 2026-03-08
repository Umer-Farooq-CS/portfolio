import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function ThanksPage() {
  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-[70vh] flex items-center">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-8"
        >
          <CheckCircle2 size={40} className="text-primary" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
        >
          Thank <span className="text-gradient">you</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-muted-foreground text-base sm:text-lg"
        >
          Your message has been sent. I'll get back to you as soon as I can.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-accent text-primary-foreground font-semibold text-sm shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
