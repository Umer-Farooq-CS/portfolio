/**
 * A small exact statevector simulator.
 *
 * Conventions match Qiskit: qubit 0 is the least significant bit, so the basis
 * state index for |q2 q1 q0> is q0 + 2*q1 + 4*q2. Anything exported from here to
 * OpenQASM, Qiskit, or Cirq therefore lines up without re-indexing.
 *
 * Amplitudes are kept as two parallel Float64Arrays rather than objects: no
 * allocation per gate, and the pair-wise update below is the same access pattern
 * a real simulator uses.
 */

export type GateId = "H" | "X" | "Y" | "Z" | "S" | "T" | "CNOT";

export interface GateOp {
  id: GateId;
  /** Target qubit. For CNOT this is the qubit that flips. */
  target: number;
  /** Control qubit, CNOT only. */
  control?: number;
}

/** A 2×2 complex matrix, row-major: [[a, b], [c, d]]. */
type Matrix2 = readonly [
  readonly [number, number],
  readonly [number, number],
  readonly [number, number],
  readonly [number, number],
];

const INV_SQRT2 = 1 / Math.SQRT2;
const COS45 = Math.cos(Math.PI / 4);
const SIN45 = Math.sin(Math.PI / 4);

/** Each entry is [aRe, aIm], [bRe, bIm], [cRe, cIm], [dRe, dIm]. */
const SINGLE_QUBIT: Record<Exclude<GateId, "CNOT">, Matrix2> = {
  H: [
    [INV_SQRT2, 0],
    [INV_SQRT2, 0],
    [INV_SQRT2, 0],
    [-INV_SQRT2, 0],
  ],
  X: [
    [0, 0],
    [1, 0],
    [1, 0],
    [0, 0],
  ],
  Y: [
    [0, 0],
    [0, -1],
    [0, 1],
    [0, 0],
  ],
  Z: [
    [1, 0],
    [0, 0],
    [0, 0],
    [-1, 0],
  ],
  S: [
    [1, 0],
    [0, 0],
    [0, 0],
    [0, 1],
  ],
  T: [
    [1, 0],
    [0, 0],
    [0, 0],
    [COS45, SIN45],
  ],
};

export interface StateVector {
  qubits: number;
  re: Float64Array;
  im: Float64Array;
}

export function zeroState(qubits: number): StateVector {
  const size = 1 << qubits;
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  re[0] = 1;
  return { qubits, re, im };
}

function applySingle(state: StateVector, gate: Exclude<GateId, "CNOT">, target: number): void {
  const [[aRe, aIm], [bRe, bIm], [cRe, cIm], [dRe, dIm]] = SINGLE_QUBIT[gate];
  const { re, im } = state;
  const size = re.length;
  const bit = 1 << target;

  for (let i = 0; i < size; i++) {
    // Visit each |...0...> / |...1...> pair once.
    if ((i & bit) !== 0) continue;
    const j = i | bit;

    const x0Re = re[i];
    const x0Im = im[i];
    const x1Re = re[j];
    const x1Im = im[j];

    re[i] = aRe * x0Re - aIm * x0Im + bRe * x1Re - bIm * x1Im;
    im[i] = aRe * x0Im + aIm * x0Re + bRe * x1Im + bIm * x1Re;
    re[j] = cRe * x0Re - cIm * x0Im + dRe * x1Re - dIm * x1Im;
    im[j] = cRe * x0Im + cIm * x0Re + dRe * x1Im + dIm * x1Re;
  }
}

function applyCnot(state: StateVector, control: number, target: number): void {
  if (control === target) throw new Error("CNOT control and target must differ");
  const { re, im } = state;
  const size = re.length;
  const controlBit = 1 << control;
  const targetBit = 1 << target;

  for (let i = 0; i < size; i++) {
    // Swap the pair once: only when control is set and target is clear.
    if ((i & controlBit) === 0 || (i & targetBit) !== 0) continue;
    const j = i | targetBit;
    const tRe = re[i];
    const tIm = im[i];
    re[i] = re[j];
    im[i] = im[j];
    re[j] = tRe;
    im[j] = tIm;
  }
}

export function applyGate(state: StateVector, op: GateOp): void {
  if (op.target < 0 || op.target >= state.qubits) {
    throw new Error(`Target qubit ${op.target} is out of range`);
  }
  if (op.id === "CNOT") {
    if (op.control === undefined) throw new Error("CNOT needs a control qubit");
    if (op.control < 0 || op.control >= state.qubits) {
      throw new Error(`Control qubit ${op.control} is out of range`);
    }
    applyCnot(state, op.control, op.target);
    return;
  }
  applySingle(state, op.id, op.target);
}

/** Runs a circuit from |0…0> and returns the final state. */
export function simulate(qubits: number, ops: GateOp[]): StateVector {
  const state = zeroState(qubits);
  for (const op of ops) applyGate(state, op);
  return state;
}

/** Measurement probability of each basis state, in index order. */
export function probabilities(state: StateVector): Float64Array {
  const out = new Float64Array(state.re.length);
  for (let i = 0; i < out.length; i++) {
    out[i] = state.re[i] * state.re[i] + state.im[i] * state.im[i];
  }
  return out;
}

/** Basis label with qubit 0 on the right, matching the index convention. */
export function basisLabel(index: number, qubits: number): string {
  return index.toString(2).padStart(qubits, "0");
}

/** Per-qubit probability of measuring 1 — the marginal of each wire. */
export function qubitOneProbabilities(state: StateVector): number[] {
  const probs = probabilities(state);
  const result = new Array<number>(state.qubits).fill(0);
  for (let i = 0; i < probs.length; i++) {
    for (let q = 0; q < state.qubits; q++) {
      if ((i & (1 << q)) !== 0) result[q] += probs[i];
    }
  }
  return result;
}

/** Total probability. Should stay at 1 — a cheap check that the gates are unitary. */
export function norm(state: StateVector): number {
  let sum = 0;
  const probs = probabilities(state);
  for (const p of probs) sum += p;
  return sum;
}
