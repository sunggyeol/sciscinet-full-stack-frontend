import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HistogramProps {
  data: number[];
  selectedYear: number | null;
  width?: number;
  height?: number;
}

const Histogram = ({ 
  data, 
  selectedYear,
  width = 800, 
  height = 400 
}: HistogramProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Filter out 0 values - only show papers with at least 1 patent
    const filteredData = data.filter(d => d > 0);
    if (filteredData.length === 0) {
      // No data to display
      return;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create discrete bins for each integer value
    const maxValue = d3.max(filteredData) || 1;
    const counts = new Map<number, number>();
    
    // Count occurrences of each value
    for (let i = 1; i <= maxValue; i++) {
      counts.set(i, 0);
    }
    filteredData.forEach(d => {
      const rounded = Math.round(d);
      counts.set(rounded, (counts.get(rounded) || 0) + 1);
    });

    // Convert to array format for D3
    const bins = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value);

    // Scales
    const xScale = d3.scaleBand()
      .domain(bins.map(d => String(d.value)))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.count) || 0])
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
      .style('fill', 'var(--text-secondary)')
      .style('text-anchor', 'middle');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--text-secondary)');

    // Remove axis domain and reduce ticks
    g.selectAll('.domain').style('stroke', 'var(--border-medium)');
    g.selectAll('.tick line').style('stroke', 'var(--border-medium)');

    // X-axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', 'var(--text-secondary)')
      .style('font-weight', '500')
      .text('Patent Count');

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

    // Histogram bars
    const bars = g.selectAll('.hist-bar')
      .data(bins)
      .join('rect')
      .attr('class', 'hist-bar')
      .attr('x', d => xScale(String(d.value)) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', 'var(--success)')
      .attr('stroke', 'var(--surface)')
      .attr('stroke-width', 1)
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this)
          .attr('opacity', 0.7);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1);
      });

    // Tooltip
    const tooltip = d3.select('body')
      .selectAll('.histogram-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'histogram-tooltip')
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
      tooltip
        .style('opacity', 1)
        .html(`<strong>Patents: ${d.value}</strong><br/>Papers: ${d.count}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('opacity', 0);
    });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

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
        Patent Citation Distribution
        {selectedYear && (
          <span style={{ 
            color: 'var(--text-secondary)', 
            marginLeft: '8px',
            fontSize: '14px',
            fontWeight: 400
          }}>
            ({selectedYear})
          </span>
        )}
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
      {selectedYear && (
        <p style={{ 
          textAlign: 'center', 
          marginTop: '12px', 
          color: 'var(--text-tertiary)',
          fontSize: '13px'
        }}>
          Showing patent citations for papers published in {selectedYear}
        </p>
      )}
    </div>
  );
};

export default Histogram;

