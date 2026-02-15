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
      .then((data) => {
        setOpportunities(data.slice(0, 6));
      })
      .catch(console.error);
  }, []);

  if (opportunities.length === 0) return null;

  const cardConfigs = [
    { x: '10%', y: '15%', rotate: -3, duration: 25, delay: 0 },
    { x: '75%', y: '10%', rotate: 2, duration: 30, delay: 2 },
    { x: '5%', y: '60%', rotate: -2, duration: 28, delay: 4 },
    { x: '80%', y: '65%', rotate: 3, duration: 32, delay: 1 },
    { x: '45%', y: '20%', rotate: -1, duration: 26, delay: 3 },
    { x: '35%', y: '70%', rotate: 1, duration: 29, delay: 5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {opportunities.map((opp, index) => {
        const config = cardConfigs[index];

        return (
          <motion.div
            key={opp.id}
            className="absolute w-64 p-4 bg-white/40 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg"
            style={{
              left: config.x,
              top: config.y,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              y: [0, -30, 0],
              rotate: [config.rotate, config.rotate + 2, config.rotate],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: 'easeInOut',
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
              {opp.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1">
              {opp.department}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {opp.piName || 'Research Position'}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
