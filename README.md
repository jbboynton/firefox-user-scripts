# Firefox user scripts

Small user scripts that remove clutter from websites I use every day.
Each script runs in [Violentmonkey][vm] and changes one site.

| Script | Site | What it does |
|---|---|---|
| `google-calendar-cleanup.js` | Google Calendar | Hides upsells and unused parts |
| `url-cleaner.js` | Many | Removes tracking data from links |

[vm]: https://violentmonkey.github.io/

## Google Calendar cleanup

The script hides these parts of Google Calendar:

- The "Upgrade" button in the header
- The Calendar and Tasks switch in the header
- The arrow that opens the side panel
- "Meet with…" and "Booking pages" in the sidebar
- The Birthdays and Tasks calendars in "My calendars"
- "Task" and "Appointment schedule" in the Create menu

Google Calendar places each calendar row with code, so a hidden row
would normally leave a gap. The script moves the rows below it up to
close the gap.

## Install

1. Install the [Violentmonkey][vm] extension in Firefox.
2. In Violentmonkey, click **+** and then **Install from URL**.
3. Enter the raw URL of the script, for example:

   ```text
   https://raw.githubusercontent.com/jbboynton/firefox-user-scripts/main/google-calendar-cleanup.js
   ```

4. Violentmonkey shows an install page. Click **Install**.

Violentmonkey checks the same URL for updates. It installs an update
when the `@version` number at the top of the script goes up.

## Configure

Each script lists what it hides near the top of the file. For
example, to keep the Birthdays calendar, remove `'Birthdays'` from
`CALENDARS` in `google-calendar-cleanup.js`.

> [!NOTE]
> The scripts find most elements by their label, such as "Upgrade".
> If you use Google Calendar in another language, change the labels
> to match.

## Contribute

These scripts are for my own use. However, you are welcome to open an
issue or a pull request.

To test a change, paste the script into Violentmonkey and reload the
site. There is no build step. Raise `@version` with every change, so
that installed copies update.

> [!WARNING]
> Google changes its page code often. If an element comes back, its
> label or structure probably changed.

## Source tour

- `*.js`: one script each. The block at the top of each file tells
  Violentmonkey which pages the script runs on.
- `LICENSES/`: the license text for scripts that came from other
  projects.

## License

`url-cleaner.js` is based on [General URL Cleaner Revived][gucr]
by dividedby. It is under the GNU General Public License, version 3
or later. The full text is in [`LICENSES/GPL-3.0.txt`][gpl].

[gucr]: https://github.com/dividedby/General-URL-Cleaner-Revived
[gpl]: LICENSES/GPL-3.0.txt
