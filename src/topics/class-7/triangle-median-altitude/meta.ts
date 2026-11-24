import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-median-altitude",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Median aur altitude",
    en: "Medians and altitudes",
    hi: "माध्यिका और शीर्षलंब",
  },
  summary: {
    hinglish: "Median saamne wali side ke midpoint tak jaati hai, altitude us side par 90° banati hai. Dono ko khud kheencho.",
    en: "A median goes to the midpoint of the opposite side; an altitude meets it at 90°. Draw both yourself.",
    hi: "माध्यिका सामने की भुजा के मध्य-बिंदु तक जाती है; शीर्षलंब उस भुजा पर 90° बनाता है। दोनों को खुद खींचो।",
  },
  ncert: { 7: "The Triangle and its Properties" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-types"],
  tags: ["median", "altitude", "midpoint"],
  order: 40,
});
