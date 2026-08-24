import type { GateOp } from "./statevector";

/**
 * Emits source you can actually run, not pseudocode. The whole point of the
 * sandbox is that a circuit built by clicking comes out as a file you can paste
 * into a real toolchain.
 */

export type ExportTarget = "qasm" | "qiskit" | "cirq";

export const EXPORT_TARGETS: { id: ExportTarget; label: string; language: string }[] = [
  { id: "qasm", label: "OpenQASM 3.0", language: "qasm" },
  { id: "qiskit", label: "Qiskit", language: "python" },
  { id: "cirq", label: "Cirq", language: "python" },
];

function qasmGate(op: GateOp): string {
  if (op.id === "CNOT") return `cx q[${op.control}], q[${op.target}];`;
  return `${op.id.toLowerCase()} q[${op.target}];`;
}

function toQasm(qubits: number, ops: GateOp[]): string {
  const lines = [
    "OPENQASM 3.0;",
    'include "stdgates.inc";',
    "",
    `qubit[${qubits}] q;`,
    `bit[${qubits}] c;`,
    "",
  ];
  for (const op of ops) lines.push(qasmGate(op));
  lines.push("", "c = measure q;");
  return lines.join("\n");
}

function toQiskit(qubits: number, ops: GateOp[]): string {
  const lines = [
    "from qiskit import QuantumCircuit",
    "from qiskit.quantum_info import Statevector",
    "",
    `qc = QuantumCircuit(${qubits}, ${qubits})`,
  ];
  for (const op of ops) {
    if (op.id === "CNOT") lines.push(`qc.cx(${op.control}, ${op.target})`);
    else lines.push(`qc.${op.id.toLowerCase()}(${op.target})`);
  }
  lines.push("", "print(Statevector(qc).probabilities_dict())", "qc.measure_all()");
  return lines.join("\n");
}

function toCirq(qubits: number, ops: GateOp[]): string {
  const lines = [
    "import cirq",
    "",
    `q = cirq.LineQubit.range(${qubits})`,
    "circuit = cirq.Circuit(",
  ];
  const body: string[] = [];
  for (const op of ops) {
    if (op.id === "CNOT") body.push(`    cirq.CNOT(q[${op.control}], q[${op.target}]),`);
    else body.push(`    cirq.${op.id}(q[${op.target}]),`);
  }
  body.push(`    cirq.measure(*q, key="m"),`);
  lines.push(...body, ")", "", "print(circuit)", 'print(cirq.Simulator().simulate(circuit))');
  return lines.join("\n");
}

export function exportCircuit(target: ExportTarget, qubits: number, ops: GateOp[]): string {
  switch (target) {
    case "qasm":
      return toQasm(qubits, ops);
    case "qiskit":
      return toQiskit(qubits, ops);
    case "cirq":
      return toCirq(qubits, ops);
  }
}
