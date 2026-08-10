"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Framework } from "../../db/schema";

function hueFor(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 360;
  }
  return h;
}

export default function FrameworkCard({ framework }: { framework: Framework }) {
  const hue = hueFor(framework.category);

  return (
    <Link
      href={`/frameworks/${framework.slug}`}
      className="card hover-card"
      style={{ "--card-hue": hue } as CSSProperties}
    >
      <span className="card-accent" aria-hidden="true" />
      <h4>{framework.name}</h4>
      <p className="issuer">{framework.issuer}</p>
      <p className="muted card-reveal">{framework.description}</p>
      <span className="card-cat">{framework.category}</span>
    </Link>
  );
}
