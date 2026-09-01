# دليل استخدام نظام ION — ION User Manual

Arabic, RTL user manual for every **ION** customization on top of **Frappe / ERPNext / HRMS**:
the `ion` (procurement), `ion_crm_sales` (sales & CRM), `aion_custom_hr` (HR), `ion_career`
(recruitment), `ion_intercompany_transfer`, and `biotime` apps. Built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build), modeled on the
`eims-manual` template.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in ./dist
npm run preview
```

## Deploying to Vercel

Static output, no adapter needed:

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

Set `site` in `astro.config.mjs` to the production URL so the sitemap is generated.

## Content

`src/content/docs/` — one directory per sidebar chapter, ordered by `sidebar.order`
in each page's frontmatter:

| Directory | Chapter | Source app |
| --- | --- | --- |
| `start/` | ابدأ من هنا | — |
| `buying/` | المشتريات (ION) | `ion` |
| `sales-crm/` | المبيعات وإدارة العملاء | `ion_crm_sales` |
| `hr/` | تخصيصات الموارد البشرية | `aion_custom_hr` |
| `career/` | التوظيف | `ion_career` |
| `intercompany/` | التحويل بين الشركات | `ion_intercompany_transfer` |
| `biotime/` | تكامل البصمة BioTime | `biotime` |
| `users/` | المستخدمون والأدوار | — |
| `help/` | المساعدة | — |

Arabic is the only locale (`locales.root` with `dir: 'rtl'`), so pages have no `/ar/` prefix.
The desk this manual documents runs mostly in English by default — screenshots and quoted
UI labels were captured after switching the documenting user's `Language` field to `ar`
(desk-wide translation coverage is partial; untranslated labels are quoted and glossed
in place, same convention as `eims-manual`).

## Screenshots

`src/assets/screens/` — PNG/JPG screenshots captured interactively from a live ION site
via the `claude-in-chrome` browser tool (an already-authenticated session), not the
headless `tools/screenshots.mjs` pipeline inherited from the `eims-manual` template —
this bench had no saved Administrator password available for a scripted login.

To regenerate a screenshot set with the scripted pipeline instead (e.g. once credentials
are available), the template is still in place:

```sh
npm i -D playwright-core
BASE=http://localhost:8000 PASSWORD=yourpassword node tools/screenshots.mjs
```

`tools/shots.json` is a starting template carried over from `eims-manual` — its URLs
reference EIMS record names and must be rewritten for ION's own doctypes/records before
the script is useful here.

`CHROME` overrides the browser binary path.

## Conventions used in the manual

- Every UI label is quoted **exactly as the desk renders it**, including English labels
  left untranslated (`Manager services`, `Additional Info`, field labels with typos
  preserved verbatim like `Bussniess unit` and `penalty managment`). Where a label has no
  Arabic translation, the English string is given with a gloss.
- Every error message is quoted verbatim, with its cause and fix — see `help/errors.md`.
- Automated behavior (scheduled jobs, auto-notifications, auto-calculated fields) is
  called out explicitly in `:::note` callouts wherever it changes what a user should
  expect to do manually vs. not.
