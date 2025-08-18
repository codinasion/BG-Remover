export const defaultLang = "en";

const langListData = [
  "ar",
  "az",
  "bg",
  "bn",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "eo",
  "es",
  "et",
  "eu",
  "fa",
  "fi",
  "fr",
  "ga",
  "gl",
  "he",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ky",
  "lt",
  "lv",
  "ms",
  "nb",
  "nl",
  "pb",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sq",
  "sv",
  "th",
  "tl",
  "tr",
  "uk",
  "ur",
  "zh",
  "zt",
] as const;

export type Locale = (typeof langListData)[number];

export const rtlLanguages: Locale[] = ["ar", "fa", "he", "ur"];

export { langListData };

export type Lang = (typeof langListData)[number];

interface langType {
  lang: Lang;
}

export type localeType = (typeof langListData)[number];

export type { langType };
