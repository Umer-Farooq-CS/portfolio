import { EXPERIENCE, getExperiencePoints } from "@/data/cv";
import type { ProfileConfig } from "@/data/profiles";
import { accent } from "@/lib/accent";

/**
 * Same roles, same companies, same dates for every profile — only which of a
 * role's real bullet points lead, and in what order, changes per lens (via
 * getExperiencePoints). Matches /cv's original entry markup exactly,
 * including the hairline-tick bullet that survives the print rules (see
 * src/styles/print.css) — a round dot does not.
 */
export default function ExperienceSection({ profile }: { profile: ProfileConfig }) {
  const tone = accent("interface");

  return (
    <ul className="flex flex-col gap-7">
      {EXPERIENCE.map((job) => {
        const points = getExperiencePoints(job, profile.id);
        return (
          <li key={`${job.role}-${job.period}`} className="cv-entry">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h3 className={`text-lg ${tone.value}`}>{job.role}</h3>
              <p className={`readout text-2xs ${tone.label}`}>{job.period}</p>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {job.organisation} · {job.location}
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {points.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
                  <span aria-hidden="true" className={`mt-[0.7em] h-0 w-2 shrink-0 border-t ${tone.panel}`} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            {job.technologies && (
              <p className="mt-2.5 font-mono text-2xs text-muted-foreground">{job.technologies.join(" · ")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
