"use client";

import { AddIcon } from "@/components/icons";
import { useId } from "react";

interface Props {
  onClick: () => void;
}

function buildWavyCirclePath(
  center: number,
  radius: number,
  amplitude: number,
  waves: number,
) {
  const steps = 120;
  const points: string[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const ripple = amplitude * Math.sin(angle * waves);
    const pointRadius = radius + ripple;
    const x = center + pointRadius * Math.cos(angle);
    const y = center + pointRadius * Math.sin(angle);
    points.push(`${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `${points.join(" ")} Z`;
}

const WAVY_CIRCLE = buildWavyCirclePath(32, 29, 2.4, 7);

export function AddTodoButton({ onClick }: Props) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <button
      id="add-todo-button"
      type="button"
      className="add-todo-button"
      onClick={onClick}
      aria-label="Add todo"
    >
      <span className="add-todo-button__wave" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="presentation">
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="32"
              x2="64"
              y2="32"
            >
              <stop offset="0%" stopColor="#EEB0B4" />
              <stop offset="45%" stopColor="#28DDFD" />
              <stop offset="100%" stopColor="#EEB0B4" />
            </linearGradient>
          </defs>
          <path
            className="add-todo-button__wave-path add-todo-button__wave-path--primary"
            d={WAVY_CIRCLE}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            className="add-todo-button__wave-path add-todo-button__wave-path--secondary"
            d={WAVY_CIRCLE}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      </span>
      <span className="add-todo-button__icon">
        <AddIcon />
      </span>
    </button>
  );
}
