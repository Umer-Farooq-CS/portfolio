import { Suspense, lazy } from "react";
import SpeedupBench from "@/components/bench/SpeedupBench";
import CircuitSandbox from "@/components/lab/CircuitSandbox";
import { ChapterHeader, MonoLabel } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";

const PipelineTrace = lazy(() => import("@/components/lab/PipelineTrace"));

/**
 * The lab is where the claims are executable. Both pieces run entirely in the
 * browser — no backend, no API keys, nothing to keep alive.
 */
export default function LabPage() {
  useDocumentMeta({
    title: "Lab",
    path: "/lab",
    description:
      "Runnable demos: a parallel speedup benchmark measured on your own machine, and a quantum circuit sandbox that exports real OpenQASM, Qiskit, and Cirq.",
  });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Lab"
          title="Things you can run, not just read about"
          lede="Two of the claims on this site are executable. Both of these run in your browser: the benchmark uses your cores, and the simulator is exact rather than sampled."
        />

        <section aria-labelledby="lab-bench" className="mt-16 border-t border-border pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lab-bench" className="text-2xl text-foreground">
              Parallel speedup
            </h2>
            <MonoLabel>Web Workers · Mandelbrot escape-time</MonoLabel>
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p>
                The same compute-bound workload is run at one worker, then two, and so on, and timed.
                The payload in and out is a handful of numbers, so what you see is parallel compute
                rather than the cost of moving data between threads.
              </p>
              <p className="mt-4">
                The gap from the ideal line is real: scheduling, shared cache, and hyperthreaded cores
                that aren&apos;t whole cores. Each point is the best of two runs, after a warm-up pass,
                so a single scheduler hiccup doesn&apos;t become a data point.
              </p>
              <dl className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
                <div>
                  <dt className="label-mono">Workload</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    Mandelbrot escape-time over a band of rows
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Why this one</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    Compute-bound, embarrassingly parallel, and O(1) in and out
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Serial fraction</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    Karp&ndash;Flatt, from the measured speedup at the highest worker count
                  </dd>
                </div>
              </dl>
            </div>
            <SpeedupBench />
          </div>
        </section>

        <section aria-labelledby="lab-circuit" className="mt-20 border-t border-border pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lab-circuit" className="text-2xl text-foreground">
              Circuit sandbox
            </h2>
            <MonoLabel>3 qubits · exact statevector</MonoLabel>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A miniature of QCanvas, the platform that took third at the Huawei ICT national finals.
            Pick a gate, click a slot to place it, click again to remove it. The statevector is
            exact, and the source you get out runs as-is in Qiskit, Cirq, or any OpenQASM 3.0
            toolchain.
          </p>
          <div className="mt-8">
            <CircuitSandbox />
          </div>
        </section>

        <section aria-labelledby="lab-pipeline" className="mt-20 border-t border-border pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lab-pipeline" className="text-2xl text-foreground">
              Validation loop
            </h2>
            <MonoLabel>Multi-agent pipeline · anime.js</MonoLabel>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The Cirq-RAG pipeline, drawn as it runs. The interesting edge is the one going
            backwards: when the validator can&apos;t compile or simulate the generated circuit, it
            sends it back to be patched. That loop is the difference between 52% and 92%.
          </p>
          <Suspense fallback={null}>
            <PipelineTrace className="mt-8" />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
