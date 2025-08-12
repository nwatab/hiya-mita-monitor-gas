import * as fs from 'fs';
import * as path from 'path';
import { parseAvailabilities } from '../src/index';

// Read the sample HTML file
const sampleHtml = fs.readFileSync(path.join(__dirname, 'aono-1755012910724.html'), 'utf8');

describe('parseAvailabilities', () => {
  test('should parse availability data from sample HTML', () => {
    const availabilities = parseAvailabilities(sampleHtml);
    
    console.log('Result length:', availabilities.length);
    console.log('First availability:', JSON.stringify(availabilities[0], null, 2));
    
    // Show sample data from multiple days
    console.log('\nSample data:');
    availabilities.slice(0, 3).forEach((day, index) => {
      const storeStatuses = Object.entries(day.stores).map(([store, status]) => `${store}: ${status}`).join(', ');
      console.log(`Day ${day.date}:`, storeStatuses);
    });

    // Basic assertions
    expect(availabilities).toBeDefined();
    expect(Array.isArray(availabilities)).toBe(true);
    expect(availabilities.length).toBeGreaterThan(0);
    
    // Check structure of first item
    if (availabilities.length > 0) {
      const firstDay = availabilities[0];
      expect(firstDay).toHaveProperty('date');
      expect(firstDay).toHaveProperty('stores');
      expect(typeof firstDay.stores).toBe('object');
      expect(Object.keys(firstDay.stores).length).toBeGreaterThan(0);
    }
  });

  test('should correctly parse day 1 availability as shown in the sample', () => {
    const availabilities = parseAvailabilities(sampleHtml);
    
    // Find day 1 data
    const day1 = availabilities.find(day => day.date === '1');
    expect(day1).toBeDefined();
    
    if (day1) {
      // Verify day 1 has all 5 stores with "完売" status
      expect(Object.keys(day1.stores)).toHaveLength(5);
      
      // Check each store specifically
      expect(day1.stores['赤坂本店']).toBe('完売');
      expect(day1.stores['赤坂見附店']).toBe('完売');
      expect(day1.stores['サカス店']).toBe('完売');
      expect(day1.stores['溜池店']).toBe('完売');
      expect(day1.stores['弁慶橋店']).toBe('完売');

      console.log('✓ Day 1 parsing verification passed: All stores show "完売" status');
    }
  });

  test('should correctly parse day 2 availability as shown in the sample', () => {
    const availabilities = parseAvailabilities(sampleHtml);
    
    // Find day 2 data
    const day2 = availabilities.find(day => day.date === '2');
    expect(day2).toBeDefined();
    
    if (day2) {
      // Verify day 2 has all 5 stores
      expect(Object.keys(day2.stores)).toHaveLength(5);
      
      // Check each store specifically - day 2 has mixed statuses
      expect(day2.stores['赤坂本店']).toBe('完売');
      expect(day2.stores['赤坂見附店']).toBe('完売');
      expect(day2.stores['サカス店']).toBe('完売');
      expect(day2.stores['溜池店']).toBe('休');  // This store is closed on day 2
      expect(day2.stores['弁慶橋店']).toBe('完売');

      console.log('✓ Day 2 parsing verification passed: Mixed store statuses (4 完売, 1 休)');
    }
  });

  test('should return empty array for invalid HTML', () => {
    const result = parseAvailabilities('<html><body>invalid</body></html>');
    expect(result).toEqual([]);
  });

  test('should handle empty string', () => {
    const result = parseAvailabilities('');
    expect(result).toEqual([]);
  });
});
