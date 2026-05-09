/**
 * Intelligently truncate markdown content while preserving structure
 */
export function truncateMarkdown(markdown: string, maxLength: number = 2000): string {
  if (!markdown || markdown.length <= maxLength) return markdown;

  // Split into lines for processing
  const lines = markdown.split('\n');
  let result: string[] = [];
  let currentLength = 0;
  let inCodeBlock = false;
  let codeBlockFence = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length + 1; // +1 for newline

    // Check if we're entering/exiting a code block
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockFence = line.trim();
      } else if (line.trim() === codeBlockFence || line.trim() === '```') {
        inCodeBlock = false;
        codeBlockFence = '';
      }
    }

    // If adding this line would exceed max length
    if (currentLength + lineLength > maxLength) {
      // If we're in a code block, close it properly
      if (inCodeBlock) {
        result.push('```');
      }
      
      // Find a good stopping point - prefer ending after a paragraph or heading
      if (result.length > 0) {
        // Look back for a good break point (empty line, heading, or list end)
        let breakPoint = result.length - 1;
        for (let j = result.length - 1; j >= Math.max(0, result.length - 5); j--) {
          const prevLine = result[j].trim();
          if (prevLine === '' || prevLine.startsWith('#') || prevLine.startsWith('---')) {
            breakPoint = j;
            break;
          }
        }
        result = result.slice(0, breakPoint + 1);
      }
      
      break;
    }

    result.push(line);
    currentLength += lineLength;
  }

  return result.join('\n').trim();
}

/**
 * Extract a meaningful preview from markdown content
 * Prioritizes content after badges and before detailed sections
 */
export function extractReadmePreview(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  let startIndex = 0;
  let badgeCount = 0;

  // Skip initial badges/shields - they're usually at the top
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();
    
    // Count badge lines (shields.io, img tags, etc.)
    if (line.includes('![') || line.includes('shields.io') || line.includes('<img')) {
      badgeCount++;
      continue;
    }
    
    // If we've seen badges and now hit content, start here
    if (badgeCount > 0 && line.length > 0 && !line.startsWith('#')) {
      startIndex = i;
      break;
    }
    
    // If we hit a main heading after title, start here
    if (i > 0 && line.startsWith('# ')) {
      startIndex = i;
      break;
    }
  }

  // If we skipped too much or found nothing, start from beginning
  if (startIndex > 15) startIndex = 0;

  // Get content from start point
  const contentLines = lines.slice(startIndex);
  const content = contentLines.join('\n');

  // Truncate intelligently
  return truncateMarkdown(content, 2500);
}

// Made with Bob
