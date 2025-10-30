export interface Node {
  id: string;
  title?: string;
  citation_count?: number;
  community?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string | Node;
  target: string | Node;
  weight?: number;
}

export interface NetworkData {
  nodes: Node[];
  links: Link[];
  communities: number;
}

