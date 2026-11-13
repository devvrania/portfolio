import { site, visible, type Project } from "@/content/site";
import { KairoStage } from "@/components/kairo-stage";
import { Section, Chip, DraftBadge, ButtonLink } from "@/components/ui";

function ProjectCard({ p }: { p: Project }) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-panel ${p.draft ? "border-dashed border-blossom/40" : "border-line"} ${p.image ? "md:grid md:grid-cols-[1.1fr_1fr]" : ""}`}
    >
      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element -- static project art
        <img src={p.image} alt="" className="h-56 w-full object-cover object-[30%_center] md:h-full" />
      )}
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="text-xl font-semibold">{p.name}</h3>
          {p.links.map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent hover:underline">
              {l.label} ↗
            </a>
          ))}
          {p.draft && <DraftBadge />}
        </div>
        <p className="mt-3 leading-relaxed text-muted">{p.summary}</p>
        <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted">
          {p.highlights.map(h => (
            <li key={h} className="flex gap-3"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />{h}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">{p.stack.map(s => <Chip key={s}>{s}</Chip>)}</div>
      </div>
    </article>
  );
}

export default function Home() {
  const projects = visible(site.projects);
  const work = projects.filter(p => p.kind === "work");
  const personal = projects.filter(p => p.kind === "personal");
  const experience = visible(site.experience);

  // sections in page order; ones with nothing to show (e.g. only drafts, in production) drop out and the rest renumber
  const sections = ["about", ...(experience.length ? ["experience"] : []), "projects", "skills", "contact"];
  const num = (id: string) => String(sections.indexOf(id) + 1).padStart(2, "0");

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-line/60 bg-bg/70 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <a href="#top" className="font-mono text-sm font-semibold">
            <span className="text-accent">&lt;</span>{site.handle}<span className="text-accent">/&gt;</span>
          </a>
          <ul className="hidden gap-6 text-sm text-muted sm:flex">
            {sections.map(id => (
              <li key={id}><a href={`#${id}`} className="capitalize transition hover:text-ink">{id}</a></li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="top">
        {/* Hero: Kairo's desk, live, filling most of the first screen. The intro only overlaps its faded bottom edge, so he stays in view. */}
        <section aria-label="Introduction">
          <div className="relative h-[82svh] max-h-[880px] min-h-[480px] overflow-hidden">
            <KairoStage />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg to-transparent" />
          </div>
          <div className="relative mx-auto -mt-16 max-w-5xl px-6 pb-8 md:-mt-20">
            <p className="font-mono text-sm text-blossom">Hey, I&apos;m {site.name} 👋</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              I build software that feels <span className="text-accent">thoughtful</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted md:text-lg">{site.role}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="#projects" primary>See my work</ButtonLink>
              <ButtonLink href={site.links.linkedin}>LinkedIn</ButtonLink>
              <ButtonLink href={site.links.github}>GitHub</ButtonLink>
            </div>
          </div>
        </section>

        <Section id="about" index={num("about")} title="About me">
          <div className="grid gap-10 md:grid-cols-[1fr_auto]">
            <div className="space-y-5 text-lg leading-relaxed text-muted">
              {site.about.map(p => <p key={p.slice(0, 24)}>{p}</p>)}
              <p className="text-base">
                The character at the top is <span className="text-ink">Kairo</span>, my 3D coding companion. Move your
                cursor over his room and he&apos;ll follow it; click him and he&apos;ll say hi.
              </p>
            </div>
            <aside className="h-fit rounded-2xl border border-line bg-panel p-6 md:w-72">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
              <img src="/images/kairo-avatar.jpg" alt="" className="h-20 w-20 rounded-full ring-2 ring-accent/50" />
              <p className="mt-5 font-semibold">{site.fullName}</p>
              <p className="text-sm text-muted">Software Engineer</p>
              <p className="mt-5 font-mono text-xs uppercase tracking-widest text-muted">Education</p>
              <p className="mt-2 font-semibold">{site.education.degree}</p>
              <p className="text-sm text-muted">{site.education.school}</p>
              <p className="mt-1 font-mono text-xs text-muted">{site.education.years}</p>
            </aside>
          </div>
          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            {site.impact.map(s => (
              <div key={s.value + s.label} className="rounded-2xl border border-line bg-panel p-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-4xl font-semibold tracking-tight text-accent">{s.value}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {experience.length > 0 && (
          <Section id="experience" index={num("experience")} title="Where I've worked">
            <ol className="relative space-y-10 border-l border-line pl-8">
              {experience.map(r => (
                <li key={`${r.company}-${r.period}`} className="relative">
                  <span aria-hidden className="absolute -left-[37px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg" />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold">{r.title} <span className="text-muted">· {r.company}</span></h3>
                    <span className="font-mono text-xs text-muted">{r.period}{r.location ? ` · ${r.location}` : ""}</span>
                    {r.draft && <DraftBadge />}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                    {r.points.map(pt => (
                      <li key={pt} className="flex gap-3"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />{pt}</li>
                    ))}
                  </ul>
                  {r.stack && <div className="mt-5 flex flex-wrap gap-2">{r.stack.map(s => <Chip key={s}>{s}</Chip>)}</div>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        <Section id="projects" index={num("projects")} title="Things I've built">
          {work.length > 0 && (
            <>
              <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">Client work</h3>
              <div className="grid gap-6">{work.map(p => <ProjectCard key={p.name} p={p} />)}</div>
            </>
          )}
          {personal.length > 0 && (
            <>
              <h3 className="mb-5 mt-14 font-mono text-xs uppercase tracking-widest text-muted">Personal projects</h3>
              <div className="grid gap-6">{personal.map(p => <ProjectCard key={p.name} p={p} />)}</div>
            </>
          )}
        </Section>

        <Section id="skills" index={num("skills")} title="Tech I work with">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {site.skills.map(s => (
              <div key={s.group}>
                <h3 className="text-sm font-semibold text-ink">{s.group}</h3>
                <div className="mt-3 flex flex-wrap gap-2">{s.items.map(i => <Chip key={i}>{i}</Chip>)}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="contact" index={num("contact")} title="Let's build something">
          <div className="rounded-2xl border border-line bg-panel p-8 md:p-12">
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              I&apos;m always happy to talk about full-stack work, AI-powered products, or a project you&apos;re planning.
              Email or LinkedIn both reach me.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {site.links.email && <ButtonLink href={`mailto:${site.links.email}`} primary>{site.links.email}</ButtonLink>}
              <ButtonLink href={site.links.linkedin} primary={!site.links.email}>LinkedIn</ButtonLink>
              <ButtonLink href={site.links.github}>GitHub</ButtonLink>
              {site.links.resume && <ButtonLink href={site.links.resume}>Résumé</ButtonLink>}
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {site.fullName}. Born to conquer, wired to create. ✦</p>
          <p>Kairo&apos;s 3D model: AvatarSample_C by VRoid Project.</p>
        </div>
      </footer>
    </>
  );
}
