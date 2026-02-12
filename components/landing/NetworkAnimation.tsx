'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

/* ─────────────────────────────────────────────
   Research‑themed network / constellation
   SVG‑based, Framer Motion‑driven.
   Renders a set of "nodes" (students, labs,
   professors, research areas) connected by
   subtle pulsing edges.
   ───────────────────────────────────────────── */

const MAROON = '#500000';
const MAROON_LIGHT = '#7a2020';
const WARM_GRAY = '#9ca3af'; // gray‑400
const AMBER = '#d97706'; // amber‑600

interface Node {
  id: number;
  /** centre x (% of viewBox width) */
  cx: number;
  /** centre y (% of viewBox height) */
  cy: number;
  /** radius */
  r: number;
  /** label type – drives colour */
  kind: 'student' | 'lab' | 'professor' | 'field';
  /** small drift offsets for the floating animation */
  dx: number;
  dy: number;
  /** animation duration (seconds) — vary per node for organic feel */
  dur: number;
}

interface Edge {
  from: number;
  to: number;
}

// Deterministic layout so it never shifts between SSR & client.
const NODES: Node[] = [
  // Cluster top‑left — labs & students
  { id: 0, cx: 120, cy: 140, r: 7, kind: 'lab', dx: 8, dy: 6, dur: 7 },
  { id: 1, cx: 200, cy: 100, r: 5, kind: 'student', dx: -6, dy: 10, dur: 9 },
  { id: 2, cx: 80, cy: 220, r: 4, kind: 'student', dx: 10, dy: -5, dur: 8 },
  { id: 3, cx: 180, cy: 200, r: 6, kind: 'professor', dx: -8, dy: 8, dur: 10 },

  // Middle band — professors & fields
  { id: 4, cx: 350, cy: 160, r: 8, kind: 'field', dx: -5, dy: 7, dur: 11 },
  { id: 5, cx: 440, cy: 110, r: 5, kind: 'student', dx: 7, dy: -8, dur: 8 },
  { id: 6, cx: 300, cy: 250, r: 6, kind: 'professor', dx: 6, dy: 5, dur: 9 },
  { id: 7, cx: 480, cy: 220, r: 4, kind: 'student', dx: -9, dy: 6, dur: 7 },

  // Cluster bottom‑right
  { id: 8, cx: 620, cy: 140, r: 7, kind: 'lab', dx: 5, dy: -7, dur: 10 },
  { id: 9, cx: 700, cy: 200, r: 5, kind: 'student', dx: -7, dy: 9, dur: 8 },
  { id: 10, cx: 560, cy: 260, r: 6, kind: 'field', dx: 8, dy: -4, dur: 11 },
  { id: 11, cx: 740, cy: 100, r: 4, kind: 'professor', dx: -5, dy: 6, dur: 9 },

  // Far‑right sparse
  { id: 12, cx: 850, cy: 170, r: 5, kind: 'student', dx: 6, dy: 8, dur: 8 },
  { id: 13, cx: 900, cy: 260, r: 4, kind: 'field', dx: -6, dy: -5, dur: 10 },

  // Bottom scattered
  { id: 14, cx: 250, cy: 330, r: 4, kind: 'student', dx: 7, dy: -6, dur: 9 },
  { id: 15, cx: 500, cy: 340, r: 5, kind: 'lab', dx: -5, dy: 8, dur: 8 },
  { id: 16, cx: 660, cy: 320, r: 4, kind: 'student', dx: 9, dy: -3, dur: 10 },

  // Top sparse
  { id: 17, cx: 400, cy: 50, r: 4, kind: 'professor', dx: -6, dy: 5, dur: 9 },
  { id: 18, cx: 580, cy: 60, r: 3, kind: 'student', dx: 5, dy: 7, dur: 7 },
];

const EDGES: Edge[] = [
  // Top‑left cluster
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 1, to: 3 },
  // Middle connections
  { from: 3, to: 4 },
  { from: 3, to: 6 },
  { from: 4, to: 5 },
  { from: 4, to: 6 },
  { from: 4, to: 17 },
  { from: 5, to: 7 },
  { from: 5, to: 18 },
  { from: 6, to: 14 },
  { from: 6, to: 15 },
  // Bottom‑right cluster
  { from: 7, to: 8 },
  { from: 8, to: 9 },
  { from: 8, to: 10 },
  { from: 8, to: 11 },
  { from: 9, to: 12 },
  { from: 10, to: 15 },
  { from: 10, to: 16 },
  { from: 11, to: 12 },
  { from: 12, to: 13 },
  // Long‑range links
  { from: 1, to: 17 },
  { from: 15, to: 16 },
  { from: 13, to: 16 },
];

function nodeColor(kind: Node['kind']): string {
  switch (kind) {
    case 'lab':
      return MAROON;
    case 'professor':
      return MAROON_LIGHT;
    case 'field':
      return AMBER;
    case 'student':
    default:
      return WARM_GRAY;
  }
}

export function NetworkAnimation({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  // Build a lookup map for edge rendering
  const nodeMap = useMemo(() => {
    const m = new Map<number, Node>();
    NODES.forEach((n) => m.set(n.id, n));
    return m;
  }, []);

  return (
    <svg
      viewBox="0 0 960 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* ── Edges ────────────────────────── */}
      {EDGES.map(({ from, to }, i) => {
        const a = nodeMap.get(from)!;
        const b = nodeMap.get(to)!;
        return (
          <motion.line
            key={`e-${from}-${to}`}
            x1={a.cx}
            y1={a.cy}
            x2={b.cx}
            y2={b.cy}
            stroke={WARM_GRAY}
            strokeWidth={0.8}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={
              reducedMotion
                ? { opacity: 0.25, pathLength: 1 }
                : {
                    opacity: [0.12, 0.3, 0.12],
                    pathLength: 1,
                  }
            }
            transition={
              reducedMotion
                ? { duration: 0.5, delay: i * 0.03 }
                : {
                    opacity: {
                      duration: 4 + (i % 3),
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.15,
                    },
                    pathLength: {
                      duration: 1.2,
                      delay: i * 0.06,
                      ease: 'easeOut',
                    },
                  }
            }
          />
        );
      })}

      {/* ── Nodes ────────────────────────── */}
      {NODES.map((node) => {
        const color = nodeColor(node.kind);
        return (
          <motion.g key={`n-${node.id}`}>
            {/* Glow / halo */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 2.5}
              fill={color}
              initial={{ opacity: 0 }}
              animate={
                reducedMotion
                  ? { opacity: 0.06 }
                  : {
                      opacity: [0.03, 0.08, 0.03],
                      cx: [node.cx, node.cx + node.dx, node.cx],
                      cy: [node.cy, node.cy + node.dy, node.cy],
                    }
              }
              transition={{
                duration: node.dur,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Core dot */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={color}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                reducedMotion
                  ? { opacity: 0.45, scale: 1 }
                  : {
                      opacity: [0.35, 0.6, 0.35],
                      scale: 1,
                      cx: [node.cx, node.cx + node.dx, node.cx],
                      cy: [node.cy, node.cy + node.dy, node.cy],
                    }
              }
              transition={
                reducedMotion
                  ? { duration: 0.5, delay: node.id * 0.04 }
                  : {
                      opacity: {
                        duration: node.dur,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      scale: {
                        duration: 0.6,
                        delay: node.id * 0.05,
                        ease: 'backOut',
                      },
                      cx: {
                        duration: node.dur,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      cy: {
                        duration: node.dur,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }
              }
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
