# دليل استخدام نظام ION — ION User Manual

Arabic RTL manual for the actual configuration of **testsite.local**, built with Astro and Starlight.

The September 12, 2026 revision compares effective DocType metadata and permissions,
active workflows, enabled Notifications, enabled Client/Server Scripts, relevant app
handlers, and the rendered Desk at `http://10.60.50.108:8001/app`.
It documents 103 DocTypes across 29 operational pages, with additional navigation,
help, and administrator guidance. Empty configured DocTypes are explicitly distinguished
from workflows with demonstrated stored usage.

The **October 25, 2026** revision adds the chapter **حجوزات الاشتراكات (RMT)** (`src/content/docs/rmt/`):
the Subscription Booking cycle, distributor Booking Settings, the Confirm dialog, sales documents,
Installation Notes, the ION RMT contract, the RMT workspace, the six RMT reports, and every RMT
error message. Its verified reference sections come from a read-only audit taken that day
(`audited_on` in the artifact; the renderer prints that date). Pages reviewed earlier keep their
September 12 reference until they are re-rendered.

## Develop and verify

Requires **Node >=22.12.0** (the default Node 18 on this host is too old; Node 22 is at
`~/.nvm/versions/node/v22.23.2/bin`).

```sh
npm install
npm run dev
npm run build
npm run check:docs
npm run preview
```

Deploy the static `dist/` directory. Set the production `site` URL in
`astro.config.mjs` when known. Arabic is the root locale, so routes have no `/ar/` prefix.

## Read-only site audit

From the bench's sites directory, using its Python environment:

```sh
/home/frappe/frappe-bench/env/bin/python /home/frappe/ion-manual/tools/audit-site.py
```

The script starts a **read-only database transaction**, reads configuration, writes a
private generated artifact at `/tmp/ion-manual-site-audit.json`, and rolls back.
It never saves a business document, runs a workflow, commits, modifies app source/JSON,
or runs a migration. Do not publish the raw artifact: live scripts and notification
templates may contain internal information.

`tools/manual-coverage.json` maps each operational page to its DocTypes and curated
Arabic purpose statements. `tools/render-site-reference.mjs` renders **an apply_patch
patch to stdout**, not direct edits, for the verified permissions/workflow/notification
sections:

```sh
node tools/render-site-reference.mjs /tmp/ion-manual-site-audit.json
# Optional: render one page only
node tools/render-site-reference.mjs /tmp/ion-manual-site-audit.json buying/material-request
```

Review the patch and apply it with the patch tool. Prose outside the marked generated
sections needs human/source review as well. The renderer deliberately rejects newly
encountered conditions without a reviewed user-facing explanation.

## Screenshots

`tools/shots.json` contains ION routes and DocTypes. The pipeline uses real Chromium
screenshots of unsaved full forms, existing Single settings, and Desk navigation.
It does not use synthetic screenshots or AI-generated interface images. All images
referenced by the revised manual use the `current-` prefix; original JPG assets remain
in the repository for history but are not used by the revised pages.

```sh
npx playwright-core install chromium
LOCAL_SESSION=1 node tools/screenshots.mjs
# Optional single group
LOCAL_SESSION=1 node tools/screenshots.mjs 'current-material-request'
```

`LOCAL_SESSION=1` is for this authorized local bench only. It reads existing
Administrator sessions with `tools/site-session.py` and passes session IDs only in
process memory; it neither resets a password nor creates a login session. Alternatively,
provide `SID` securely in the environment. Never put session tokens in the manifest,
logs, source, or command-line arguments. `BASE` and `CHROME` can override the site and
browser executable.

The capture context blocks business write requests. Standard view/session activity
may still occur on the server, as with ordinary browsing. It never clicks Save,
Submit, workflow actions, email, or integration sync. Employee/company defaults,
list rows, account identity, and BioTime connection values are masked. English UI
labels reflect the language actually rendered; the documenting user's language was
not changed.

Capture diagnostics are written to `/tmp/ion-manual-screenshot-report.json`.
A captured image proves rendered layout, not successful validation or role-specific
end-to-end operation. The audit intentionally did not submit financial/HR/stock
transactions, send mail, or contact BioTime.

Screenshots in the manual open in a keyboard-accessible full-size viewer. On mobile,
scroll inside the enlarged image to read fields; Escape or Close restores focus.

## Known configuration findings

See `src/content/docs/users/active-scripts.md` and the relevant DocType pages:

- Material Request's technical department/user fields are absent from effective metadata;
  its active workflow has no technical approval stage. A stale client call still errors.
- `Just to Test` marks new Email Queue rows/recipients Sent without delivering mail.
- Intercompany transfers create stock and journal entries through active Server Scripts.
- Workflow roles and base DocType permissions have mismatches in several places.
- Custom User Permission auto-creation returns without doing any work.
- Appraisal generation covers the 21st of the previous month through the 20th of the current month.

These are documented findings. **No Frappe app code, app JSON, site scripts, workflows,
permissions, or business data were edited; no bench migrate was run.**
