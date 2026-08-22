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
  If you actually use any of them, add them here and on your resume at the
  same time.

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

## The live site

**https://arman-kirakosyan.github.io**

Hosted on GitHub Pages from the public repo
[arman-kirakosyan/arman-kirakosyan.github.io](https://github.com/arman-kirakosyan/arman-kirakosyan.github.io).
HTTPS is enforced; plain `http://` redirects automatically.

### Updating the site

Edit the files here, then run these three commands from this folder:

```
git add -A
git commit -m "Describe what you changed"
git push
```

GitHub rebuilds the site automatically. It usually goes live within about a
minute. If it does not, check the Actions tab of the repo for a failed build.

### Notes on this setup

- The repo is **public**. That is required for GitHub Pages on the free plan;
  Pages from a private repo needs GitHub Pro. Being public does not let anyone
  edit it — only you can push. And a website's HTML, CSS, and JavaScript is
  readable by any visitor through "View Source" regardless of the repo, so a
  private repo would not have hidden the code anyway.
- The repo is named `arman-kirakosyan.github.io` on purpose. GitHub treats a
  repo matching your username as a "user site" and serves it at the short URL
  above instead of a longer `/repo-name/` path.
- `.nojekyll` stops GitHub running the files through Jekyll.
- Git identity is set **locally in this repo only**, so your global git config
  is untouched.

### If you ever want your own domain

Buy a domain, add a `CNAME` file containing just the domain name, and point
your DNS at GitHub. Then update the `canonical` and `og:url` tags in
`index.html` to match. Roughly $10-15 a year.

## How the motion works

All of it degrades safely — the page is fully readable with JavaScript off, and
every effect is disabled under the OS "reduce motion" setting.

| Effect | Where | Notes |
|---|---|---|
| Letter rise | Hero name | Pure CSS, staggered by a `--i` variable per letter |
| Progress bar | Top of viewport | Scales with scroll position |
| Counting numbers | Stats band | Falls back to the final number if animation is off |
| Card tilt + glow | Skill, education, certification cards | Mouse only — checks `pointerType` per event, so a touch never triggers it |
| Magnetic buttons | Main call-to-action buttons | Drifts toward the cursor, resets on leave |
| Rule draw | Section headings | Underline scales in as the heading enters view |
| Staggered reveal | Cards and sections | Siblings arrive in sequence rather than as a block |

To remove any of them, delete the matching `init...()` call at the bottom of
`script.js`. Nothing else depends on them.

## Checks already done

- Responsive from 320px up through desktop
- Semantic HTML with a single `<h1>` and a correct heading order
- Keyboard navigable, with a skip link and visible focus outlines
- Colour contrast passes WCAG AA
- Respects the system "reduce motion" setting
- Prints cleanly (try Cmd+P)
- Works with JavaScript disabled — nothing essential depends on it
