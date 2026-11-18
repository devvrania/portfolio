import { site, visible, type Project } from "@/content/site";
import { KairoStage } from "@/components/kairo-stage";
import { Splash } from "@/components/splash";
import { RoleCycler } from "@/components/role-cycler";
import { ProjectDetails } from "@/components/project-details";
import { LoopVideo } from "@/components/loop-video";
import { Section, Chip, DraftBadge, ButtonLink } from "@/components/ui";
import { CountUp, RevealCard, RevealGroup } from "@/components/reveal";
import { CopyEmail } from "@/components/copy-email";
import { BookCall } from "@/components/book-call";

/** Position of a tag in its row, so the tags pop in one after another (see .skill-chip in globals.css). */
const chipIndex = (n: number) => ({ "--i": n }) as React.CSSProperties;

/** Renders **double-asterisk** spans in site copy as highlighted text. */
const highlight = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} className="font-medium text-ink">{part}</strong> : part));

/**
 * A screenshot of the project's live site in a small browser window: three dots and the address, so it reads as a
 * real website at a glance. The whole preview links to the site.
 */
function SitePreview({ src, video, link, roomForClose = false, sizes }: { src: string; video?: string; link?: { label: string; href: string }; roomForClose?: boolean; sizes: string }) {
  // each screenshot comes in two widths, name.jpg (1600px) and name-800.jpg; the browser picks by layout width and screen density
  const small = src.replace(/\.jpg$/, "-800.jpg");
  const frame = (
    <>
      <div className={`flex items-center gap-3 border-b border-line bg-panel-2 py-2 pl-3 ${roomForClose ? "pr-12" : "pr-3"}`}>
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent/80" />
          <span className="h-2 w-2 rounded-full bg-blossom/60" />
          <span className="h-2 w-2 rounded-full bg-line" />
        </span>
        {link && (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-md bg-bg/70 px-2.5 py-1 font-mono text-[11px] text-muted">
            <svg aria-hidden viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
            {link.label}
          </span>
        )}
      </div>
      <div className="aspect-[16/10] overflow-hidden">
        {video ? (
          <LoopVideo src={video} poster={src} className="h-full w-full object-cover object-top transition duration-500 group-hover/card:scale-[1.03] motion-reduce:group-hover/card:scale-100" />
        ) : (
        // eslint-disable-next-line @next/next/no-img-element -- static screenshot, already sized
        <img src={src} srcSet={`${small} 800w, ${src} 1600w`} sizes={sizes} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition duration-500 group-hover/card:scale-[1.03] motion-reduce:group-hover/card:scale-100" />
        )}
      </div>
    </>
  );
  return link ? (
    <a href={link.href} target="_blank" rel="noreferrer" aria-label={`Open ${link.label} (new tab)`} className="block border-b border-line">
      {frame}
    </a>
  ) : (
    <div className="border-b border-line">{frame}</div>
  );
}

/** How many stack chips a card shows before collapsing the rest into "+N" (the full list is in Details). */
const CHIPS = 5;

/**
 * A compact project card for the grid: name and link, a one-line summary and the main stack.
 * "Details" opens the full write-up in a modal panel, so opening one never reshapes the grid.
 * Cards in a row share a height, with Details pinned to the bottom so the toggles line up.
 */
