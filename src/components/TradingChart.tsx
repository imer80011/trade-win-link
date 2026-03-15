import { useEffect, useState, useRef } from "react";

function generateCandleData(count: number) {
  const data = [];
  let price = 42000 + Math.random() * 2000;
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * 500;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    data.push({ open, close, high, low });
    price = close;
  }
  return data;
}

export default function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState(() => generateCandleData(40));

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * 300;
        const open = last.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 100;
        const low = Math.min(open, close) - Math.random() * 100;
        return [...prev.slice(1), { open, close, high, low }];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = "hsl(220 12% 18%)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const allPrices = candles.flatMap((c) => [c.high, c.low]);
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const range = maxP - minP || 1;
    const candleW = (w - 20) / candles.length;
    const padding = 10;

    const toY = (p: number) => h - padding - ((p - minP) / range) * (h - padding * 2);

    candles.forEach((c, i) => {
      const x = padding + i * candleW + candleW / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? "#00E676" : "#FF1744";

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBottom = toY(Math.min(c.open, c.close));
      const bodyH = Math.max(bodyBottom - bodyTop, 1);
      ctx.fillRect(x - candleW * 0.35, bodyTop, candleW * 0.7, bodyH);
    });
  }, [candles]);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const priceChange = lastCandle.close - prevCandle.close;
  const pctChange = (priceChange / prevCandle.close) * 100;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm text-muted-foreground">BTC/USDT</h3>
          <p className="text-2xl font-mono font-bold">
            ${lastCandle.close.toFixed(2)}
          </p>
        </div>
        <span className={`font-mono text-sm font-semibold px-2 py-1 rounded ${priceChange >= 0 ? "bg-primary/10 price-up" : "bg-danger/10 price-down"}`}>
          {priceChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 200 }}
      />
    </div>
  );
}
