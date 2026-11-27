# Case study page template

Route: `app/projects/[slug]/page.tsx`, a server component with `generateStaticParams()` (all slugs) and `generateMetadata()` (title + subtitle). Call `notFound()` for unknown slugs. In Next 15+, `params` is a Promise: `const { slug } = await params`.

## Page structure (top to bottom)

1. **Back link**: "← Back to projects", with a small arrow that nudges left on hover
2. **Meta row**: year · / index · tag pill (pulsing accent dot when Live)
3. **Title**: `font-serif font-light italic text-5xl md:text-6xl leading-none`, with the mono subtitle below
4. **Hero image**: 16:9, `priority`, rounded-xl, with a GitHub pill over the top-right corner
5. **Actions**: View live ↗, GitHub, as round pills that scale on hover
6. **Overview**: one paragraph, the "why" and the "what"
7. **Features**: label + one-line detail
8. **Challenges → Solutions**: numbered pairs work best. Each challenge has the solution that answered it
9. **Architecture**: the folder tree or diagram in a mono `<pre>` (horizontal scroll on phones)
10. **Stack**: chips
11. **Learnings**: 3–5 bullets
12. **Next/previous project**: keep people moving through the archive

## Writing guidance

- Lead with the outcome ("disposable inboxes that expire in 24h"), not the stack.
- Use concrete numbers wherever they exist: latency, users, test coverage, data volume.
- A challenge is a real constraint, such as spec compliance, abuse or scale, not "learning React".
- Be honest about status: Live, In progress or Archived.
- Keep sentences short. These pages are scanned, not read.
