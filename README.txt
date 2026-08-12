GYM TRACKER — duration + setup build
====================================

Three changes, based on main @ 9b95d29 (commits ed0e79f, 90ecbd5):

  1. Hold-time logging for timed exercises (planks, dead hangs, wall
     sits, loaded carries), with a live stopwatch.
  2. Setup notes editable during a workout, saved back to the program.
  3. Goals can target a hold time, not just weight x reps.


RUN IT
------
This is the complete app. Open index.html in a browser and it works —
no build step, no install.

Note: opening the file directly (file://) works, but the service worker
and "install to home screen" need a real http:// origin. To get the full
PWA behaviour, serve the folder:

    cd gymtracker-duration-build
    python3 -m http.server 8000

then visit http://localhost:8000


YOUR DATA
---------
All workout data lives in the browser's localStorage, keyed to the origin
you load the app from. Loading this build from a different origin (a new
port, or file:// vs localhost) shows an empty app — the data is still
there under the old origin, not lost.

Before trying this build against real data, use
  MANAGE ATHLETES -> EXPORT BACKUP
from your existing install so you have a restore point.


WHAT CHANGED
------------
Exercises now track by REPS (default) or TIME. Timed sets store a
duration in seconds instead of reps; weight, RPE, rest and supersets work
exactly as before, so weighted planks and hangs log their added load
normally.

While logging a timed set you get a hold-time picker with a live
stopwatch — start it, hold, tap stop, and the elapsed time fills in.

Existing programs need no migration: timed exercises are detected by name
(Plank, Dead Hang, Wall Sit, L-Sit, carries, ...) and from the starter
templates' reps:"45s" form. Name matching is deliberately narrow, so
Hang Clean and Hanging Leg Raise stay rep-based lifts.

To change a specific exercise, open
  MANAGE ATHLETES -> BUILD / EDIT PROGRAM
and use the TRACK BY toggle (REPS / TIME) on that exercise.

Timed work now counts toward volume and muscle-stimulus totals via a
time-under-tension rep-equivalent (~3s per rep) instead of counting as
zero. History, progress views and the history CSV (new "Duration (s)"
column) all handle holds.

SETUP NOTES (editable mid-workout)
----------------------------------
Every exercise has a setup note for rack pins, block heights, platform
settings and cues. It already existed in the program editor; it is now
editable during a session too.

While an exercise is active, tap the "🔧" line under its name to edit in
place, then tap DONE. The edit saves back to the program day, so it is
there next session. Exercises further down the list show their setup
read-only, so you can see what to grab before you get there.

Freestyle sessions have no program day to write into, so edits there
apply to that session only.


HOLD-TIME GOALS
---------------
GOALS tab -> + NEW GOAL. The target has a REPS / ⏱ HOLD toggle, which
picks itself based on the exercise name and can be overridden.

For a hold goal the weight box is optional — leave it blank for a pure
bodyweight target (e.g. Plank, BW, 2:00), or fill it for weighted holds
(e.g. Dead Hang, 10 kg, 1:00). Progress tracks time held rather than
weight moved, and the goal completes when the hold is reached (and the
added weight, if you set one). Existing weight x reps goals are
unchanged.


THE PATCH FILE
--------------
gymtracker-changes.patch contains both commits, for landing them in the
repo:

    cd /path/to/gymtracker
    git checkout main && git pull origin main
    git checkout -b claude/exercise-duration-feature-c783gl
    git am /path/to/gymtracker-changes.patch
    git push -u origin claude/exercise-duration-feature-c783gl

If it reports the patch does not apply, main has moved since it was
written — run "git am --abort" then retry with "git am -3".
