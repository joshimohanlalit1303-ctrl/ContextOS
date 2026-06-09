'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// ForceGraph2D requires dynamic import with SSR disabled because it uses canvas/window
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export type GraphNode = {
  id: string;
  name: string;
  val: number;
};

export type GraphLink = {
  source: string;
  target: string;
};

export type KnowledgeGraphProps = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export default function KnowledgeGraph({ nodes, links }: KnowledgeGraphProps) {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize graph to fit container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Custom node drawing
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;

    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2) as [number, number];

    // Node background
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'; // indigo-500/20
    ctx.beginPath();
    ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 4);
    ctx.fill();

    // Node text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, node.x, node.y);

    node.__bckgDimensions = bckgDimensions; // Save dimensions for pointer interaction
  }, []);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    const bckgDimensions = node.__bckgDimensions;
    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
        <p className="text-gray-400 font-medium">Not enough memories to generate constellation.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]/50 relative">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{ nodes, links }}
        nodeLabel="name"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkColor={() => 'rgba(255, 255, 255, 0.1)'}
        linkWidth={1.5}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30 font-medium">
          {nodes.length} Nodes • {links.length} Edges
        </span>
      </div>
    </div>
  );
}
