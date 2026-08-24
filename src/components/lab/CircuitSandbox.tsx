import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import {
  basisLabel,
  probabilities,
  simulate,
  type GateId,
  type GateOp,
} from "@/lib/quantum/statevector";
import { EXPORT_TARGETS, exportCircuit, type ExportTarget } from "@/lib/quantum/export";
import { MonoLabel } from "@/components/kit/Primitives";

const QUBITS = 3;
const COLUMNS = 6;

const PALETTE: { id: GateId; label: string; hint: string }[] = [
  { id: "H", label: "H", hint: "Hadamard — puts a qubit into superposition" },
  { id: "X", label: "X", hint: "Bit flip" },
  { id: "Y", label: "Y", hint: "Bit and phase flip" },
  { id: "Z", label: "Z", hint: "Phase flip" },
  { id: "S", label: "S", hint: "Quarter turn of phase" },
  { id: "T", label: "T", hint: "Eighth turn of phase" },
  { id: "CNOT", label: "●–⊕", hint: "Controlled NOT — flips the target when the control is 1" },
];

interface Cell {
  id: GateId;
  /** Target wire, CNOT only. The cell itself holds the control. */
  partner?: number;
}

type Grid = (Cell | null)[][];

const emptyGrid = (): Grid =>
  Array.from({ length: COLUMNS }, () => Array.from({ length: QUBITS }, () => null));

const PRESETS: { name: string; describe: string; build: () => Grid }[] = [
  {
    name: "Bell pair",
    describe: "Two qubits, perfectly correlated. Measuring one tells you the other.",
    build: () => {
      const grid = emptyGrid();
      grid[0][0] = { id: "H" };
      grid[1][0] = { id: "CNOT", partner: 1 };
      return grid;
    },
  },
  {
    name: "GHZ",
    describe: "The same correlation across all three qubits — either all zero or all one.",
    build: () => {
      const grid = emptyGrid();
      grid[0][0] = { id: "H" };
      grid[1][0] = { id: "CNOT", partner: 1 };
      grid[2][0] = { id: "CNOT", partner: 2 };
      return grid;
    },
  },
  {
    name: "Uniform",
    describe: "All eight basis states equally likely.",
    build: () => {
      const grid = emptyGrid();
      grid[0][0] = { id: "H" };
      grid[0][1] = { id: "H" };
      grid[0][2] = { id: "H" };
      return grid;
    },
  },
];

/** Column-major so the circuit reads left to right, exactly as drawn. */
function gridToOps(grid: Grid): GateOp[] {
  const ops: GateOp[] = [];
  for (let col = 0; col < COLUMNS; col++) {
    for (let qubit = 0; qubit < QUBITS; qubit++) {
      const cell = grid[col][qubit];
      if (!cell) continue;
      if (cell.id === "CNOT") {
        if (cell.partner === undefined || cell.partner === qubit) continue;
        ops.push({ id: "CNOT", control: qubit, target: cell.partner });
      } else {
        ops.push({ id: cell.id, target: qubit });
      }
    }
  }
  return ops;
}

/**
 * A miniature of QCanvas: build a circuit by clicking, watch the statevector
 * update exactly, and take real Qiskit, Cirq, or OpenQASM out the other side.
 *
 * Placement is click-then-click rather than drag: it works with a keyboard and on
 * a phone, which dragging does not.
 */
