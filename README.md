# Arman Kirakosyan — Personal Website

A single-page personal site. Plain HTML, CSS, and vanilla JavaScript — no build
step, no dependencies, no framework. Open `index.html` in a browser and it works.

```
index.html    All the content and page structure
styles.css    All the styling (colours live at the very top)
script.js     Mobile menu, scroll effects, contact form
resume.pdf    The file the "Download resume" buttons link to
```

---

## Where the content came from

Every factual statement on this site is taken from `resume.pdf`. Nothing was
invented, estimated, or padded. If you change something on your resume, change
it here too so the two never disagree — a recruiter will read both.

Your phone number is on the resume but is **deliberately not published on the
site** — email and LinkedIn are the contact routes. Anyone who downloads the
resume still gets it.

### About the Skills section

The first items in each card are the resume's own **Core Skills** list. Some
items are marked in `index.html` with a comment reading `from experience:`
followed by the exact resume line they come from — these are skills your resume
*describes in its bullets* but forgot to *list* in Core Skills. For example
"copywriting" appears in your NMU bullet but was missing from the skills list.

The **Communication & Collaboration** card is built entirely this way, mostly
from the refereeing bullets and the Profile paragraph.

Two consequences worth knowing:

1. Nothing here was inferred from what a marketing graduate "probably" knows.
   If a chip is not verbatim in the resume, a comment quotes the line it came
   from. You can defend every one of them in an interview.
2. **Your resume should be updated to match.** If the site lists copywriting and
   conflict de-escalation and your resume's skills section does not, the resume
   is the weaker document.

The per-role tag rows under each job in Experience work the same way — each tag
restates something from the bullets directly above it.

Nothing was added for these, because the resume does not contain them:

- GPA or coursework list
- Campaign metrics, follower counts, engagement rates, or other results
- Projects or portfolio pieces
- Awards or honours
- Specific software you were not documented as using. Canva, Adobe, Hootsuite,
  Buffer, Google Analytics, Meta Business Suite and similar tools are **not**
  on the site, even though someone doing your job would plausibly use them.
  If you actually use any of them, tell Claude and they can be added — and put
  them on your resume at the same time.

---

## Things to edit

Search `index.html` for `TODO-` to jump to each of these.

| # | What | Where |
|---|------|-------|
| TODO-1 | Replace `resume.pdf` whenever your resume changes. Keep the filename exactly `resume.pdf` and the links keep working. | folder root |
| TODO-2 | Add the real URL to the `og:url` meta tag once the site has a domain. | `<head>` |
| TODO-3 | Optional: add a portrait photo. Uncomment the block in the hero and save a square image as `portrait.jpg`. | Hero section |
| TODO-4 | Optional: add real projects. A commented-out scaffold sits just above the Contact section. | before Contact |
| TODO-5 | Update the "Seeking an entry-level marketing or sales role" line once you accept a role. It appears in the hero and in the About side card. | Hero + About |

---

## Common edits

**Change a colour.** Open `styles.css` and edit the values in the `:root` block
at the top — the whole site follows. If you swap the orange or the background,
re-check contrast at <https://webaim.org/resources/contrastchecker/>; the
current values all pass WCAG AA.

**Add a skill.** Find the right `<article class="skill-card">` in `index.html`
and add an `<li>` to its `<ul class="tags">`. Add it to your resume too.

**Add a job.** Copy one whole `<article class="role">` block in the Experience
section and edit the text. Roles are listed newest first.

**Change the contact form.** Right now it opens the visitor's own email app with
the message pre-filled — no server needed. To have messages delivered silently
instead, create a free form at <https://formspree.io>, then in `index.html`
replace the form's `data-mailto` attribute with
`action="https://formspree.io/f/YOUR_ID" method="POST"`, and delete the
`initContactForm` function from `script.js`.

---

## Publishing it

Any static host works, and all of these are free:

**Netlify Drop** — go to <https://app.netlify.com/drop> and drag this whole
folder onto the page. Live in about ten seconds. Easiest option.

**GitHub Pages** — create a repository, upload these files, then in
Settings → Pages set the source to your main branch. Your site appears at
`https://yourusername.github.io/repository-name`.

**Cloudflare Pages / Vercel** — connect the repository and deploy. No build
command and no output directory are needed; it is already plain HTML.

Once it is live, add the URL to your resume and your LinkedIn profile, and fill
in TODO-2 above.

---

## Checks already done

- Responsive from 320px up through desktop
- Semantic HTML with a single `<h1>` and a correct heading order
- Keyboard navigable, with a skip link and visible focus outlines
- Colour contrast passes WCAG AA
- Respects the system "reduce motion" setting
- Prints cleanly (try Cmd+P)
- Works with JavaScript disabled — nothing essential depends on it
