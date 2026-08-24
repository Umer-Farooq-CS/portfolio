import { AccentText, ChapterHeader, MonoLabel, Panel, PrimaryAction, QuietAction, Tag } from "@/components/kit/Primitives";
import { NOTES_ARE_PUBLIC, getPublishedNotes } from "@/data/notes";
import { accent } from "@/lib/accent";
import { useDocumentMeta } from "@/lib/meta";
import { routeMeta } from "@/data/routeMeta";

/**
 * The writing section, scaffolded ahead of the writing. The list renders from
 * src/data/notes.ts the moment a note stops being a draft; until then the page
 * is an empty state that names what will land here and where to go instead.
 *
 * src/data/notes.ts also exports NOTES_ARE_PUBLIC, which is what keeps the nav
 * from advertising a section with nothing in it.
 */

/** What the first notes are about — the same three claims the rest of the site makes. */
const SUBJECTS = [
  {
    title: "Parallel performance",
    detail:
      "Where measured speedup departs from the ideal line, and what the serial fraction says about why.",
    tone: "thermal",
  },
  {
    title: "Quantum simulation",
    detail:
      "Statevector and tensor-network methods, and the point at which a circuit stops fitting in memory.",
    tone: "cryo",
  },
  {
    title: "Verifiable AI output",
    detail: "Making a generated artefact prove itself — compile it, run it, and check the result.",
    tone: "neural",
  },
] as const;

export default function NotesPage() {
  const notes = getPublishedNotes();

  useDocumentMeta({
    ...routeMeta("/notes"),
    path: "/notes",
    // Nothing to index yet, and an empty section in search results is worse than none.
    noIndex: !NOTES_ARE_PUBLIC,
  });

  return (
    <div className="pb-20 pt-28 lg:pt-36">
      <div className="container">
        <ChapterHeader
          eyebrow="Notes"
          title={
            <>
              Working <AccentText tone="neural">notes</AccentText>
            </>
          }
          lede="Short write-ups on the parts of the work that are worth explaining once rather than repeating."
          as="h1"
          tone="neural"
        />

        {notes.length > 0 ? (
          <ul className="mt-14 max-w-3xl">
            {notes.map((note) => (
              <li key={note.slug} className="border-t border-border py-5 last:border-b">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-xl text-neural-type">{note.title}</h2>
                  <p className="readout text-2xs text-neural-type">
                    {note.date} · {note.readingMinutes} min
                  </p>
                </div>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {note.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => <Tag key={tag} tone="neural">{tag}</Tag>)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14 max-w-3xl">
            <Panel className="border-neural/25 p-6 sm:p-8">
              <MonoLabel className="text-neural-type">No notes published yet</MonoLabel>
              <p className="mt-3 max-w-prose text-base text-foreground">
                The first three are drafted and will appear here as they are finished. Each one takes
                a claim made elsewhere on this site and shows the working.
              </p>

              <dl className="mt-7 border-t border-border pt-5">
                {SUBJECTS.map((subject) => {
                  const tone = accent(subject.tone);
                  return (
                  <div
                    key={subject.title}
                    className="grid gap-x-6 gap-y-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)]"
                  >
                    <dt className={`label-mono sm:pt-0.5 ${tone.label}`}>{subject.title}</dt>
                    <dd className="text-sm leading-relaxed text-muted-foreground">
                      {subject.detail}
                    </dd>
                  </div>
                  );
                })}
              </dl>
            </Panel>

            <p className="mt-8 text-sm text-muted-foreground">
              Until then, the two places the same ground is already covered:
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryAction to="/lab">Run the benchmarks</PrimaryAction>
              <QuietAction to="/projects">Read the project write-ups</QuietAction>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
