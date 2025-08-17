import "server-only";
import { localeType } from "./lang";

export const getDictionary = async (locale: localeType) => {
  try {
    const dict = await import(`@/dictionaries/${locale}.json`);
    return dict.default;
  } catch (err) {
    console.error(`Dictionary for locale "${locale}" not found.`);
    throw err;
  }
};
