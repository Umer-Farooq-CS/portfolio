import { AccentText, ChapterHeader } from "@/components/kit/Primitives";
import { USES_GROUPS } from "@/data/uses";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";
import { accent, type VisualAccent } from "@/lib/accent";

const GROUP_TONES: Record<string, VisualAccent> = {
  machine: "thermal",
  compute: "thermal",
  editor: "interface",
  toolchains: "cryo",
  services: "systems",
};

/**
 * A restrained inventory page: group accents make the long table scannable
 * without turning tool names or explanatory prose into decoration.
 *
 * Rows marked `todo` in src/data/uses.ts say "unconfirmed" instead of naming a
 * plausible part. An invented GPU model would make every measured number on the
 * site unverifiable.
 */
export default function UsesPage() {
  useDocumentMeta({ ...routeMeta("/uses"), path: "/uses" });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Uses"
          title={
            <>
              The <AccentText tone="thermal">machine</AccentText> and the{" "}
              <AccentText tone="cryo">toolchain</AccentText>
            </>
          }
          lede="What the code is written in, what the numbers were measured on, and what runs this site. Anything not confirmed is marked as such rather than filled in."
          as="h1"
          tone="interface"
        />

        <div className="mt-14 max-w-3xl">
          {USES_GROUPS.map((group, index) => {
            const tone = accent(GROUP_TONES[group.id] ?? "interface");
            return (
            <section key={group.id} aria-labelledby={`uses-${group.id}`} className="mt-10 first:mt-0">
              <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-4 ${tone.panel}`}>
                <h2 id={`uses-${group.id}`} className={`flex items-baseline gap-3 text-xl ${tone.value}`}>
                  <span aria-hidden="true" className="readout text-2xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{group.title}</span>
                </h2>
                {group.note && <p className="text-xs text-muted-foreground">{group.note}</p>}
              </div>

              <dl className="mt-4">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    data-todo={item.todo ? "true" : undefined}
                    className="grid gap-x-6 gap-y-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)]"
                  >
                    <dt className={`label-mono sm:pt-0.5 ${tone.label}`}>{item.label}</dt>
                    <dd
                      className={`text-sm leading-relaxed ${
                        item.todo ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.value}
                      {item.todo && (
                        <span className="label-mono ml-2 inline-block rounded-sm border border-border px-1.5 py-0.5 align-middle">
                          Unconfirmed
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
