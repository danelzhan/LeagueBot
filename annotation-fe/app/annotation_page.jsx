"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "./components/Canvas";
import { Inspector } from "./components/Inspector";

const DEFAULT_LABELS = ["Enemy Minions"];

export default function AnnotationPage() {
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [selectedLabel, setSelectedLabel] = useState(DEFAULT_LABELS[0]);
  const [annotations, setAnnotations] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadImages() {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error("Failed to load images");
        }
        const data = await response.json();
        if (!ignore) {
          setImages(data.images || []);
          setActiveImage(data.images?.[0]?.url || "");
        }
      } catch (error) {
        if (!ignore) {
          setImages([{ id: "placeholder", url: "/placeholder.svg" }]);
          setActiveImage("/placeholder.svg");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadImages();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const storedAnnotations = window.localStorage.getItem("annotations");
    const storedLabels = window.localStorage.getItem("labels");

    if (storedAnnotations) {
      try {
        setAnnotations(JSON.parse(storedAnnotations));
      } catch {
        setAnnotations([]);
      }
    }

    if (storedLabels) {
      try {
        const parsed = JSON.parse(storedLabels);
        if (Array.isArray(parsed) && parsed.length) {
          setLabels(parsed);
          setSelectedLabel(parsed[0]);
        }
      } catch {
        setLabels(DEFAULT_LABELS);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("annotations", JSON.stringify(annotations));
    window.localStorage.setItem("labels", JSON.stringify(labels));

    if (annotations.length) {
      fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotations }),
      }).catch(() => {});
    }
  }, [annotations, labels]);

  const visibleAnnotations = useMemo(
    () =>
      annotations.filter(
        (annotation) =>
          annotation.image_address === activeImage &&
          annotation.label === selectedLabel
      ),
    [annotations, activeImage, selectedLabel]
  );

  const handleAddLabel = () => {
    const cleaned = newLabel.trim();
    if (!cleaned || labels.includes(cleaned)) {
      setNewLabel("");
      return;
    }
    setLabels((prev) => [cleaned, ...prev]);
    setSelectedLabel(cleaned);
    setNewLabel("");
  };

  const handleCreateAnnotation = (annotation) => {
    setAnnotations((prev) => [annotation, ...prev]);
  };

  const handleDeleteAnnotation = (indexToDelete) => {
    const target = visibleAnnotations[indexToDelete];
    if (!target) return;
    setAnnotations((prev) => {
      const targetIndex = prev.indexOf(target);
      if (targetIndex === -1) return prev;
      return [...prev.slice(0, targetIndex), ...prev.slice(targetIndex + 1)];
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-32 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-10 lg:flex-row">
        <section className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Annotation Console
              </p>
              <h1
                className="text-3xl font-semibold text-slate-50"
                style={{ fontFamily: "Newsreader, serif" }}
              >
                Draw precise boxes and capture metadata
              </h1>
            </div>
            <div className="rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300">
              {isLoading ? "Loading images..." : `${images.length} image(s)`}
            </div>
          </div>

          <div className="mt-6">
            <Canvas
              activeImage={activeImage}
              selectedLabel={selectedLabel}
              visibleAnnotations={visibleAnnotations}
              onCreateAnnotation={handleCreateAnnotation}
            />
          </div>
        </section>

        <Inspector
          labels={labels}
          selectedLabel={selectedLabel}
          onSelectLabel={setSelectedLabel}
          newLabel={newLabel}
          onNewLabelChange={setNewLabel}
          onAddLabel={handleAddLabel}
          visibleAnnotations={visibleAnnotations}
          activeImage={activeImage}
          onDeleteAnnotation={handleDeleteAnnotation}
        />
      </div>
    </main>
  );
}
