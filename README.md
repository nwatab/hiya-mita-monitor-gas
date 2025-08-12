# Aono Hiyashi Mitarashi HTML Parser

This project fetches and parses HTML from a Japanese restaurant website (`https://aa-hiya-mita.site/`) and save them to spreadsheet on Google App Script.

## Usage in Google Apps Script

1. **Copy the built code**: After running `pnpm run build`, copy the contents of `dist/bundle.js` to GAS.

2. Set a periodic trigger against `logAvailability`.

## Available Functions

```ts
type Status = "休"|"完売"|"○"|"△"
type Store = "赤坂本店"|"赤坂見附店"|"サカス店"|"溜池店"|"弁慶橋店";
```

-
```ts
parseAvailabilities(html): {
    date: string,
    stores: [
      {
         store: Store,
         status: Status,
      }[]
    ] 
  }[]
```
  : Returns store availabilities
-
```ts
setupHeader(sheet: Sheet)
```
  : Setup headers for the spreadsheet with timestamp and shop columns for each day (1-31). Creates columns in the format: `timestamp`, `赤坂本店-1`, `赤坂見附店-1`, `サカス店-1`, `溜池店-1`, `弁慶橋店-1`, `赤坂本店-2`, etc.
-
```ts
logAvailability()
```
  : fetch, parse and save to sheet named "8". Periodic trigger should call this function.
