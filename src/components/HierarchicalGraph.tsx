import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface HierarchicalNode {
  id: string;
  name: string;
  community: number;
  citation_count: number;
  degree: number;
}

interface HierarchicalLink {
  source: string;
  target: string;
  source_community: number;
  target_community: number;
}

interface Community {
  id: number;
  size: number;
  nodes: string[];
}

interface HierarchicalGraphData {
  nodes: HierarchicalNode[];
  links: HierarchicalLink[];
  communities: Community[];
  total_communities: number;
}

interface HierarchyLeaf {
  name: string; // The node ID
  data: HierarchicalNode;
}

interface HierarchyCommunity {
  name: string; // The community name, e.g., "C123"
  children: HierarchyLeaf[];
}

interface HierarchyRoot {
  name: 'root';
  children: HierarchyCommunity[];
}

type HierarchyNodeData = HierarchyRoot | HierarchyCommunity | HierarchyLeaf | HierarchicalNode;


interface HierarchicalGraphProps {
  data: HierarchicalGraphData;
  width?: number;
  height?: number;
  maxNodesPerCommunity?: number;
  maxCommunityLabels?: number;
}

const HierarchicalGraph = ({ 
  data, 
  width = 1000, 
  height = 1000,
  maxNodesPerCommunity = 20,
  maxCommunityLabels = 30
}: HierarchicalGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [displayStats, setDisplayStats] = useState({
    nodes: 0,
    links: 0,
    communities: 0
  });

  useEffect(() => {
    if (!data || !svgRef.current) return;

    console.log('HierarchicalGraph rendering with data:', {
      nodeCount: data.nodes.length,
      linkCount: data.links.length,
      communities: data.total_communities,
      maxNodesPerCommunity,
      maxCommunityLabels
    });

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const radius = Math.min(width, height) / 2 - 120;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Color scale for communities
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Build a connectivity map to understand which nodes have connections
    const nodeConnections = new Map<string, Set<string>>();
    data.links.forEach(link => {
      if (!nodeConnections.has(link.source)) nodeConnections.set(link.source, new Set());
      if (!nodeConnections.has(link.target)) nodeConnections.set(link.target, new Set());
      nodeConnections.get(link.source)!.add(link.target);
      nodeConnections.get(link.target)!.add(link.source);
    });

    // Enhanced node selection: prioritize connected nodes
    const groupedAll = d3.group(data.nodes, d => d.community);
    const communitiesArray = Array.from(groupedAll, ([communityId, nodes]) => ({
      id: communityId,
      nodes: nodes,
      size: nodes.length
    })).sort((a, b) => b.size - a.size);

    // Filter to top N communities by size to reduce overwhelming number
    const topCommunities = communitiesArray.slice(0, Math.min(50, communitiesArray.length));
    
    const displayNodes = topCommunities.flatMap(community => {
      // Calculate allocation for this community
      const minNodes = 5;
      const maxNodes = Math.min(maxNodesPerCommunity, community.size);
      const targetNodes = Math.max(minNodes, maxNodes);
      
      // Sort nodes by: 1) having connections, 2) degree, 3) citation count
      const rankedNodes = community.nodes
        .map(node => ({
          node,
          connectionCount: (nodeConnections.get(node.id)?.size || 0),
          hasConnections: nodeConnections.has(node.id)
        }))
        .sort((a, b) => {
          // First: prefer nodes with connections
          if (a.hasConnections !== b.hasConnections) return b.hasConnections ? 1 : -1;
          // Second: prefer nodes with more connections
          if (a.connectionCount !== b.connectionCount) return b.connectionCount - a.connectionCount;
          // Third: prefer high degree nodes
          return b.node.degree - a.node.degree;
        });
      
      return rankedNodes.slice(0, targetNodes).map(r => r.node);
    });

    const displayNodeIds = new Set(displayNodes.map(n => n.id));
    const displayLinks = data.links.filter(l => displayNodeIds.has(l.source) && displayNodeIds.has(l.target));

    // Update display statistics
    const displayCommunityCount = new Set(displayNodes.map(n => n.community)).size;
    setDisplayStats({
      nodes: displayNodes.length,
      links: displayLinks.length,
      communities: displayCommunityCount
    });

    // Create a hierarchical structure for d3.cluster
    const hierarchyData: HierarchyRoot = {
      name: 'root',
      children: Array.from(d3.group(displayNodes, d => d.community), ([communityId, nodes]) => ({
        name: `C${communityId}`,
        children: nodes.sort((a,b) => a.id.localeCompare(b.id)).map(node => ({
          name: node.id,
          data: node
        }))
      }))
    };
    
    // Create the cluster layout
    const tree = d3.cluster<HierarchyNodeData>()
      .size([2 * Math.PI, radius - 40]) // A bit smaller radius for labels
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const root = d3.hierarchy<HierarchyNodeData>(hierarchyData, d => (d as any).children)
      .sum(d => ('children' in d ? 0 : 1));

    tree(root);
    
    // Map for quick node lookup
    const nodesById = new Map(root.leaves().map(d => [(d.data as HierarchyLeaf).name, d]));
    
    // Line generator for bundled links
    // Lower beta = more bundling (0.85 provides good visual bundling)
    const line = d3.lineRadial<d3.HierarchyNode<HierarchyNodeData>>()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y ?? 0)
        .angle(d => d.x ?? 0);

    // Draw links
    const links = g.append('g')
      .attr('class', 'links')
      .style('mix-blend-mode', 'multiply')
      .selectAll('path')
      .data(displayLinks)
      .join('path')
      .each(function(d) {
        const source = nodesById.get(d.source);
        const target = nodesById.get(d.target);
        if (source && target) {
          const path = source.path(target);
          d3.select(this)
            .attr("d", line(path))
            .datum({ ...d, path });
        }
      })
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke', d => {
        return d.source_community === d.target_community 
          ? colorScale(d.source_community.toString())
          : '#888';
      })
      .attr('stroke-opacity', d => 
        d.source_community === d.target_community ? 0.6 : 0.3
      );

    // Draw nodes
    const nodeGroup = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `rotate(${((d.x ?? 0) * 180 / Math.PI - 90)}) translate(${d.y ?? 0},0)`)
        .on('mouseover', function(event, d) {
          // Highlight node
          d3.select(this).select('circle')
            .attr('stroke', '#000')
            .attr('stroke-width', 2)
            .attr('r', 8);

          // Highlight connected links
          const leaf = d.data as HierarchyLeaf;
          links.attr('stroke-opacity', (l: any) => 
            (l.source === leaf.data.id || l.target === leaf.data.id) ? 0.9 : 0.03
          )
          .attr('stroke-width', (l: any) =>
            (l.source === leaf.data.id || l.target === leaf.data.id) ? 2.5 : 0.5
          );

          // Show tooltip
          tooltip.transition().duration(200).style('opacity', 1);
          const nodeData = leaf.data;
          tooltip.html(`
            <strong>${nodeData.name}</strong><br/>
            <strong>Community:</strong> ${nodeData.community}<br/>
            <strong>Citations:</strong> ${nodeData.citation_count}<br/>
            <strong>Degree:</strong> ${nodeData.degree}
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          // Reset node
          d3.select(this).select('circle')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('r', 4.5);

          // Reset links
          links.attr('stroke-opacity', (l: any) => 
            l.source_community === l.target_community ? 0.6 : 0.3
          )
          .attr('stroke-width', 1.5);

          // Hide tooltip
          tooltip.transition().duration(500).style('opacity', 0);
        });

    nodeGroup.append("circle")
        .attr("r", 4.5)
        .attr("fill", d => colorScale((d.data as HierarchyLeaf).data.community.toString()))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .style('cursor', 'pointer');
    
    // Determine which communities to label (using prop)
    const communityEntries = Array.from(d3.group(displayNodes, d => d.community), ([cid, nodes]) => ({ cid: Number(cid), size: nodes.length }))
        .sort((a, b) => b.size - a.size);
    const labelAllowed = new Set(communityEntries.slice(0, maxCommunityLabels).map(e => e.cid));

    // Add labels for communities
    g.append("g")
        .selectAll("g")
        .data(root.children ?? [])
        .join("g")
        .attr("transform", d => `rotate(${((d.x ?? 0) * 180 / Math.PI - 90)}) translate(${radius - 20},0)`)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => ((d.x ?? 0) < Math.PI ? 6 : -6))
        .attr("text-anchor", d => ((d.x ?? 0) < Math.PI ? "start" : "end"))
        .attr("transform", d => ((d.x ?? 0) >= Math.PI ? "rotate(180)" : null))
        .text(d => {
            const communityId = Number((d.data as HierarchyCommunity).name.substring(1));
            return labelAllowed.has(communityId) ? (d.data as HierarchyCommunity).name : "";
        })
        .style("font-size", "10px")
        .style("fill", "var(--text-secondary)")
        .style('paint-order', 'stroke')
        .style('stroke', 'var(--background-secondary)')
        .style('stroke-width', '3px');
    
    // Add tooltip
    const tooltip = d3.select('body')
      .selectAll('.hierarchical-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'hierarchical-tooltip')
      .style('position', 'absolute')
      .style('padding', '12px 16px')
      .style('background', 'var(--surface)')
      .style('color', 'var(--text-primary)')
      .style('border-radius', '8px')
      .style('border', '1px solid var(--border-light)')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '13px')
      .style('max-width', '300px')
      .style('z-index', 1000);

    // Add center text
    g.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '15px')
      .style('font-weight', '500')
      .style('fill', 'var(--text-primary)')
      .text('Citation Network');

    g.append('text')
      .attr('x', 0)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', 'var(--text-secondary)')
      .text(`${displayNodes.length} papers`);

    g.append('text')
      .attr('x', 0)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', 'var(--text-secondary)')
      .text(`${displayStats.communities} communities`);

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, maxNodesPerCommunity, maxCommunityLabels]);

  return (
    <div style={{ 
      background: 'var(--surface)',
      borderRadius: '8px',
      border: '1px solid var(--border-light)',
      padding: '20px',
      boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
      overflow: 'hidden'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '16px',
        fontWeight: 500,
        color: 'var(--text-primary)'
      }}>
        Hierarchical Edge Bundling Visualization
      </h3>
      <p style={{ 
        margin: '0 0 20px 0', 
        color: 'var(--text-secondary)',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        Papers arranged in radial layout grouped by communities. Edges bundle through center for improved clarity.
      </p>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '20px',
        flexWrap: 'nowrap'
      }}>
        <div style={{ flexShrink: 1, minWidth: 0 }}>
          <svg 
            ref={svgRef} 
            width={width} 
            height={height}
            style={{ 
              border: '1px solid var(--border-light)',
              background: 'var(--background-secondary)',
              borderRadius: '8px',
              display: 'block',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
        <div style={{ 
          padding: '16px',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          background: 'var(--background-secondary)',
          width: '240px',
          flexShrink: 0
        }}>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}>
            Legend
          </h4>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Displaying {displayStats.communities} of {data.total_communities} communities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Array.from({ length: Math.min(10, displayStats.communities) }, (_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: d3.schemeCategory10[i % 10],
                    marginRight: '8px',
                    borderRadius: '3px',
                    border: '1px solid var(--border-light)'
                  }} />
                  <span style={{ 
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    Community {i}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '12px'
          }}>
            <div style={{ 
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '6px'
            }}>
              Interactions
            </div>
            <ul style={{ 
              paddingLeft: '16px', 
              margin: 0,
              lineHeight: '1.6'
            }}>
              <li>Hover for details</li>
              <li>Link highlighting</li>
            </ul>
          </div>
          <div style={{ 
            fontSize: '13px', 
            marginTop: '12px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '12px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ 
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '6px'
            }}>
              Statistics
            </div>
            <div>Displaying {displayStats.nodes} of {data.nodes.length} nodes</div>
            <div>Displaying {displayStats.links} of {data.links.length} links</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalGraph;

