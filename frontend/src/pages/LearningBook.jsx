import { useMemo, useState } from "react";

import { learningBookEntries } from "../data/learningBook";

function LearningBook() {
  const [selectedId, setSelectedId] = useState("1-1");
  const [search, setSearch] = useState("");
  const [lessonIndex, setLessonIndex] = useState(0);

  const selectedEntry = useMemo(
    () =>
      learningBookEntries.find((entry) => entry.id === selectedId) ||
      learningBookEntries[0],
    [selectedId]
  );

  const selectedMilestoneIndex = learningBookEntries.findIndex(
    (entry) => entry.id === selectedEntry.id
  );

  const currentLesson = selectedEntry.lessons[lessonIndex] || selectedEntry.lessons[0];

  const lessonPosition = useMemo(() => {
    const beforeCurrentMilestone = learningBookEntries
      .slice(0, selectedMilestoneIndex)
      .reduce((total, entry) => total + entry.lessons.length, 0);

    return beforeCurrentMilestone + lessonIndex;
  }, [lessonIndex, selectedMilestoneIndex]);

  const totalLessons = learningBookEntries.reduce(
    (total, entry) => total + entry.lessons.length,
    0
  );

  const visibleEntries = learningBookEntries.filter((entry) =>
    `${entry.id} ${entry.title} ${entry.summary}`
      .toLowerCase()
      .includes(search.toLowerCase())
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Learning Book</h1>
          <p>Buku belajar full stack berdasarkan dokumentasi nyata project.</p>
        </div>
      </div>

      <div className="learning-book-layout">
        <aside className="learning-book-sidebar customer-list">
          <h2>Daftar Isi</h2>

          <input
            type="search"
            placeholder="Cari materi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {visibleEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`learning-book-item ${
                selectedEntry.id === entry.id ? "active" : ""
              }`}
              onClick={() => selectMilestone(entry.id)}
            >
              <span className="learning-book-code">{entry.id}</span>
              <strong>{entry.title}</strong>
              <small>{entry.summary}</small>
            </button>
          ))}
        </aside>

        <main className="learning-book-content customer-list">
          <div className="learning-book-header">
            <span className="learning-book-badge">{selectedEntry.id}</span>
            <h2>{selectedEntry.title}</h2>
          </div>

          <div className="learning-book-progress">
            <span>Pelajaran {lessonIndex + 1} dari {selectedEntry.lessons.length}</span>
            <span>Materi {lessonPosition + 1} dari {totalLessons}</span>
          </div>

          <p className="learning-book-summary">{selectedEntry.summary}</p>

          <article className="learning-book-reading-card">
            <span className="learning-book-section-number">
              Chapter {selectedMilestoneIndex + 1} · Pelajaran {lessonIndex + 1}
            </span>
            <h3>{currentLesson.title}</h3>
            <p className="learning-book-reading-text">{currentLesson.explanation}</p>

            <div className="learning-book-callout">
              <strong>Fokus belajar</strong>
              <p>Hubungkan konsep ini dengan alur nyata Customer Outreach, bukan hanya menghafal syntax.</p>
            </div>

            <h4>Contoh kode</h4>
            <pre><code>{currentLesson.code}</code></pre>

            <div className="learning-book-explanation">
              <h4>Penjelasan kode</h4>
              <p>{currentLesson.codeExplanation}</p>
            </div>

            <div className="learning-book-project-example">
              <h4>Di project ini</h4>
              <p>{currentLesson.projectExample}</p>
            </div>
          </article>

          <div className="learning-book-navigation">
            <button
              type="button"
              className="secondary-button"
              onClick={() => goToLesson(-1)}
              disabled={lessonPosition === 0}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => goToLesson(1)}
              disabled={lessonPosition === totalLessons - 1}
            >
              Berikutnya
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LearningBook;
