'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Opportunity {
  id: string;
  title: string;
  department: string;
  piName: string | null;
}

export function FloatingOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetch('/api/opportunities/public?major=all')
      .then((res) => res.json())
      .then((data) => setOpportunities(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  if (opportunities.length === 0) return null;

  const cardConfigs = [
    { x: '8%', y: '12%', rotate: -4, duration: 28, delay: 0 },
    { x: '78%', y: '8%', rotate: 3, duration: 32, delay: 2 },
    { x: '3%', y: '65%', rotate: -2, duration: 30, delay: 4 },
    { x: '82%', y: '70%', rotate: 4, duration: 34, delay: 1 },
    { x: '42%', y: '18%', rotate: -3, duration: 29, delay: 3 },
    { x: '38%', y: '75%', rotate: 2, duration: 31, delay: 5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {opportunities.map((opp, index) => {
        const config = cardConfigs[index];

        return (
          <motion.div
            key={opp.id}
            className="absolute w-72 p-5 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-2xl"
            style={{
              left: config.x,
              top: config.y,
            }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{
              opacity: [0.25, 0.45, 0.25],
              y: [0, -40, 0],
              rotate: [config.rotate, config.rotate + 3, config.rotate],
              scale: [0.95, 1, 0.95],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: 'easeInOut',
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900/90 mb-2 line-clamp-2 font-display">
              {opp.title}
            </h3>
            <p className="text-xs text-gray-700/80 line-clamp-1 font-medium">
              {opp.department}
            </p>
            <p className="text-xs text-gray-600/70 mt-1">
              {opp.piName || 'Research Position'}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
