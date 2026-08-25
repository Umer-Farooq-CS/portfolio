import { SKILL_GROUPS } from "@/data/profile";
import type { ProfileConfig } from "@/data/profiles";
import { accent } from "@/lib/accent";

/**
 * The same skill groups and items every profile has — never filtered,
 * never invented — reordered by priority and, optionally, relabeled for the
 * active profile. `dense` drops the top border rhythm used on /about so /cv
 * can lay these out in its own two-column grid.
 */
export default function SkillsSection({ profile, dense = false }: { profile: ProfileConfig; dense?: boolean }) {
  const ordered = profile.skillGroupOrder
    .map((title) => SKILL_GROUPS.find((group) => group.title === title))
    .filter((group): group is (typeof SKILL_GROUPS)[number] => group !== undefined);

  if (dense) {
    return (
      <dl className="cv-columns grid gap-5 sm:grid-cols-2">
        {ordered.map((group) => {
          const tone = accent(group.accent);
          const label = profile.skillGroupLabelOverride?.[group.title] ?? group.title;
          return (
            <div key={group.title} className={`cv-entry border-t pt-3 ${tone.panel}`}>
              <dt className={`label-mono ${tone.label}`}>{label}</dt>
              <dd className="mt-1.5">
                <ul className="flex flex-col gap-1 text-sm leading-relaxed text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }

  return (
    <dl className="mt-5 flex flex-col">
      {ordered.map((group) => {
        const tone = accent(group.accent);
        const label = profile.skillGroupLabelOverride?.[group.title] ?? group.title;
        return (
          <div key={group.title} className={`border-t py-5 ${tone.panel}`}>
            <dt className={`text-sm font-semibold ${tone.value}`}>{label}</dt>
            <dd className="mt-2.5">
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span aria-hidden="true" className={`mt-2 h-1 w-1 shrink-0 rounded-full ${tone.mark}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
