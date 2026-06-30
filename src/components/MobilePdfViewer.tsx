import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Icons from "lucide-react";

// PDF.js is loaded dynamically from CDN to avoid adding a heavy npm dep.
declare const pdfjsLib: any;

interface MobilePdfViewerProps {
  /** A blob: URL or https: URL pointing to the PDF */
  url: string;
  fileName?: string;
  onClose: () => void;
  onDownload?: () => void;
  isAr?: boolean;
}

export const MobilePdfViewer: React.FC<MobilePdfViewerProps> = ({
  url,
  fileName,
  onClose,
  onDownload,
  isAr,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "rendering" | "done" | "error">("loading");
  const [totalPages, setTotalPages] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const isMounted = useRef(true);

  // Dynamically load PDF.js library from CDN
  const loadPdfJs = useCallback((): Promise<void> => {
    if ((window as any).pdfjsLib) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });
  }, []);

  const renderPdf = useCallback(async () => {
    try {
      console.log("[MobilePdfViewer] Loading PDF.js library…");
      await loadPdfJs();
      if (!isMounted.current) return;

      const lib = (window as any).pdfjsLib;
      console.log("[MobilePdfViewer] Opening document:", url.slice(0, 60));
      const loadingTask = lib.getDocument(url);
      const pdf = await loadingTask.promise;
      if (!isMounted.current) return;

      setTotalPages(pdf.numPages);
      setStatus("rendering");
      console.log("[MobilePdfViewer] Total pages:", pdf.numPages);

      // Clear any previous canvases
      if (containerRef.current) containerRef.current.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (!isMounted.current) return;

        const page = await pdf.getPage(pageNum);

        // Calculate scale so the page fits the container width comfortably
        // Restrict DPR to max 2x for memory saving & performance on mobile
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const containerWidth =
          containerRef.current?.clientWidth || window.innerWidth;
        const availableWidth = Math.max(containerWidth - 32, 280);
        
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (availableWidth / unscaledViewport.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // CSS: render at natural scale, dynamically adjusted by zoomLevel later
        canvas.style.width = `${100 * zoomLevel}%`;
        canvas.style.height = "auto";
        canvas.style.display = "block";
        canvas.style.marginBottom = "12px";
        canvas.style.borderRadius = "6px";
        canvas.style.background = "#fff";

        if (containerRef.current) {
          containerRef.current.appendChild(canvas);
        }

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!isMounted.current) return;

        setRenderedPages(pageNum);
        console.log(`[MobilePdfViewer] Rendered page ${pageNum}/${pdf.numPages}`);
      }

      if (isMounted.current) setStatus("done");
    } catch (err: any) {
      console.error("[MobilePdfViewer] Error:", err);
      if (isMounted.current) {
        setErrorMsg(err?.message || "Could not render PDF.");
        setStatus("error");
      }
    }
  }, [url, loadPdfJs]);

  useEffect(() => {
    isMounted.current = true;
    renderPdf();
    return () => {
      isMounted.current = false;
    };
  }, [renderPdf]);

  // Update canvas style widths when zoomLevel changes
  useEffect(() => {
    if (!containerRef.current) return;
    const canvases = containerRef.current.querySelectorAll("canvas");
    canvases.forEach((canvas: HTMLCanvasElement) => {
      canvas.style.width = `${100 * zoomLevel}%`;
    });
  }, [zoomLevel, renderedPages]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const progress = totalPages > 0 ? Math.round((renderedPages / totalPages) * 100) : 0;

  return (
    <div className="mpdf-overlay">
      {/* ── Fixed header ── */}
      <div className="mpdf-header">
        <div className="mpdf-header-left">
          <button className="mpdf-close-btn" onClick={onClose} aria-label="Close">
            <Icons.X size={20} />
          </button>
          <span className="mpdf-title" title={fileName}>
            {fileName || (isAr ? "ملف PDF" : "PDF Document")}
          </span>
        </div>

        {/* Zoom Controls */}
        {status === "done" && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              className="mpdf-zoom-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              title={isAr ? "تصغير" : "Zoom Out"}
            >
              <Icons.ZoomOut size={16} />
            </button>
            <span className="mpdf-zoom-indicator">{Math.round(zoomLevel * 100)}%</span>
            <button
              className="mpdf-zoom-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.0}
              title={isAr ? "تكبير" : "Zoom In"}
            >
              <Icons.ZoomIn size={16} />
            </button>
          </div>
        )}

        <div className="mpdf-header-right">
          {onDownload && (
            <button className="mpdf-download-btn" onClick={onDownload} aria-label="Download">
              <Icons.Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="mpdf-body">
        {/* Loading / progress */}
        {(status === "loading" || status === "rendering") && (
          <div className="mpdf-status">
            <div className="mpdf-spinner" />
            <p className="mpdf-status-text">
              {status === "loading"
                ? isAr ? "جارٍ التحميل…" : "Loading PDF…"
                : isAr
                ? `${isAr ? "جارٍ العرض" : "Rendering"} ${renderedPages}/${totalPages}`
                : `Rendering page ${renderedPages}/${totalPages}`}
            </p>
            {status === "rendering" && (
              <div className="mpdf-progress-bar">
                <div className="mpdf-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="mpdf-error">
            <Icons.AlertTriangle size={32} style={{ color: "#ef4444" }} />
            <p>{errorMsg}</p>
            <button
              className="mpdf-fallback-btn"
              onClick={() => window.open(url, "_blank")}
            >
              {isAr ? "فتح في متصفح" : "Open in Browser"}
            </button>
          </div>
        )}

        {/* Canvas container — canvases are appended here */}
        <div
          ref={containerRef}
          className={`mpdf-canvas-container ${zoomLevel > 1.0 ? "zoomed" : ""}`}
        />
      </div>
    </div>
  );
};