export default function CircuitSandbox() {
  const [grid, setGrid] = useState<Grid>(() => PRESETS[0].build());
  const [selected, setSelected] = useState<GateId>("H");
  const [target, setTarget] = useState<ExportTarget>("qasm");
  const [copied, setCopied] = useState(false);

  const ops = useMemo(() => gridToOps(grid), [grid]);
  const state = useMemo(() => simulate(QUBITS, ops), [ops]);
  const probs = useMemo(() => Array.from(probabilities(state)), [state]);
  const source = useMemo(() => exportCircuit(target, QUBITS, ops), [target, ops]);

  const place = (col: number, qubit: number) => {
    setGrid((current) => {
      const next = current.map((column) => [...column]);
      if (next[col][qubit]) {
        next[col][qubit] = null; // clicking a placed gate removes it
        return next;
      }
      if (selected === "CNOT") {
        // Control goes where you clicked; the target takes the next wire down.
        next[col][qubit] = { id: "CNOT", partner: (qubit + 1) % QUBITS };
      } else {
        next[col][qubit] = { id: selected };
      }
      return next;
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const maxProb = Math.max(...probs, 0.0001);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-12">
      <div>
        <MonoLabel>Gates</MonoLabel>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Gate to place">
          {PALETTE.map((gate) => (
            <button
              key={gate.id}
              type="button"
              role="radio"
              aria-checked={selected === gate.id}
              title={gate.hint}
              onClick={() => setSelected(gate.id)}
              className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selected === gate.id
                  ? "border-cryo bg-cryo/10 text-accent-type"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {gate.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {PALETTE.find((gate) => gate.id === selected)?.hint}
        </p>

        {/* The circuit. Wires are rows, time runs left to right. */}
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[26rem]">
            {Array.from({ length: QUBITS }, (_, qubit) => (
              <div key={qubit} className="flex items-center gap-2 py-1.5">
                <span className="readout w-8 shrink-0 text-2xs text-muted-foreground">q[{qubit}]</span>
                <div className="relative flex flex-1 items-center">
                  <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  <div className="relative grid flex-1 grid-cols-6 gap-1.5">
                    {Array.from({ length: COLUMNS }, (_, col) => {
                      const cell = grid[col][qubit];
                      const isCnotTarget = grid[col].some(
                        (other, index) => other?.id === "CNOT" && other.partner === qubit && index !== qubit,
                      );
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => place(col, qubit)}
                          aria-label={
                            cell
                              ? `Remove ${cell.id} on qubit ${qubit}, step ${col + 1}`
                              : `Place ${selected} on qubit ${qubit}, step ${col + 1}`
                          }
                          className={`relative flex h-9 items-center justify-center rounded-sm border font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            cell
                              ? "border-cryo bg-card text-accent-type"
                              : isCnotTarget
                                ? "border-cryo/40 bg-card text-accent-type"
                                : "border-transparent bg-transparent text-transparent hover:border-border hover:text-muted-foreground"
                          }`}
                        >
                          {cell?.id === "CNOT" ? "●" : (cell?.id ?? (isCnotTarget ? "⊕" : "+"))}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setGrid(preset.build())}
              title={preset.describe}
              className="rounded-md border border-border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setGrid(emptyGrid())}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw size={11} aria-hidden="true" />
            Clear
          </button>
        </div>

        {/* Export. This is the part that makes the toy useful. */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1" role="tablist" aria-label="Export format">
              {EXPORT_TARGETS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  role="tab"
                  aria-selected={target === format.id}
                  onClick={() => setTarget(format.id)}
                  className={`rounded-md px-2.5 py-1 font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    target === format.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-3 max-h-64 overflow-auto rounded-md border border-border bg-card p-4 text-2xs leading-relaxed text-foreground">
            <code>{source}</code>
          </pre>
        </div>
      </div>

      {/* Measurement outcomes: the reason to build the circuit at all. */}
      <div>
        <MonoLabel>Measurement probability</MonoLabel>
        <p className="mt-2 text-xs text-muted-foreground">
          Exact, from the statevector — not sampled. Qubit 0 is the rightmost bit, as in Qiskit.
        </p>
        <ul className="mt-5 flex flex-col gap-2">
          {probs.map((probability, index) => (
            <li key={index} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
              <span className="readout text-2xs text-muted-foreground">
                |{basisLabel(index, QUBITS)}⟩
              </span>
              <span aria-hidden="true" className="h-2 w-full bg-border/50">
                <span
                  className="block h-full bg-cryo transition-[width] duration-300"
                  style={{ width: `${(probability / maxProb) * 100}%` }}
                />
              </span>
              <span className="readout text-2xs text-foreground">
                {(probability * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
          <div>
            <dt className="label-mono">Gates</dt>
            <dd className="readout text-lg text-foreground">{ops.length}</dd>
          </div>
          <div>
            <dt className="label-mono">Two-qubit</dt>
            <dd className="readout text-lg text-foreground">
              {ops.filter((op) => op.id === "CNOT").length}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
