import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { NetworkData, Node, Link } from '../types';

interface ForceGraphProps {
  data: NetworkData;
  title: string;
  width?: number;
  height?: number;
  isCitation?: boolean;
}

const ForceGraph = ({ 
  data, 
  title, 
  width = 1200, 
  height = 800,
  isCitation = false 
}: ForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    console.log('ForceGraph rendering with data:', {
      nodeCount: data.nodes.length,
      linkCount: data.links.length,
      communities: data.communities,
      sampleNodes: data.nodes.slice(0, 3)
    });

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Create container group for zoom
    const container = svg.append('g');

    // Color scale based on communities - use more colors
    const colorScale = d3.scaleOrdinal([
      ...d3.schemeCategory10,
      ...d3.schemePaired,
      ...d3.schemeSet3
    ]);

    // Create simulation
    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links)
        .id((d) => d.id)
        .distance(50))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(8));

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => d.weight ? Math.sqrt(d.weight) : 1);

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', (d) => isCitation && d.citation_count ? Math.sqrt(d.citation_count) + 3 : 5)
      .attr('fill', (d) => colorScale((d.community ?? 0).toString()))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '12px')
      .style('max-width', '300px')
      .style('z-index', 1000);

    node.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', '#000')
        .attr('stroke-width', 3);
      
      tooltip.transition().duration(200).style('opacity', 1);
      
      let content = `<strong>ID:</strong> ${d.id}<br/>`;
      content += `<strong>Community:</strong> ${d.community ?? 0}<br/>`;
      if (isCitation && d.title) {
        content += `<strong>Title:</strong> ${d.title}<br/>`;
        content += `<strong>Citations:</strong> ${d.citation_count || 0}`;
      }
      
      tooltip.html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
      
      tooltip.transition().duration(500).style('opacity', 0);
    });

    // Add link hover
    link.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', '#000')
        .attr('stroke-width', 3);
      
      tooltip.transition().duration(200).style('opacity', 1);
      
      const source = typeof d.source === 'object' ? d.source.id : d.source;
      const target = typeof d.target === 'object' ? d.target.id : d.target;
      
      let content = `<strong>Link:</strong><br/>`;
      content += `${source} → ${target}`;
      if (d.weight) {
        content += `<br/><strong>Weight:</strong> ${d.weight}`;
      }
      
      tooltip.html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function(_event, d) {
      d3.select(this)
        .attr('stroke', '#999')
        .attr('stroke-width', d.weight ? Math.sqrt(d.weight) : 1);
      
      tooltip.transition().duration(500).style('opacity', 0);
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d) => d.x!)
        .attr('cy', (d) => d.y!);
    });

    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [data, width, height, isCitation]);

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#e0e0e0' }}>{title}</h2>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '20px'
      }}>
        <svg 
          ref={svgRef} 
          width={width} 
          height={height}
          style={{ 
            border: '1px solid #444',
            background: '#0a0a0a',
            borderRadius: '4px'
          }}
        />
        <div style={{ 
          padding: '15px',
          border: '1px solid #444',
          borderRadius: '5px',
          background: '#2a2a2a',
          minWidth: '200px',
          color: '#e0e0e0'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '16px', color: '#e0e0e0' }}>Legend</h3>
          <div style={{ marginBottom: '15px' }}>
            <strong>Communities: {data.communities}</strong>
            <div style={{ marginTop: '10px' }}>
              {Array.from({ length: Math.min(10, data.communities) }, (_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: d3.schemeCategory10[i % 10],
                    marginRight: '10px',
                    border: '1px solid #555'
                  }} />
                  <span style={{ fontSize: '14px' }}>Community {i}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#b0b0b0' }}>
            <p><strong>Interactions:</strong></p>
            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
              <li>Drag nodes to reposition</li>
              <li>Hover for details</li>
              <li>Scroll to zoom</li>
            </ul>
          </div>
          <div style={{ fontSize: '13px', marginTop: '15px', color: '#b0b0b0' }}>
            <p><strong>Stats:</strong></p>
            <p>Nodes: {data.nodes.length}</p>
            <p>Links: {data.links.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForceGraph;

