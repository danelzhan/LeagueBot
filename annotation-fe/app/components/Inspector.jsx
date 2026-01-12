"use client";

export function Inspector({
  labels,
  selectedLabel,
  onSelectLabel,
  newLabel,
  onNewLabelChange,
  onAddLabel,
  visibleAnnotations,
  activeImage,
  onDeleteAnnotation,
}) {
  return (
    <aside className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 lg:w-96">
      <h2
        className="text-2xl font-semibold text-slate-50"
        style={{ fontFamily: "Newsreader, serif" }}
      >
        Inspector
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Select a label, draw your boxes, and manage annotations.
      </p>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Active Label
          </label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            value={selectedLabel}
            onChange={(event) => onSelectLabel(event.target.value)}
          >
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Add Label
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              placeholder="e.g. Building"
              value={newLabel}
              onChange={(event) => onNewLabelChange(event.target.value)}
            />
            <button
              type="button"
              className="rounded-xl bg-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
              onClick={onAddLabel}
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Annotations ({visibleAnnotations.length})
            </label>
            <span className="text-xs text-slate-500">
              {activeImage ? "Current image" : "No image"}
            </span>
          </div>
          <div className="mt-3 max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            {visibleAnnotations.length === 0 ? (
              <p className="text-sm text-slate-500">
                No annotations for this label yet.
              </p>
            ) : (
              visibleAnnotations.map((annotation, index) => (
                <div
                  key={`${annotation.label}-row-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-100">
                      {annotation.label}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold uppercase tracking-wide text-rose-300"
                      onClick={() => onDeleteAnnotation(index)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <span>startX: {annotation.startX}</span>
                    <span>startY: {annotation.startY}</span>
                    <span>endX: {annotation.endX}</span>
                    <span>endY: {annotation.endY}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
