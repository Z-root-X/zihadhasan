"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const Section = ({ children, className }: { children: ReactNode; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);
