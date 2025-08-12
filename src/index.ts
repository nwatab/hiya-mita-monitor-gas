/// <reference types="google-apps-script" />

import { 
  Status, 
  Store, 
  StoreAvailability, 
  DayAvailability, 
  AvailabilityRow, 
  SHOP_NAMES 
} from './types';
import { SimpleHTMLParser } from './htmlParser';

// Constants for current year and month
const CURRENT_YEAR = 2025;
const CURRENT_MONTH = 8;
const SHEET_NAME = `${CURRENT_YEAR}-${CURRENT_MONTH.toString().padStart(2, '0')}`;
const TARGET_URL = `https://aa-hiya-mita.site/?year=${CURRENT_YEAR}&month=${CURRENT_MONTH}`;

// Re-export types for backward compatibility
export type { Status, Store, StoreAvailability, DayAvailability, AvailabilityRow };
export { SHOP_NAMES, SimpleHTMLParser };

/**
 * Parse HTML content and extract shop availability data using regex-based parsing
 * @param htmlContent - Raw HTML content to parse
 * @returns Array of day availability objects
 */
export function parseAvailabilities(htmlContent: string): DayAvailability[] {
  const result: DayAvailability[] = [];

  // Find all day cells and their content by looking for the pattern more carefully
  // We need to handle nested TD elements properly
  
  //   const dayPattern = /<td[^>]*class="day"[^>]*>\s*<div class="day-number">(\d+)<\/div>\s*<div class="day-detail">([\s\S]*?)<\/div>\s*<\/td>/gi;
  // クラスの順番やクォートの違いに耐える
  const dayPattern = /<td[^>]*class=["'][^"']*\bday\b[^"']*["'][^>]*>\s*[\s\S]*?<div[^>]*class=["'][^"']*\bday-number\b[^"']*["'][^>]*>\s*(\d+)\s*<\/div>\s*[\s\S]*?<div[^>]*class=["'][^"']*\bday-detail\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/td>/gi;

  let dayMatch;
  
  while ((dayMatch = dayPattern.exec(htmlContent)) !== null) {
    const dayNum = parseInt(dayMatch[1]);
    const dayDetailContent = dayMatch[2];
    
    if (isNaN(dayNum) || dayNum === 0) continue;

    const stores: StoreAvailability = {} as StoreAvailability;

    // Extract shop data from table rows within the day-detail content
    const rowRegex = /<tr>\s*<td>([^<]+)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(dayDetailContent)) !== null) {
      const shop = rowMatch[1].trim();
      const cellContent = rowMatch[2];
      
      // Check if there's a span with status text
      const spanMatch = cellContent.match(/<span[^>]*>([^<]+)<\/span>/);
      let status: string;
      
      if (spanMatch) {
        status = spanMatch[1].trim();
      } else {
        // If no span, extract the text content directly (for cases like "休")
        status = SimpleHTMLParser.getTextContent(cellContent).trim();
      }
      
      if (status === '') status = '完売';
      
      if (shop && SHOP_NAMES.indexOf(shop as Store) !== -1) {
        stores[shop as Store] = status as Status;
      }
    }

    // Only push if all shops are present
    if (Object.keys(stores).length === SHOP_NAMES.length) {
      result.push({
        date: dayNum.toString(),
        stores
      });
    }
  }

  return result;
}

/**
 * Setup headers for the spreadsheet with timestamp and shop columns for each day
 * Uses sheet named with current year-month from the active spreadsheet
 */
export function setupHeader(): void {
  // Get the active spreadsheet and sheet named with current year-month
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let targetSheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!targetSheet) {
    targetSheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  const headers = ['timestamp'];
  
  // Add columns for each day (1-31) for each shop
  for (let day = 1; day <= 31; day++) {
    SHOP_NAMES.forEach(shop => {
      headers.push(`${shop}-${day}`);
    });
  }
  
  targetSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

/**
 * Fetch HTML from the website, parse availability data, and save to spreadsheet
 * This function is designed to work in Google Apps Script environment
 */
export function logAvailability(): void {
  try {
    // Fetch HTML from the website using UrlFetchApp (Google Apps Script)
    const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(TARGET_URL);
    const html: string = response.getContentText();
    
    // Parse the availability data
    const availabilities = parseAvailabilities(html);
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get or create sheet with current year-month name
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    
    // Create a single row with timestamp and all availability data
    const timestamp = new Date().toISOString();
    const rowData = [timestamp];
    
    // For each day (1-31), add status for each shop
    for (let day = 1; day <= 31; day++) {
      SHOP_NAMES.forEach(shopName => {
        // Find if we have data for this day and shop
        const dayData = availabilities.find(av => av.date === day.toString());
        if (dayData) {
          rowData.push(dayData.stores[shopName] || '');
        } else {
          rowData.push('');
        }
      });
    }
    
    // Append the single row to the sheet
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    
    console.log(`Successfully logged availability data for ${availabilities.length} day(s) to sheet "${SHEET_NAME}"`);
  } catch (error) {
    console.error('Error fetching and logging availability data:', error);
  }
}
