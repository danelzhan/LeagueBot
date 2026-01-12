"use client";

import { useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function Canvas({
  activeImage,
  selectedLabel,
  visibleAnnotations,
  onCreateAnnotation,
}) {
  const [draft, setDraft] = useState(null);
  const [imageMetrics, setImageMetrics] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    displayWidth: 0,
    displayHeight: 0,
  });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateMetrics = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setImageMetrics((current) => ({
        ...current,
        displayWidth: rect.width,
        displayHeight: rect.height,
      }));
    };

    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [activeImage]);

  const scaleX =
    imageMetrics.naturalWidth && imageMetrics.displayWidth
      ? imageMetrics.displayWidth / imageMetrics.naturalWidth
      : 1;
  const scaleY =
    imageMetrics.naturalHeight && imageMetrics.displayHeight
      ? imageMetrics.displayHeight / imageMetrics.naturalHeight
      : 1;

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    setImageMetrics({
      naturalWidth: imageRef.current.naturalWidth,
      naturalHeight: imageRef.current.naturalHeight,
      displayWidth: rect.width,
      displayHeight: rect.height,
    });
  };

  const getImageCoordinates = (event) => {
    if (!containerRef.current || !imageRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();

    const offsetX = clamp(event.clientX - rect.left, 0, rect.width);
    const offsetY = clamp(event.clientY - rect.top, 0, rect.height);

    const ratioX = imageRef.current.naturalWidth / rect.width || 1;
    const ratioY = imageRef.current.naturalHeight / rect.height || 1;

    return {
      x: Math.round(offsetX * ratioX),
      y: Math.round(offsetY * ratioY),
    };
  };

  const handlePointerDown = (event) => {
    if (
      event.pointerType === "mouse" &&
      typeof event.button === "number" &&
      event.button !== 0
    ) {
      return;
    }
    if (!activeImage) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = getImageCoordinates(event);
    if (!point) return;
    setDraft({ start: point, current: point });
  };

  const handlePointerMove = (event) => {
    if (!draft) return;
    event.preventDefault();
    const point = getImageCoordinates(event);
    if (!point) return;
    setDraft((current) => ({ ...current, current: point }));
  };

  const handlePointerUp = (event) => {
    event?.currentTarget?.releasePointerCapture?.(event.pointerId);
    if (!draft || !selectedLabel || !activeImage) {
      setDraft(null);
      return;
    }

    const { start, current } = draft;
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);

    if (width < 4 || height < 4) {
      setDraft(null);
      return;
    }

    const annotation = {
      image_address: activeImage,
      label: selectedLabel,
      startX: Math.max(start.x, current.x),
      startY: Math.min(start.y, current.y),
      endX: Math.min(start.x, current.x),
      endY: Math.max(start.y, current.y),
    };

    onCreateAnnotation(annotation);
    setDraft(null);
  };

  const draftBox = draft
    ? {
        left: Math.min(draft.start.x, draft.current.x) * scaleX,
        top: Math.min(draft.start.y, draft.current.y) * scaleY,
        width: Math.abs(draft.current.x - draft.start.x) * scaleX,
        height: Math.abs(draft.current.y - draft.start.y) * scaleY,
      }
    : null;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div>
          <p className="text-sm text-slate-300">Current image</p>
          <p className="text-lg font-semibold text-slate-50">
            {activeImage || "No image loaded"}
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Drag to create a bounding box
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {activeImage ? (
          <img
            ref={imageRef}
            src={activeImage}
            alt="Annotation target"
            className="block w-full select-none"
            onLoad={handleImageLoad}
            draggable={false}
          />
        ) : (
          <div className="flex h-[480px] items-center justify-center text-slate-400">
            No image available.
          </div>
        )}

        {visibleAnnotations.map((annotation, index) => {
          const left = annotation.endX * scaleX;
          const top = annotation.startY * scaleY;
          const width = (annotation.startX - annotation.endX) * scaleX;
          const height = (annotation.endY - annotation.startY) * scaleY;
          return (
            <div
              key={`${annotation.label}-${index}-${annotation.startX}`}
              className="pointer-events-none absolute rounded-lg border border-amber-300/90 bg-amber-300/15"
              style={{ left, top, width, height }}
            >
              <span className="absolute -top-5 left-0 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
                {annotation.label}
              </span>
            </div>
          );
        })}

        {draftBox && (
          <div
            className="pointer-events-none absolute rounded-lg border border-sky-300/90 bg-sky-300/10"
            style={draftBox}
          />
        )}
      </div>
    </div>
  );
}
