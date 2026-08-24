import { Suspense, lazy } from "react";
import { ArrowDown, ChartNoAxesCombined, CircuitBoard, Workflow } from "lucide-react";
import SpeedupBench from "@/components/bench/SpeedupBench";
import CircuitSandbox from "@/components/lab/CircuitSandbox";
import { AccentText, ChapterHeader, MonoLabel } from "@/components/kit/Primitives";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";

const PipelineTrace = lazy(() => import("@/components/lab/PipelineTrace"));

/**
 * The lab is where the claims are executable. Both pieces run entirely in the
 * browser — no backend, no API keys, nothing to keep alive.
 */
export default function LabPage() {
  useDocumentMeta({ ...routeMeta("/lab"), path: "/lab" });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Lab"
          title={
            <>
              Things you can <AccentText tone="neural">run</AccentText>, not just read about
            </>
          }
          lede="Three claims from the portfolio, exposed as runnable experiments. Everything happens in your browser: no account, backend, or API key required."
          as="h1"
          tone="neural"
        />

        <nav aria-label="Choose a lab experiment" className="mt-10 grid gap-2 sm:grid-cols-3">
          <a
            href="#lab-bench"
            className="group flex min-h-11 items-center gap-3 rounded-md border border-thermal/25 bg-thermal/5 px-4 py-3 text-primary-type transition-colors hover:border-thermal/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChartNoAxesCombined size={16} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="readout block text-2xs">01 · MEASURE</span>
              <span className="block text-sm font-semibold">Parallel speedup</span>
            </span>
            <ArrowDown size={13} className="transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
          <a
            href="#lab-circuit"
            className="group flex min-h-11 items-center gap-3 rounded-md border border-cryo/25 bg-cryo/5 px-4 py-3 text-cryo-type transition-colors hover:border-cryo/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CircuitBoard size={16} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="readout block text-2xs">02 · SIMULATE</span>
              <span className="block text-sm font-semibold">Quantum circuit</span>
            </span>
            <ArrowDown size={13} className="transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
          <a
            href="#lab-pipeline"
            className="group flex min-h-11 items-center gap-3 rounded-md border border-neural/25 bg-neural/5 px-4 py-3 text-neural-type transition-colors hover:border-neural/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Workflow size={16} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="readout block text-2xs">03 · VALIDATE</span>
              <span className="block text-sm font-semibold">Agent pipeline</span>
            </span>
            <ArrowDown size={13} className="transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
        </nav>

        <section id="lab-bench" aria-labelledby="lab-bench-title" className="mt-16 scroll-mt-24 border-t border-thermal/30 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lab-bench-title" className="text-2xl text-primary-type">
              Parallel speedup
            </h2>
            <MonoLabel className="text-primary-type">Web Workers · Mandelbrot escape-time</MonoLabel>
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
              <div className="mt-6 rounded-md border border-thermal/25 bg-thermal/5 p-4">
                <MonoLabel className="text-primary-type">How to read it</MonoLabel>
                <ol className="mt-3 flex flex-col gap-2.5">
                  <li className="flex gap-3">
                    <span className="readout text-2xs text-primary-type">01</span>
                    <span>The one-worker run is the baseline for every speedup point.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="readout text-2xs text-primary-type">02</span>
                    <span>Compare the measured curve with the ideal linear line.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="readout text-2xs text-primary-type">03</span>
                    <span>Run it again to see how scheduling noise changes the result.</span>
                  </li>
                </ol>
              </div>
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

        <section id="lab-circuit" aria-labelledby="lab-circuit-title" className="mt-20 scroll-mt-24 border-t border-cryo/30 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lab-circuit-title" className="text-2xl text-cryo-type">
              Circuit sandbox
            </h2>
            <MonoLabel className="text-cryo-type">3 qubits · exact statevector</MonoLabel>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A miniature of QCanvas, the platform that took third at the Huawei ICT national finals.
            Pick a gate, click a slot to place it, click again to remove it. The statevector is
            exact, and the source you get out runs as-is in Qiskit, Cirq, or any OpenQASM 3.0
            toolchain.
          </p>
          <div className="mt-5 grid max-w-3xl gap-2 text-sm sm:grid-cols-3">
            <p className="rounded-md border border-cryo/20 bg-cryo/5 p-3 text-muted-foreground">
              <span className="readout mr-2 text-cryo-type">01</span>
              Start with Bell pair, GHZ, or Uniform.
            </p>
            <p className="rounded-md border border-cryo/20 bg-cryo/5 p-3 text-muted-foreground">
              <span className="readout mr-2 text-cryo-type">02</span>
              Add or remove gates and read the exact probabilities.
            </p>
            <p className="rounded-md border border-cryo/20 bg-cryo/5 p-3 text-muted-foreground">
              <span className="readout mr-2 text-cryo-type">03</span>
              Export the same circuit to your framework.
            </p>
          </div>
          <div className="mt-8">
            <CircuitSandbox />
          </div>
        </section>

        <section id="lab-pipeline" aria-labelledby="lab-pipeline-title" className="mt-20 scroll-mt-24 border-t border-neural/30 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lab-pipeline-title" className="text-2xl text-neural-type">
              Validation loop
            </h2>
            <MonoLabel className="text-neural-type">Multi-agent pipeline · anime.js</MonoLabel>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The Cirq-RAG pipeline, drawn as it runs. The interesting edge is the one going
            backwards: when the validator can&apos;t compile or simulate the generated circuit, it
            sends it back to be patched. That loop is the difference between 52% and 92%.
          </p>
          <dl className="mt-6 grid max-w-3xl gap-5 border-y border-border py-5 sm:grid-cols-3">
            <div>
              <dt className="label-mono">Single-agent baseline</dt>
              <dd className="readout mt-1 text-2xl text-foreground">52%</dd>
            </div>
            <div>
              <dt className="label-mono text-neural-type">Validated pipeline</dt>
              <dd className="readout mt-1 text-2xl text-neural-type">92%</dd>
            </div>
            <div>
              <dt className="label-mono text-primary-type">Mechanism</dt>
              <dd className="mt-1 text-sm text-muted-foreground">Compile, simulate, patch, retry</dd>
            </div>
          </dl>
          <Suspense fallback={null}>
            <PipelineTrace className="mt-8" />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
