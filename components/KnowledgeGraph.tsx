'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2 } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverNode, setHoverNode] = useState<any>(null);

  // Compute node neighbors
  const { neighbors, nodeLinks } = useMemo(() => {
    const neighbors = new Map<string, Set<string>>();
    const nodeLinks = new Map<string, Set<any>>();
    
    nodes.forEach(n => {
      neighbors.set(n.id, new Set());
      nodeLinks.set(n.id, new Set());
    });
    
    links.forEach(link => {
      const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const target = typeof link.target === 'object' ? (link.target as any).id : link.target;
      
      neighbors.get(source)?.add(target);
      neighbors.get(target)?.add(source);
      
      nodeLinks.get(source)?.add(link);
      nodeLinks.get(target)?.add(link);
    });
    
    return { neighbors, nodeLinks };
  }, [nodes, links]);

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
  }, [isFullscreen]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHovered = node === hoverNode;
    const isNeighbor = hoverNode && neighbors.get(hoverNode.id)?.has(node.id);
    const isHighlighted = isHovered || isNeighbor;
    const isDimmed = hoverNode && !isHighlighted;
    
    const nodeSize = isHovered ? 6 : isNeighbor ? 5 : 4;
    
    // Draw Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = isHovered ? '#818cf8' : isNeighbor ? '#6366f1' : isDimmed ? 'rgba(255, 255, 255, 0.1)' : 'rgba(165, 180, 252, 0.8)';
    if (isHighlighted) {
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0; // reset
    
    // Draw Text Label
    if (!isDimmed && (globalScale > 1.5 || isHighlighted)) {
      const label = node.name;
      let fontSize = isHovered ? 14 / globalScale : 12 / globalScale;
      // bound font size
      if (fontSize > 14) fontSize = 14;
      if (fontSize < 3) fontSize = 3;
      
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      
      // truncate label if too long
      const maxLen = 30;
      const displayLabel = label.length > maxLen ? label.substring(0, maxLen) + '...' : label;
      
      ctx.fillText(displayLabel, node.x, node.y + nodeSize + 2);
    }
  }, [hoverNode, neighbors]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    const nodeSize = 6;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize + 4, 0, 2 * Math.PI, false);
    ctx.fill();
  }, []);

  const linkColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id)) {
      return 'rgba(129, 140, 248, 1)'; // Highlighted indigo (more opaque)
    }
    
    if (hoverNode) {
      return 'rgba(255, 255, 255, 0.05)'; // Dimmed
    }
    
    return 'rgba(255, 255, 255, 0.4)'; // Normal (more opaque)
  }, [hoverNode]);

  const linkWidth = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id)) {
      return 3;
    }
    return 1.5;
  }, [hoverNode]);

  const graphData = useMemo(() => ({ nodes, links }), [nodes, links]);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
        <p className="text-gray-400 font-medium">Not enough memories to generate constellation.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl relative transition-all duration-500 ease-in-out ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-2rem)]' : 'w-full h-[500px]'
      }`}
    >
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onNodeHover={setHoverNode}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={0}
      />
      
      {/* Top Left Stats */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md text-indigo-300 text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 font-medium shadow-lg">
          {nodes.length} Nodes • {links.length} Edges
        </div>
      </div>
      
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-black/40 hover:bg-white/10 backdrop-blur-md border border-white/10 text-gray-300 rounded-full transition-colors focus:outline-none shadow-sm"
          title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
