import { en} from "./locales/en";
import { pt} from "./locales/pt";

export const translations = {
 en,
 pt
};

export type Language = 'en' | 'pt';
export type TranslationKeys = keyof typeof translations.en;