function ProjectCard({ p, cols }: { p: Project; cols: number }) {
  const extra = p.stack.length - CHIPS;
  return (
    <article
      className={`group/card flex flex-col overflow-hidden rounded-2xl border bg-panel transition duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_40px_-12px_rgba(255,59,92,.25)] motion-reduce:hover:translate-y-0 ${p.draft ? "border-dashed border-blossom/40" : "border-line"}`}
    >
      {p.image && <SitePreview src={p.image} video={p.video} link={p.links[0]} sizes={cols >= 3 ? "(min-width: 1024px) 20rem, (min-width: 768px) 45vw, 100vw" : "(min-width: 768px) 30rem, 100vw"} />}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-snug">{p.name}</h3>
          {p.draft && <DraftBadge />}
        </div>
        {p.links.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-4">
            {p.links.map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent hover:underline">
                {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>
        <RevealGroup className="skill-group mt-5 flex flex-wrap gap-2">
          {p.stack.slice(0, CHIPS).map((s, n) => <Chip key={s} className="skill-chip" style={chipIndex(n)}>{s}</Chip>)}
          {extra > 0 && <Chip className="skill-chip" style={chipIndex(CHIPS)}>+{extra}</Chip>}
        </RevealGroup>

        <div className="mt-auto pt-5">
          <ProjectDetails title={p.name}>
            {p.image && <SitePreview src={p.image} video={p.video} link={p.links[0]} roomForClose sizes="(min-width: 768px) 44rem, 100vw" />}
            <div className={`p-6 md:p-8 ${p.image ? "" : "pt-12"}`}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{p.kind === "work" ? "Client work" : "Personal project"}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{p.name}</h3>
              {p.links.map(l => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="mr-4 mt-1 inline-block font-mono text-xs text-accent hover:underline">
                  {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
              <p className="mt-4 leading-relaxed text-muted">{p.summary}</p>
              <h4 className="mt-7 font-mono text-xs uppercase tracking-widest text-muted">What I did</h4>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink/85">
                {p.highlights.map(h => (
                  <li key={h} className="flex gap-3"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />{h}</li>
                ))}
              </ul>
              <h4 className="mt-7 font-mono text-xs uppercase tracking-widest text-muted">Stack</h4>
              <RevealGroup className="skill-group mt-3 flex flex-wrap gap-2">
                {p.stack.map((s, n) => <Chip key={s} className="skill-chip" style={chipIndex(n)}>{s}</Chip>)}
              </RevealGroup>
            </div>
          </ProjectDetails>
        </div>
      </div>
    </article>
  );
}

/**
 * Grid for a group of cards: three across only when there are three or more, so two projects don't leave a gap.
 * Cards share their row's height (Details lines up), unless the group mixes cards with and without a site preview:
 * then each keeps its own height, so a text-only card isn't stretched into a tall empty box.
 */
const gridFor = (group: Project[]) => {
  const mixed = group.some(p => p.image) && group.some(p => !p.image);
  return `${group.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"} ${mixed ? "items-start" : ""}`;
};

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
            <RevealGroup className="about-text space-y-5 text-lg leading-relaxed text-muted">
              {site.about.map((p, n) => (
                <p key={p.slice(0, 24)} className={n === 0 ? "text-xl leading-relaxed text-ink/90 md:text-2xl md:leading-snug" : ""}>
                  {highlight(p)}
                </p>
              ))}
              <p className="flex gap-3 rounded-xl border border-line bg-panel/60 px-4 py-3 text-base">
                <span aria-hidden className="mt-0.5 text-accent">✦</span>
                <span>
                  The character at the top is <a href="#top" className="text-ink underline decoration-accent/50 underline-offset-4 hover:decoration-accent">Kairo</a>,
                  my 3D coding companion. Move your cursor over his room and he&apos;ll follow it; click him and he&apos;ll say hi.
                </span>
              </p>
            </RevealGroup>
            <RevealCard as="aside" className="h-fit rounded-2xl border border-line bg-panel p-6 md:w-72">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
              <img src="/images/kairo-avatar.jpg" alt="" className="avatar-ring h-20 w-20 rounded-full ring-2 ring-accent/50" />
              <p className="mt-5 font-semibold">{site.fullName}</p>
              <p className="text-sm text-muted">Software Engineer</p>
              <p className="mt-5 font-mono text-xs uppercase tracking-widest text-muted">Education</p>
              <p className="mt-2 font-semibold">{site.education.degree}</p>
              <p className="text-sm text-muted">{site.education.school}</p>
              <p className="mt-1 font-mono text-xs text-muted">{site.education.years}</p>
            </RevealCard>
          </div>
          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            {site.impact.map((s, i) => (
              <RevealCard key={s.value + s.label} delay={i * 120} className="rounded-2xl border border-line bg-panel p-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-4xl font-semibold tracking-tight text-accent">
                    <CountUp value={s.value} delay={i * 120 + 150} />
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{s.label}</span>
                </dd>
              </RevealCard>
            ))}
          </dl>
        </Section>

        {experience.length > 0 && (
          <Section id="experience" index={num("experience")} title="Where I've worked">
            <ol className="relative space-y-8 pl-8">
              {/* timeline: crimson at the latest role, fading into the background */}
              <span aria-hidden className="absolute bottom-0 left-0 top-2 w-px bg-gradient-to-b from-accent/70 via-line to-transparent" />
              {experience.map(r => {
                const current = /present/i.test(r.period);
                return (
                  <li key={`${r.company}-${r.period}`} className="relative">
                    <span aria-hidden className="absolute -left-[37px] top-7 grid h-2.5 w-2.5 place-items-center">
                      {current && <span className="timeline-ping absolute h-full w-full rounded-full bg-accent" />}
                      <span className="relative h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg" />
                    </span>
                    <RevealCard className="rounded-2xl border border-line bg-panel p-6 md:p-7">
                      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                        <div>
                          <h3 className="text-lg font-semibold">{r.title}</h3>
                          <p className="text-sm text-muted">
                            <span className="font-medium text-ink/90">{r.company}</span>
                            {r.location ? ` · ${r.location}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {current && (
                            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-accent">
                              Current
                            </span>
                          )}
                          <span className="font-mono text-xs text-muted">{r.period}</span>
                          {r.draft && <DraftBadge />}
                        </div>
                      </div>
                      <RevealGroup className="stagger-list mt-5">
                        <ul className="space-y-2.5 text-sm leading-relaxed text-muted">
                          {r.points.map((pt, n) => (
                            <li key={pt} className="flex gap-3" style={chipIndex(n)}>
                              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                              <span>{highlight(pt)}</span>
                            </li>
                          ))}
                        </ul>
                      </RevealGroup>
                      {r.stack && (
                        <RevealGroup className="skill-group mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                          {r.stack.map((s, n) => <Chip key={s} className="skill-chip" style={chipIndex(n)}>{s}</Chip>)}
                        </RevealGroup>
                      )}
                    </RevealCard>
                  </li>
                );
              })}
            </ol>
          </Section>
        )}

        <Section id="projects" index={num("projects")} title="Things I've built">
          {work.length > 0 && (
            <>
              <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">Client work</h3>
              <div className={`grid gap-6 ${gridFor(work)}`}>{work.map(p => <ProjectCard key={p.name} p={p} cols={work.length} />)}</div>
            </>
          )}
          {personal.length > 0 && (
            <>
              <h3 className="mb-5 mt-14 font-mono text-xs uppercase tracking-widest text-muted">Personal projects</h3>
              <div className={`grid gap-6 ${gridFor(personal)}`}>{personal.map(p => <ProjectCard key={p.name} p={p} cols={personal.length} />)}</div>
            </>
          )}
        </Section>

        <Section id="skills" index={num("skills")} title="Tech I work with">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {site.skills.map(s => (
              <RevealGroup key={s.group} className="skill-group">
                <h3 className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <span aria-hidden className="h-3.5 w-1 rounded-full bg-accent" />
                  {s.group}
                  <span className="font-mono text-xs font-normal text-muted">{s.items.length}</span>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.items.map((i, n) => (
                    <Chip key={i} className="skill-chip" style={chipIndex(n)}>{i}</Chip>
                  ))}
                </div>
              </RevealGroup>
            ))}
          </div>
        </Section>

        <Section id="contact" index={num("contact")} title="Let's build something">
          <RevealCard className="contact-card rounded-2xl border border-line bg-panel p-8 md:p-12">
            {site.availability && (
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span aria-hidden className="relative grid h-2 w-2 place-items-center">
                  <span className="timeline-ping absolute h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {site.availability}
              </p>
            )}
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              I&apos;m always happy to talk about full-stack work, AI-powered products, or a project you&apos;re planning.
              {site.links.booking
                ? " Pick a time for a short call, or reach me by email or LinkedIn."
                : " Email or LinkedIn both reach me."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {site.links.booking && <BookCall url={site.links.booking} primary>Book a call</BookCall>}
              {site.links.email && <ButtonLink href={`mailto:${site.links.email}`} primary={!site.links.booking}>{site.links.email}</ButtonLink>}
              {site.links.email && <CopyEmail email={site.links.email} />}
              <ButtonLink href={site.links.linkedin} primary={!site.links.email}>LinkedIn</ButtonLink>
              <ButtonLink href={site.links.github}>GitHub</ButtonLink>
              {site.links.resume && <ButtonLink href={site.links.resume}>Résumé</ButtonLink>}
            </div>
          </RevealCard>
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
