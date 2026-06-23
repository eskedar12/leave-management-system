import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  gregorianToEthiopian,
  ethiopianToGregorianString,
  getDaysInEthiopianMonth,
  ETHIOPIAN_MONTHS
} from '../../utils/ethiopianDate';

const EthiopianDatePicker = ({ value, onChange, label }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'am' ? 'am' : 'en';

  // Initial State from current value (Gregorian string) or today
  const getInitialEthState = () => {
    const todayGreg = value ? new Date(value) : new Date();
    const eth = gregorianToEthiopian(todayGreg);
    return eth || { year: 2018, month: 10, day: 1 }; // Fallback
  };

  const [ethDate, setEthDate] = useState(getInitialEthState());
  const [isOpen, setIsOpen] = useState(false);

  // Sync state if external value changes
  useEffect(() => {
    if (value) {
      const eth = gregorianToEthiopian(value);
      if (eth) setEthDate(eth);
    }
  }, [value]);

  const yearsRange = [];
  const currentEthYear = 2018; // Sene 2018 EC is June 2026 GC
  for (let y = currentEthYear - 3; y <= currentEthYear + 5; y++) {
    yearsRange.push(y);
  }

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const maxDays = getDaysInEthiopianMonth(newYear, ethDate.month);
    const newDay = ethDate.day > maxDays ? maxDays : ethDate.day;
    updateSelectedDate(newYear, ethDate.month, newDay);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const maxDays = getDaysInEthiopianMonth(ethDate.year, newMonth);
    const newDay = ethDate.day > maxDays ? maxDays : ethDate.day;
    updateSelectedDate(ethDate.year, newMonth, newDay);
  };

  const handleDaySelect = (day) => {
    updateSelectedDate(ethDate.year, ethDate.month, day);
    setIsOpen(false);
  };

  const updateSelectedDate = (y, m, d) => {
    setEthDate({ year: y, month: m, day: d });
    const gregString = ethiopianToGregorianString(y, m, d);
    onChange(gregString);
  };

  const monthNames = ETHIOPIAN_MONTHS[lang];
  const selectedMonthName = monthNames[ethDate.month - 1];
  const formattedEthString = `${selectedMonthName} ${ethDate.day}, ${ethDate.year}`;
  const daysInMonth = getDaysInEthiopianMonth(ethDate.year, ethDate.month);

  return (
    <div className="eth-datepicker-container">
      {label && <label className="form-label">{label}</label>}
      
      {/* Date display trigger */}
      <div 
        className="eth-datepicker-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className="eth-date-text">{formattedEthString}</span>
        <span className="greg-date-subtext">({value || 'YYYY-MM-DD'})</span>
        <span className="eth-datepicker-icon">📅</span>
      </div>

      {isOpen && (
        <div className="eth-datepicker-dropdown">
          <div className="eth-datepicker-header">
            {/* Year Selector */}
            <select 
              value={ethDate.year} 
              onChange={handleYearChange}
              className="eth-select"
            >
              {yearsRange.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Month Selector */}
            <select 
              value={ethDate.month} 
              onChange={handleMonthChange}
              className="eth-select"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Days Grid */}
          <div className="eth-datepicker-grid">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`eth-day-cell ${ethDate.day === day ? 'selected' : ''}`}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="eth-datepicker-footer">
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsOpen(false)}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthiopianDatePicker;
