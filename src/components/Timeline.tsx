import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TimelineData {
  year: number;
  count: number;
}

interface TimelineProps {
  data: TimelineData[];
  width?: number;
  height?: number;
  onYearClick: (year: number) => void;
  selectedYear: number | null;
}

const Timeline = ({ 
  data, 
  width = 800, 
  height = 400,
  onYearClick,
  selectedYear
}: TimelineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .range([innerHeight, 0])
      .nice();

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)');

    // Style axis lines
    g.selectAll('.domain, .tick line')
      .style('stroke', 'var(--border-medium)');

    // X-axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', 'var(--text-secondary)')
      .style('font-weight', '500')
      .text('Year');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', 'var(--text-secondary)')
      .style('font-weight', '500')
      .text('Number of Papers');

    // Bars
    const bars = g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', d => selectedYear === d.year ? 'var(--accent-primary)' : 'var(--chart-1)')
      .attr('stroke', d => selectedYear === d.year ? 'var(--accent-secondary)' : 'none')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        if (selectedYear !== d.year) {
        d3.select(this)
          .attr('opacity', 0.7);
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1);
      })
      .on('click', function(event, d) {
        onYearClick(d.year);
      });

    // Add value labels on top of bars
    g.selectAll('.label')
      .data(data)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', 'var(--text-secondary)')
      .style('font-weight', '500')
      .text(d => d.count);

    // Tooltip
    const tooltip = d3.select('body')
      .selectAll('.timeline-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'timeline-tooltip')
      .style('position', 'absolute')
      .style('padding', '10px 14px')
      .style('background', 'var(--surface)')
      .style('color', 'var(--text-primary)')
      .style('border-radius', '8px')
      .style('border', '1px solid var(--border-light)')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '13px')
      .style('z-index', 1000);

    bars.on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Papers:</strong> ${d.count}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0);
    });

    // Line overlay for trend
    const line = d3.line<TimelineData>()
      .x(d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--warning)')
      .attr('stroke-width', 2.5)
      .attr('d', line)
      .style('opacity', 0.8);

    // Add dots on line
    g.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.count))
      .attr('r', 4)
      .attr('fill', 'var(--warning)')
      .attr('stroke', 'var(--surface)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        onYearClick(d.year);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, onYearClick, selectedYear]);

  return (
    <div style={{ 
      background: 'var(--surface)',
      borderRadius: '8px',
      border: '1px solid var(--border-light)',
      padding: '20px',
      boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '16px',
        fontWeight: 500,
        color: 'var(--text-primary)'
      }}>
        Publication Timeline
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg 
          ref={svgRef} 
          width={width} 
          height={height}
          style={{ 
            border: '1px solid var(--border-light)',
            background: 'var(--background-secondary)',
            borderRadius: '8px'
          }}
        />
      </div>
      <p style={{ 
        textAlign: 'center', 
        marginTop: '12px', 
        color: 'var(--text-tertiary)',
        fontSize: '13px'
      }}>
        Click on a bar to view patent citations for that year
      </p>
    </div>
  );
};

export default Timeline;

