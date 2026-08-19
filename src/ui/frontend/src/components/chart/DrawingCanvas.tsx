import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Move, Ruler, TrendingUp, Minus, DollarSign, ShieldAlert, Target } from 'lucide-react';

export type DrawingMode =
  | 'CURSOR'
  | 'TRENDLINE'
  | 'HORIZ_LINE'
  | 'FIBONACCI'
  | 'RECTANGLE'
  | 'LONG_POSITION'
  | 'SHORT_POSITION'
  | 'RULER';

export interface Point {
  x: number;
  y: number;
  price?: number;
  time?: number;
}

export interface DrawingItem {
  id: string;
  type: DrawingMode;
  p1: Point;
  p2?: Point;
  p3?: Point; // e.g. for TP/SL 3rd point
  color?: string;
  label?: string;
}

interface DrawingCanvasProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  width: number;
  height: number;
  priceFromY?: (y: number) => number;
  yFromPrice?: (price: number) => number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  mode,
  onModeChange,
  width,
  height,
  priceFromY,
  yFromPrice,
}) => {
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDrawing = mode !== 'CURSOR';

  // Keyboard shortcut listener: Escape cancels, Delete removes last drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentDrawing(null);
        onModeChange('CURSOR');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setDrawings((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const price = priceFromY ? priceFromY(y) : 0;

    if (!currentDrawing) {
      if (mode === 'HORIZ_LINE') {
        const newItem: DrawingItem = {
          id: `draw-${Date.now()}`,
          type: 'HORIZ_LINE',
          p1: { x, y, price },
          p2: { x: width, y, price },
          color: '#3b82f6',
          label: `Level: ${price?.toFixed(2)}`,
        };
        setDrawings((prev) => [...prev, newItem]);
        onModeChange('CURSOR');
      } else {
        setCurrentDrawing({
          id: `draw-${Date.now()}`,
          type: mode,
          p1: { x, y, price },
          color: mode === 'LONG_POSITION' ? '#10b981' : mode === 'SHORT_POSITION' ? '#ef4444' : '#8b5cf6',
        });
      }
    } else {
      // Second click finishes drawing
      const completed: DrawingItem = {
        ...currentDrawing,
        p2: { x, y, price },
      };
      setDrawings((prev) => [...prev, completed]);
      setCurrentDrawing(null);
      onModeChange('CURSOR');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const price = priceFromY ? priceFromY(y) : 0;

    setCurrentDrawing((prev) => (prev ? { ...prev, p2: { x, y, price } } : null));
  };

  // Render Drawings on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const allItems = [...drawings, ...(currentDrawing ? [currentDrawing] : [])];

    for (const item of allItems) {
      ctx.save();
      const p1 = item.p1;
      const p2 = item.p2 || p1;

      if (item.type === 'TRENDLINE') {
        ctx.strokeStyle = item.color || '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // End points
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
        ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Info Badge
        if (p1.price && p2.price) {
          const delta = p2.price - p1.price;
          const pct = ((delta / p1.price) * 100).toFixed(2);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
          ctx.fillRect(midX - 35, midY - 18, 70, 18);
          ctx.strokeStyle = '#262626';
          ctx.strokeRect(midX - 35, midY - 18, 70, 18);
          ctx.fillStyle = delta >= 0 ? '#10b981' : '#ef4444';
          ctx.font = '10px monospace';
          ctx.fillText(`${delta >= 0 ? '+' : ''}${pct}%`, midX - 25, midY - 5);
        }
      } else if (item.type === 'HORIZ_LINE') {
        ctx.strokeStyle = item.color || '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, p1.y);
        ctx.lineTo(width, p1.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Price Badge on right
        if (p1.price) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(width - 65, p1.y - 10, 60, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(p1.price.toFixed(2), width - 58, p1.y + 4);
        }
      } else if (item.type === 'RECTANGLE') {
        const minX = Math.min(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);

        ctx.fillStyle = 'rgba(147, 51, 234, 0.12)';
        ctx.fillRect(minX, minY, w, h);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(minX, minY, w, h);

        ctx.fillStyle = '#c084fc';
        ctx.font = '10px monospace';
        ctx.fillText('Order Block / Zone', minX + 6, minY + 14);
      } else if (item.type === 'FIBONACCI') {
        const levels = [
          { ratio: 0.0, label: '0.0% (1.0)', color: '#94a3b8' },
          { ratio: 0.236, label: '23.6%', color: '#38bdf8' },
          { ratio: 0.382, label: '38.2%', color: '#34d399' },
          { ratio: 0.5, label: '50.0% (Eq)', color: '#fbbf24' },
          { ratio: 0.618, label: '61.8% (Golden)', color: '#f97316' },
          { ratio: 0.786, label: '78.6%', color: '#f43f5e' },
          { ratio: 1.0, label: '100.0% (0.0)', color: '#94a3b8' },
        ];

        const topY = Math.min(p1.y, p2.y);
        const botY = Math.max(p1.y, p2.y);
        const diffY = botY - topY;
        const startX = Math.min(p1.x, p2.x);
        const endX = Math.max(p1.x, p2.x, startX + 180);

        levels.forEach((lvl, idx) => {
          const y = topY + diffY * lvl.ratio;
          ctx.strokeStyle = lvl.color;
          ctx.lineWidth = lvl.ratio === 0.618 || lvl.ratio === 0.5 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
          ctx.stroke();

          // Fill between golden pocket
          if (idx === 4) {
            const prevY = topY + diffY * levels[3].ratio;
            ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
            ctx.fillRect(startX, prevY, endX - startX, y - prevY);
          }

          ctx.fillStyle = lvl.color;
          ctx.font = '10px monospace';
          ctx.fillText(lvl.label, startX + 4, y - 3);
        });
      } else if (item.type === 'LONG_POSITION' || item.type === 'SHORT_POSITION') {
        const isLong = item.type === 'LONG_POSITION';
        const entryY = p1.y;
        const targetY = p2.y;
        const diff = Math.abs(targetY - entryY);
        const stopY = isLong ? entryY + diff * 0.5 : entryY - diff * 0.5;

        const startX = p1.x;
        const endX = Math.max(p2.x, startX + 160);
        const w = endX - startX;

        // Target Box (Green)
        const tpMinY = Math.min(entryY, targetY);
        const tpH = Math.abs(targetY - entryY);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.fillRect(startX, tpMinY, w, tpH);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, tpMinY, w, tpH);

        // Stop Box (Red)
        const slMinY = Math.min(entryY, stopY);
        const slH = Math.abs(stopY - entryY);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(startX, slMinY, w, slH);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, slMinY, w, slH);

        // Entry Line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(startX, entryY);
        ctx.lineTo(endX, entryY);
        ctx.stroke();
        ctx.setLineDash([]);

        // R:R Badge
        const rrRatio = (tpH / Math.max(1, slH)).toFixed(2);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(startX + 8, entryY - 14, 110, 26);
        ctx.strokeStyle = '#3b82f6';
        ctx.strokeRect(startX + 8, entryY - 14, 110, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Risk/Reward: ${rrRatio}`, startX + 14, entryY + 3);
      } else if (item.type === 'RULER') {
        const minX = Math.min(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);

        ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.fillRect(minX, minY, w, h);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(minX, minY, w, h);
        ctx.setLineDash([]);

        // Info box
        if (p1.price && p2.price) {
          const deltaPrice = p2.price - p1.price;
          const pct = ((deltaPrice / p1.price) * 100).toFixed(2);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(minX + 8, minY + 8, 140, 42);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(minX + 8, minY + 8, 140, 42);

          ctx.fillStyle = deltaPrice >= 0 ? '#34d399' : '#f87171';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`Δ: ${deltaPrice >= 0 ? '+' : ''}${pct}% (${deltaPrice.toFixed(2)})`, minX + 14, minY + 24);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(`Width: ${Math.round(w)}px | Height: ${Math.round(h)}px`, minX + 14, minY + 40);
        }
      }

      ctx.restore();
    }
  }, [drawings, currentDrawing, width, height, priceFromY]);

  const clearAll = () => {
    setDrawings([]);
    setCurrentDrawing(null);
    onModeChange('CURSOR');
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className={`w-full h-full ${isDrawing ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* Floating Drawings Quick Action Bar */}
      {drawings.length > 0 && (
        <div className="absolute bottom-4 left-14 pointer-events-auto flex items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-lg text-xs shadow-xl">
          <span className="text-slate-400 font-mono text-[11px]">{drawings.length} drawing(s)</span>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-[10px] font-mono transition"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}
    </div>
  );
};
