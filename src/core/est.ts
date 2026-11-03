type Features = ReadonlyMap<string, string>;

interface RelationNode {
  item: number;
  up: number;
  down: number;
  next: number;
  prev: number;
}

type Relation = ReadonlyMap<number, RelationNode>;

interface EstUtterance {
  items: ReadonlyMap<number, Features>;
  relations: ReadonlyMap<string, Relation>;
}

function readValue(text: string, start: number): [string, number] {
  if (text[start] !== '"') {
    const end = text.indexOf(" ", start);
    return end === -1 ? [text.slice(start), text.length] : [text.slice(start, end), end];
  }
  let value = "";
  let i = start + 1;
  while (i < text.length && text[i] !== '"') {
    if (text[i] === "\\") i++;
    value += text[i++];
  }
  return [value, i + 1];
}

function parseFeatures(text: string): Features {
  const features = new Map<string, string>();
  let i = 0;
  while (i < text.length) {
    while (text[i] === " " || text[i] === ";") i++;
    if (i >= text.length) break;
    const [key, afterKey] = readValue(text, i);
    const [value, afterValue] = readValue(text, afterKey + 1);
    features.set(key, value);
    i = afterValue;
  }
  return features;
}

function parseRelationRow(line: string): [number, RelationNode] | null {
  const nums = line.trim().split(/\s+/).map(Number);
  if (nums.length !== 6 || !nums.every(Number.isFinite)) return null;
  const [id, item, up, down, next, prev] = nums;
  return [id, { item, up, down, next, prev }];
}

export function parseEst(raw: string): EstUtterance {
  const items = new Map<number, Features>();
  const relations = new Map<string, Map<number, RelationNode>>();
  let inItems = false;
  let relation: Map<number, RelationNode> | null = null;

  for (const line of raw.split(/\r?\n/)) {
    if (line === "Stream_Items" || line === "End_of_Stream_Items") {
      inItems = line === "Stream_Items";
      continue;
    }
    if (inItems) {
      const match = /^(\d+)\s+(.*)$/.exec(line);
      if (match) items.set(Number(match[1]), parseFeatures(match[2]));
      continue;
    }
    const header = /^Relation (\S+)/.exec(line);
    if (header) {
      relation = new Map();
      relations.set(header[1], relation);
    } else if (line === "End_of_Relation") {
      relation = null;
    } else if (relation) {
      const row = parseRelationRow(line);
      if (row) relation.set(...row);
    }
  }

  return { items, relations };
}

export function topLevelItems(relation: Relation): number[] {
  const head = [...relation].find(([, n]) => n.prev === 0 && n.up === 0);
  const items: number[] = [];
  for (let id = head?.[0] ?? 0; id !== 0 && items.length < relation.size; ) {
    const node = relation.get(id);
    if (!node) break;
    items.push(node.item);
    id = node.next;
  }
  return items;
}

export function leafItems(relation: Relation, item: number): number[] {
  const entry = [...relation].find(([, n]) => n.item === item);
  return entry ? collectLeaves(relation, entry[0], new Set()) : [];
}

function collectLeaves(relation: Relation, nodeId: number, seen: Set<number>): number[] {
  const node = relation.get(nodeId);
  if (!node || seen.has(nodeId)) return [];
  seen.add(nodeId);
  if (node.down === 0) return [node.item];
  const leaves: number[] = [];
  for (let child = node.down; child !== 0; child = relation.get(child)?.next ?? 0) {
    if (seen.has(child)) break;
    leaves.push(...collectLeaves(relation, child, seen));
  }
  return leaves;
}
