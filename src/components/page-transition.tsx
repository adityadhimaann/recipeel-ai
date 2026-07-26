"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const ROUTE_INDEXES: Record<string, number> = {
  "/": 0,
  "/dashboard": 1,
  "/recipes": 2,
  "/recipes/import": 2.5,
  "/chef-bot": 2.8,
  "/onboarding": 3,
  "/auth": 4,
  "/reset-password": 5,
};

function getRouteIndex(path: string): number {
  if (ROUTE_INDEXES[path] !== undefined) return ROUTE_INDEXES[path];
  if (path.startsWith("/recipes")) return 2;
  if (path.startsWith("/chef-bot")) return 2.8;
  if (path.startsWith("/onboarding")) return 3;
  return 0;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [direction, setDirection] = useState<number>(1);

  useEffect(() => {
    const prevIdx = getRouteIndex(prevPathRef.current);
    const currIdx = getRouteIndex(pathname);
    if (currIdx !== prevIdx) {
      setDirection(currIdx > prevIdx ? 1 : -1);
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  const variants = {
    initial: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full flex-1 overflow-x-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 280, damping: 28 },
            opacity: { duration: 0.2 },
          }}
          className="w-full flex-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
