import { describe, expect, it } from "vitest";
import {
  basisLabel,
  norm,
  probabilities,
  qubitOneProbabilities,
  simulate,
  type GateOp,
} from "@/lib/quantum/statevector";
import { exportCircuit } from "@/lib/quantum/export";

const near = (actual: number, expected: number, tolerance = 1e-12) =>
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);

describe("statevector simulator", () => {
  it("starts in |0…0>", () => {
    const probs = probabilities(simulate(3, []));
    near(probs[0], 1);
    for (let i = 1; i < probs.length; i++) near(probs[i], 0);
  });

  it("X flips the right qubit under the little-endian convention", () => {
    // X on qubit 0 must give |001>, i.e. index 1 — not index 4.
    const probs = probabilities(simulate(3, [{ id: "X", target: 0 }]));
    near(probs[1], 1);
    near(probs[4], 0);
  });

  it("H produces an even superposition", () => {
    const probs = probabilities(simulate(1, [{ id: "H", target: 0 }]));
    near(probs[0], 0.5);
    near(probs[1], 0.5);
  });

  it("H twice is the identity", () => {
    const probs = probabilities(simulate(1, [{ id: "H", target: 0 }, { id: "H", target: 0 }]));
    near(probs[0], 1);
    near(probs[1], 0);
  });

  it("builds a Bell state", () => {
    const ops: GateOp[] = [
      { id: "H", target: 0 },
      { id: "CNOT", target: 1, control: 0 },
    ];
    const probs = probabilities(simulate(2, ops));
    near(probs[0], 0.5); // |00>
    near(probs[3], 0.5); // |11>
    near(probs[1], 0);
    near(probs[2], 0);
  });

  it("builds a GHZ state", () => {
    const ops: GateOp[] = [
      { id: "H", target: 0 },
      { id: "CNOT", target: 1, control: 0 },
      { id: "CNOT", target: 2, control: 0 },
    ];
    const probs = probabilities(simulate(3, ops));
    near(probs[0], 0.5); // |000>
    near(probs[7], 0.5); // |111>
    for (const i of [1, 2, 3, 4, 5, 6]) near(probs[i], 0);
  });

  it("keeps the state normalised through every gate", () => {
    const ops: GateOp[] = [
      { id: "H", target: 0 },
      { id: "T", target: 0 },
      { id: "S", target: 1 },
      { id: "Y", target: 2 },
      { id: "CNOT", target: 2, control: 0 },
      { id: "Z", target: 1 },
      { id: "H", target: 2 },
    ];
    near(norm(simulate(3, ops)), 1, 1e-10);
  });

  it("reports per-qubit marginals", () => {
    // Bell state: each qubit is 50/50, and they are perfectly correlated.
    const marginals = qubitOneProbabilities(
      simulate(2, [
        { id: "H", target: 0 },
        { id: "CNOT", target: 1, control: 0 },
      ]),
    );
    near(marginals[0], 0.5);
    near(marginals[1], 0.5);
  });

  it("rejects an out-of-range qubit and a self-controlled CNOT", () => {
    expect(() => simulate(2, [{ id: "X", target: 5 }])).toThrow();
    expect(() => simulate(2, [{ id: "CNOT", target: 0, control: 0 }])).toThrow();
  });

  it("labels basis states with qubit 0 on the right", () => {
    expect(basisLabel(1, 3)).toBe("001");
    expect(basisLabel(4, 3)).toBe("100");
  });
});

describe("circuit export", () => {
  const bell: GateOp[] = [
    { id: "H", target: 0 },
    { id: "CNOT", target: 1, control: 0 },
  ];

  it("emits runnable OpenQASM 3.0", () => {
    const source = exportCircuit("qasm", 2, bell);
    expect(source).toContain("OPENQASM 3.0;");
    expect(source).toContain('include "stdgates.inc";');
    expect(source).toContain("qubit[2] q;");
    expect(source).toContain("h q[0];");
    expect(source).toContain("cx q[0], q[1];");
    expect(source).toContain("c = measure q;");
  });

  it("emits Qiskit with matching qubit indices", () => {
    const source = exportCircuit("qiskit", 2, bell);
    expect(source).toContain("QuantumCircuit(2, 2)");
    expect(source).toContain("qc.h(0)");
    expect(source).toContain("qc.cx(0, 1)");
  });

  it("emits Cirq with matching qubit indices", () => {
    const source = exportCircuit("cirq", 2, bell);
    expect(source).toContain("cirq.LineQubit.range(2)");
    expect(source).toContain("cirq.H(q[0])");
    expect(source).toContain("cirq.CNOT(q[0], q[1])");
  });
});
