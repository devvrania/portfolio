import { site, visible, type Project } from "@/content/site";
import { KairoStage } from "@/components/kairo-stage";
import { Splash } from "@/components/splash";
import { RoleCycler } from "@/components/role-cycler";
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
      <Splash />
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
        {/* Hero: one screen tall, Kairo's desk filling it. Her name on the left and her role on the right frame him
            along the bottom. The room keeps its own lighting: only a short fade at the very bottom (into the page)
            and a soft dark patch right behind each text block, so the text reads without dimming the scene.
            The text layer lets the mouse through (except the buttons), so he still follows the cursor and says hi. */}
        <section aria-label="Introduction" className="relative h-[100svh] min-h-[620px] max-h-[1100px] overflow-hidden">
          <KairoStage />
          {/* bottom fade: on a phone the text stack covers the lower half, so fade more of it to give the text a calm
              dark ground (his face stays clear above); on wide screens just a short fade into the page */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-bg via-bg/85 to-transparent md:h-1/3 md:via-bg/60" />

          {/* Three blocks: who, what, where-to. On a wide screen "who" and the buttons stack on the left with "what" on
              the right; on a phone they read top to bottom in source order: name, role, buttons. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto grid max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2 md:items-end md:gap-x-8 md:pb-14">
            {/* who */}
            <div className="relative isolate md:col-start-1 md:row-start-1">
              <div aria-hidden className="absolute -inset-x-20 -inset-y-14 -z-10 bg-[radial-gradient(closest-side,rgb(14_10_16/0.8),transparent)]" />
              <p className="text-xl tracking-wide text-blossom md:text-2xl">Hello! I&apos;m</p>
              <h1 className="mt-1 text-5xl font-semibold uppercase leading-[0.95] tracking-wide md:text-6xl lg:text-7xl 2xl:text-8xl">
                {/* first name leads; the surname sits under it, smaller and letter-spaced out to about the same width */}
                <span className="block">{site.name}</span>
                <span className="mt-1 block text-[0.6em] tracking-[0.32em] text-ink/80">{site.fullName.split(" ").slice(1).join(" ")}</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-ink/85 md:text-xl">
                I build software that feels <span className="text-accent">thoughtful</span>.
              </p>
            </div>

            {/* right: what. The outlined word behind rolls through the kinds of engineering she does (Software,
                Full-Stack, Backend, AI) and fades downward; "ENGINEER" stays solid over its lower half */}
            {/* about a quarter smaller than her name so RANIA leads; sits a little higher and further right, clear of the mug */}
            <p className="relative isolate md:col-start-2 md:row-span-2 md:row-start-1 md:mb-10 md:self-end md:justify-self-end md:text-right lg:-mr-10 xl:-mr-20" aria-label="Software engineer: full-stack, backend and AI">
              <span aria-hidden className="absolute -inset-x-20 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgb(14_10_16/0.9),transparent)]" />
              <RoleCycler className="text-3xl font-semibold uppercase leading-none tracking-wide text-transparent [-webkit-text-stroke:2px_var(--color-accent)] [mask-image:linear-gradient(to_bottom,black_40%,transparent_95%)] md:text-5xl lg:text-[3.4rem] 2xl:text-7xl" />
              <span aria-hidden className="-mt-[0.45em] block text-3xl font-semibold uppercase leading-none tracking-wide md:text-5xl lg:text-[3.4rem] 2xl:text-7xl">
                Engineer
              </span>
            </p>

            {/* where to */}
            {/* phone: the main action full width, the two profile links sharing a row under it; wide: one row */}
            <div className="grid grid-cols-2 gap-3 md:col-start-1 md:row-start-2 md:flex md:flex-wrap">
              <ButtonLink href="#projects" primary className="col-span-2 justify-center">See my work</ButtonLink>
              <ButtonLink href={site.links.linkedin} className="justify-center">LinkedIn</ButtonLink>
              <ButtonLink href={site.links.github} className="justify-center">GitHub</ButtonLink>
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
