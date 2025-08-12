/**
 * Simple HTML parser for Google Apps Script
 * Extracts text content from HTML elements using regex patterns
 */
export class SimpleHTMLParser {
  private html: string;

  constructor(html: string) {
    this.html = html;
  }

  /**
   * Find all elements matching a class selector
   */
  findByClass(className: string): string[] {
    const regex = new RegExp(`<[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\/[^>]+>`, 'gi');
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(this.html)) !== null) {
      matches.push(match[0]);
    }
    
    return matches;
  }

  /**
   * Extract text content from HTML string
   */
  static getTextContent(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Find elements with specific class within a parent element
   */
  static findInElement(parentHtml: string, className: string): string[] {
    const regex = new RegExp(`<[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\/[^>]+>`, 'gi');
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(parentHtml)) !== null) {
      matches.push(match[0]);
    }
    
    return matches;
  }
}
