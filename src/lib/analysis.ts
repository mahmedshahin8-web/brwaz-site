export function calculateTension(script: string): number[] {
  // Simple heuristic: count markers like [!] and ! (emphatic), and [[O:id]]/[[C:id]]
  const lines = script.split('\n');
  return lines.map(line => {
    let score = 0;
    if (line.includes('[!]')) score += 5;
    if (line.includes('[[O:')) score += 3;
    if (line.includes('[[C:')) score += 3;
    if (line.includes('!')) score += 1;
    return Math.min(score, 10);
  });
}
