import { EthDateTime } from 'ethiopian-calendar-date-converter';

// Ethiopian month names in Amharic and English transliteration
export const ETHIOPIAN_MONTHS = {
  am: [
    'መስከረም', // 1
    'ጥቅምት',  // 2
    'ህዳር',   // 3
    'ታህሳስ',  // 4
    'ጥር',    // 5
    'የካቲት',  // 6
    'መጋቢት',  // 7
    'ሚያዝያ',  // 8
    'ግንቦት',  // 9
    'ሰኔ',    // 10
    'ሐምሌ',   // 11
    'ነሐሴ',   // 12
    'ጳጉሜ'    // 13
  ],
  en: [
    'Meskerem',
    'Tekemt',
    'Hedar',
    'Tahsas',
    'Ter',
    'Yekatit',
    'Megabit',
    'Miazia',
    'Genbot',
    'Sene',
    'Hamle',
    'Nehase',
    'Pagume'
  ]
};

/**
 * Converts a Gregorian date to Ethiopian calendar representation
 * @param {string|Date} gregorianDate - Date representation (e.g. YYYY-MM-DD or Date object)
 * @returns {object} { year, month, day } (1-indexed month)
 */
export const gregorianToEthiopian = (gregorianDate) => {
  if (!gregorianDate) return null;
  const dateObj = typeof gregorianDate === 'string' ? new Date(gregorianDate) : gregorianDate;
  
  // Guard against invalid dates
  if (isNaN(dateObj.getTime())) return null;

  const ethDateTime = EthDateTime.fromEuropeanDate(dateObj);
  return {
    year: ethDateTime.year,
    month: ethDateTime.month,
    day: ethDateTime.date
  };
};

/**
 * Converts an Ethiopian date to a Gregorian Date object
 * @param {number} year - Ethiopian Year
 * @param {number} month - Ethiopian Month (1 - 13)
 * @param {number} day - Ethiopian Day (1 - 30, or 1 - 5/6 for month 13)
 * @returns {Date} Gregorian Date object
 */
export const ethiopianToGregorian = (year, month, day) => {
  if (!year || !month || !day) return null;
  try {
    const ethDateTime = new EthDateTime(Number(year), Number(month), Number(day));
    return ethDateTime.toEuropeanDate();
  } catch (error) {
    console.error('Ethiopian to Gregorian conversion error:', error);
    return null;
  }
};

/**
 * Converts an Ethiopian date to a YYYY-MM-DD Gregorian string
 * @param {number} year 
 * @param {number} month 
 * @param {number} day 
 * @returns {string} YYYY-MM-DD
 */
export const ethiopianToGregorianString = (year, month, day) => {
  const date = ethiopianToGregorian(year, month, day);
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formats a Gregorian date string as a readable Ethiopian date string (Amharic or English transliteration)
 * @param {string|Date} gregorianDate 
 * @param {string} lang - 'am' or 'en'
 * @returns {string} e.g. "መስከረም 12, 2016" or "Meskerem 12, 2016"
 */
export const formatGregorianAsEthiopian = (gregorianDate, lang = 'am') => {
  const eth = gregorianToEthiopian(gregorianDate);
  if (!eth) return '';
  
  const monthNames = ETHIOPIAN_MONTHS[lang] || ETHIOPIAN_MONTHS.am;
  const monthName = monthNames[eth.month - 1];
  
  return `${monthName} ${eth.day}, ${eth.year}`;
};

/**
 * Gets the number of days in an Ethiopian month
 * @param {number} year 
 * @param {number} month 
 * @returns {number}
 */
export const getDaysInEthiopianMonth = (year, month) => {
  if (month >= 1 && month <= 12) {
    return 30;
  }
  if (month === 13) {
    // Leap year calculation for Ethiopian calendar
    // In Ethiopian calendar, leap year is when (year + 1) % 4 === 0 (since EC year starts in Sept GC)
    // Actually, Melaku's EthDateTime handles this, let's look at leap year check:
    // If year is leap year, month 13 has 6 days, otherwise 5 days.
    // In Ethiopian Calendar, a year is leap year if year % 4 === 3 (e.g. 2011 was leap year ending in Pagume 6)
    // Let's verify by creating an EthDateTime instance with day 6 and see if it throws or is valid.
    try {
      const eth = new EthDateTime(year, 13, 6);
      return 6;
    } catch (e) {
      return 5;
    }
  }
  return 30;
};
