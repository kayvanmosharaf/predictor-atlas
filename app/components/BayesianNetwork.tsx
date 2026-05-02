"use client";

import { useMemo } from "react";
import { linkVertical } from "d3-shape";
import styles from "./BayesianNetwork.module.css";

interface Outcome {
  id: string;
  label: string;
  probability: number | null;
}

interface Props {
  players: string[];
  outcomes: Outcome[];
  categoryColor: string;
}

const WIDTH = 640;
const HEIGHT = 280;
const MARGIN_X = 24;
const PLAYER_Y = 36;
const PLAYER_H = 26;
const PLAYER_W = 110;
const SCENARIO_Y = 168;
const SCENARIO_H = 78;
const SCENARIO_W = 120;

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function spread(count: number, width: number, padding: number) {
  if (count === 0) return [];
  if (count === 1) return [width / 2];
  const usable = width - 2 * padding;
  const step = usable / (count - 1);
  return Array.from({ length: count }, (_, i) => padding + i * step);
}

export default function BayesianNetwork({
  players,
  outcomes,
  categoryColor,
}: Props) {
  const playerXs = useMemo(
    () => spread(players.length, WIDTH, MARGIN_X + PLAYER_W / 2),
    [players.length]
  );
  const scenarioXs = useMemo(
    () => spread(outcomes.length, WIDTH, MARGIN_X + SCENARIO_W / 2),
    [outcomes.length]
  );

  const linkPath = useMemo(
    () =>
      linkVertical<unknown, { x: number; y: number }>()
        .x((d) => d.x)
        .y((d) => d.y),
    []
  );

  const edges = useMemo(() => {
    const out: { d: string; key: string }[] = [];
    playerXs.forEach((px, pi) => {
      scenarioXs.forEach((sx, si) => {
        const path = linkPath({
          source: { x: px, y: PLAYER_Y + PLAYER_H },
          target: { x: sx, y: SCENARIO_Y },
        });
        if (path) out.push({ d: path, key: `${pi}-${si}` });
      });
    });
    return out;
  }, [playerXs, scenarioXs, linkPath]);

  if (outcomes.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>Bayesian Network</div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.svg}
        role="img"
        aria-label="Bayesian network of players and scenarios"
      >
        <text x={MARGIN_X} y={20} className={styles.tierLabel}>
          Players
        </text>
        <text
          x={MARGIN_X}
          y={SCENARIO_Y - 12}
          className={styles.tierLabel}
        >
          Scenarios
        </text>

        {edges.map((e) => (
          <path
            key={e.key}
            d={e.d}
            className={styles.edge}
            stroke={categoryColor}
          />
        ))}

        {players.map((p, i) => {
          const cx = playerXs[i];
          return (
            <g key={`p-${i}`} transform={`translate(${cx - PLAYER_W / 2}, ${PLAYER_Y})`}>
              <rect
                width={PLAYER_W}
                height={PLAYER_H}
                className={styles.playerRect}
                fill="rgba(30, 41, 59, 0.95)"
                stroke={categoryColor}
              />
              <text
                x={PLAYER_W / 2}
                y={PLAYER_H / 2 + 3.5}
                textAnchor="middle"
                className={styles.nodeText}
              >
                {truncate(p, 18)}
              </text>
            </g>
          );
        })}

        {outcomes.map((o, i) => {
          const cx = scenarioXs[i];
          const prob = o.probability ?? 0;
          const barW = SCENARIO_W - 16;
          const fillW = Math.max(0, Math.min(100, prob)) * (barW / 100);
          return (
            <g key={o.id} transform={`translate(${cx - SCENARIO_W / 2}, ${SCENARIO_Y})`}>
              <rect
                width={SCENARIO_W}
                height={SCENARIO_H}
                className={styles.scenarioRect}
                stroke={categoryColor}
              />
              <text
                x={SCENARIO_W / 2}
                y={20}
                textAnchor="middle"
                className={styles.nodeText}
              >
                {truncate(o.label, 20)}
              </text>
              <text
                x={SCENARIO_W / 2}
                y={42}
                textAnchor="middle"
                className={styles.probText}
                fill={categoryColor}
              >
                {prob}%
              </text>
              <rect
                x={8}
                y={SCENARIO_H - 18}
                width={barW}
                height={6}
                className={styles.barBg}
                rx={3}
                ry={3}
              />
              <rect
                x={8}
                y={SCENARIO_H - 18}
                width={fillW}
                height={6}
                fill={categoryColor}
                rx={3}
                ry={3}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
