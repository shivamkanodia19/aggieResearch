'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Opportunity {
  id: string;
  title: string;
  department: string;
}

export function FloatingOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetch('/api/opportunities/public?major=all')
      .then((res) => res.json())
      .then((data) => setOpportunities(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  if (opportunities.length === 0) return null;

  const cardConfigs = [
    { x: '5%', y: '15%', rotate: -2, duration: 35, delay: 0 },
    { x: '80%', y: '10%', rotate: 1, duration: 40, delay: 3 },
    { x: '8%', y: '70%', rotate: -1, duration: 38, delay: 6 },
    { x: '75%', y: '75%', rotate: 2, duration: 42, delay: 2 },
    { x: '45%', y: '25%', rotate: -1, duration: 36, delay: 4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {opportunities.map((opp, index) => {
        const config = cardConfigs[index];

        return (
          <motion.div
            key={opp.id}
            className="absolute w-64 p-6 bg-white/10 backdrop-blur-[2px] border border-gray-200/20 rounded-sm"
            style={{
              left: config.x,
              top: config.y,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.08, 0.15, 0.08],
              y: [0, -25, 0],
              rotate: [config.rotate, config.rotate + 1.5, config.rotate],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: 'easeInOut',
            }}
          >
            <p className="text-xs text-gray-400/60 font-light tracking-wide uppercase mb-1">
              {opp.department}
            </p>
            <h3 className="text-sm text-gray-500/40 font-light line-clamp-2 leading-relaxed">
              {opp.title}
            </h3>
          </motion.div>
        );
      })}
    </div>
  );
}
