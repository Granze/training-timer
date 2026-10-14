# Training Timer

A web app to build and follow interval-based workout routines, with a guided timer that walks you through every exercise, series and rest period.

I built this project for **personal use**: I couldn't find a timer app that did exactly what I needed — namely, following a workout plan with per-exercise work/rest times (including ranges like "2-3 series" or "24-36s"), importing the plan my trainer gives me as a CSV file, and easily sharing workouts. So I made my own.

## Features

- **Workout builder**: create and edit workouts made of exercises, each with:
  - name
  - series (supports ranges, e.g. `2-3`)
  - repetitions (number, range, or `tempo` for timed exercises)
  - work time in seconds (supports ranges)
  - rest between series in seconds
  - rest between exercises in seconds
  - free-form notes (e.g. the weight used)
- **Guided workout player**: a full-screen timer that guides you through each phase of the workout — exercise, work countdown (for timed exercises), rest between series, rest between exercises — until the workout is complete.
- **Pause, resume and skip** any timer phase.
- **Audio and vibration feedback** when a timer ends (works on mobile).
- **Drag & drop** to reorder exercises in the editor.
- **CSV import/export**: load a workout plan from a CSV file (Italian headers: `Esercizio, Serie, Ripetizioni, Tempo Lavoro (s), Recupero Serie (s), Recupero Esercizio (s), Note`) or export your workout back to CSV.
- **Share via link**: generate a shareable URL for any workout (the data is compressed and embedded in the URL hash — no server needed). Recipients can open the link, preview the workout, save it or start it right away.
- **Local persistence**: workouts are stored in the browser's `localStorage`; every edit is saved immediately, so nothing is lost if the tab is closed.
- **Dark/light theme** toggle.
- **Fully client-side**: no accounts, no backend, no tracking.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

The production build is output to `dist/` and is configured to be served under the `/training-timer/` base path (see `vite.config.ts`).

## CSV format

The CSV file must include a header row with the following Italian column names (order is flexible):

```csv
Esercizio,Serie,Ripetizioni,Tempo Lavoro (s),Recupero Serie (s),Recupero Esercizio (s),Note
Panca piana,3,8-10,0,60,90,40kg
Squat,2-3,tempo,30-40,60,120,
```

- Numeric fields accept either a single number (`3`) or a range (`2-3`).
- Set `Ripetizioni` to `tempo` to make the exercise timed (the player will run a countdown using `Tempo Lavoro (s)`).
- `Note` is optional and free-form.

## License

This project is released under the [MIT License](LICENSE).
