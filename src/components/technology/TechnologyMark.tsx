import type { CSSProperties } from "react";
import cplusplusMark from "@/assets/technology/cplusplus.svg";
import cudaMark from "@/assets/technology/cuda-signal.svg";
import mpiMark from "@/assets/technology/mpi-signal.svg";
import pythonMark from "@/assets/technology/python.svg";
import pytorchMark from "@/assets/technology/pytorch.svg";
import qiskitMark from "@/assets/technology/qiskit.svg";
import cirqMark from "@/assets/technology/cirq-signal.svg";
import reactMark from "@/assets/technology/react.svg";
import typescriptMark from "@/assets/technology/typescript.svg";
import fastapiMark from "@/assets/technology/fastapi.svg";
import postgresqlMark from "@/assets/technology/postgresql.svg";
import dockerMark from "@/assets/technology/docker.svg";
import { Tag } from "@/components/kit/Primitives";
import {
  getTechnologyMark,
  type TechnologyMarkKind,
} from "@/data/technologyMarks";
import type { VisualAccent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import styles from "./TechnologyMark.module.css";

/*
 * Brand silhouettes are a focused, self-hosted subset of Simple Icons v16.0.0
 * (CC0-1.0): https://github.com/simple-icons/simple-icons/tree/16.0.0
 * CUDA, MPI, and Cirq use original, non-trademark telemetry glyphs because the
 * source set has no exact technology mark. Visible labels always carry identity.
 */
const MARK_URLS: Record<TechnologyMarkKind, string> = {
  cplusplus: cplusplusMark,
  cuda: cudaMark,
  mpi: mpiMark,
  python: pythonMark,
  pytorch: pytorchMark,
  qiskit: qiskitMark,
  cirq: cirqMark,
  react: reactMark,
  typescript: typescriptMark,
  fastapi: fastapiMark,
  postgresql: postgresqlMark,
  docker: dockerMark,
};

export function TechnologyMark({
  technology,
  size = "small",
  className,
}: {
  technology: string;
  size?: "small" | "medium" | "large";
  className?: string;
}) {
  const definition = getTechnologyMark(technology);
  if (!definition) return null;

  const style = {
    "--technology-mark": `url("${MARK_URLS[definition.mark]}")`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      data-technology-mark={definition.technology}
      className={cn(styles.mark, styles[size], className)}
      style={style}
    />
  );
}

/** A technology tag gains a mark only when the exact project-data spelling is mapped. */
export function TechnologyChip({
  technology,
  fallbackTone = "none",
}: {
  technology: string;
  fallbackTone?: VisualAccent;
}) {
  const definition = getTechnologyMark(technology);

  return (
    <Tag tone={definition?.tone ?? fallbackTone}>
      <span className="inline-flex items-center gap-1">
        {definition && <TechnologyMark technology={technology} />}
        <span>{technology}</span>
      </span>
    </Tag>
  );
}
