import { useMemo, useState } from "react";

import { learningBookEntries } from "../data/learningBook";

function LearningBook() {
  const [selectedId, setSelectedId] = useState("1-1");
  const [search, setSearch] = useState("");
  const [lessonIndex, setLessonIndex] = useState(0);

  const selectedEntry = useMemo(
    () => learningBookEntries.find((entry) => entry.id === selectedId) || learningBookEntries[0],
    [selectedId]
  );

  const selectedMilestoneIndex = learningBookEntries.findIndex((entry) => entry.id === selectedEntry.id);
  const currentLesson = selectedEntry.lessons[lessonIndex] || selectedEntry.lessons[0];

  const lessonPosition = useMemo(() => {
    const beforeCurrentMilestone = learningBookEntries
      .slice(0, selectedMilestoneIndex)
      .reduce((total, entry) => total + entry.lessons.length, 0);

    return beforeCurrentMilestone + lessonIndex;
  }, [lessonIndex, selectedMilestoneIndex]);

  const totalLessons = learningBookEntries.reduce((total, entry) => total + entry.lessons.length, 0);

  const visibleEntries = learningBookEntries.filter((entry) =>
    `${entry.id} ${entry.title} ${entry.summary}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectMilestone = (entryId) => {
    setSelectedId(entryId);
    setLessonIndex(0);
  };

  const goToLesson = (offset) => {
    const nextLessonIndex = lessonIndex + offset;

    if (nextLessonIndex >= 0 && nextLessonIndex < selectedEntry.lessons.length) {
      setLessonIndex(nextLessonIndex);
      return;
    }

    const nextMilestone = learningBookEntries[selectedMilestoneIndex + offset];

    if (nextMilestone) {
      setSelectedId(nextMilestone.id);
      setLessonIndex(offset > 0 ? 0 : nextMilestone.lessons.length - 1);
    }
  };

  return (
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            Mecha Training Database
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Learning Book</h1>
          <p className="mt-2 text-sm text-slate-300">Concepts, code patterns, and project implementation notes for real delivery work.</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <aside className="panel p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-slate-50">Table of Contents</h2>

          <input
            type="search"
            placeholder="Search module..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-4"
          />

          <div className="mt-4 space-y-3">
            {visibleEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`w-full rounded-2xl border p-3 text-left transition-all duration-200 ${
                  selectedEntry.id === entry.id
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                    : "border-slate-700 bg-slate-950/60 text-slate-200 hover:border-slate-500"
                }`}
                onClick={() => selectMilestone(entry.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">{entry.id}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{entry.lessons.length} lessons</span>
                </div>
                <p className="mt-2 text-base font-semibold">{entry.title}</p>
                <p className="mt-2 text-sm text-slate-300">{entry.summary}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="panel p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">{selectedEntry.id}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-50">{selectedEntry.title}</h2>
            </div>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-200">
              Lesson {lessonIndex + 1}/{selectedEntry.lessons.length}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-300">
            <span>Progress: {lessonPosition + 1}/{totalLessons}</span>
            <span>{selectedEntry.summary}</span>
          </div>

          <article className="mt-6 rounded-3xl border border-slate-700/70 bg-slate-950/60 p-4 sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">
              Chapter {selectedMilestoneIndex + 1} · Lesson {lessonIndex + 1}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-50">{currentLesson.title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-200">{currentLesson.explanation}</p>

            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Focus</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Connect the concept with the real Customer Outreach flow instead of memorizing patterns in isolation.</p>
            </div>

            <h4 className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-slate-400">Example Code</h4>
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-cyan-100"><code>{currentLesson.code}</code></pre>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">Code Explanation</h4>
                <p className="mt-2 text-sm leading-7 text-slate-200">{currentLesson.codeExplanation}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">Project Example</h4>
                <p className="mt-2 text-sm leading-7 text-slate-200">{currentLesson.projectExample}</p>
              </div>
            </div>
          </article>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" className="secondary-button" onClick={() => goToLesson(-1)} disabled={lessonPosition === 0}>
              Previous
            </button>
            <button type="button" className="primary-button" onClick={() => goToLesson(1)} disabled={lessonPosition === totalLessons - 1}>
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LearningBook;
