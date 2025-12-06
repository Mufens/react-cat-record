import React, { useState, useMemo } from 'react';
import { Card } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import seasonImage from '@/assets/images/season.png';
import './DatePunch.scss';

const DatePunch: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const currentDay = today.getDate();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dateTitle = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; isCurrent: boolean; isToday?: boolean }> = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startWeekday = firstDay.getDay();

    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrent: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const isToday =
        day === todayDay && currentMonth === todayMonth && currentYear === todayYear;
      days.push({ day, isCurrent: true, isToday });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = 1; days.length < totalCells; i++) {
      days.push({ day: i, isCurrent: false });
    }

    return days;
  }, [currentMonth, currentYear, todayDay, todayMonth, todayYear]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const bgPositionX = useMemo(() => {
    const month = currentMonth;
    if (month >= 2 && month <= 4) {
      return '0%';
    } else if (month >= 5 && month <= 7) {
      return '33.333%';
    } else if (month >= 8 && month <= 10) {
      return '66.6%';
    } else {
      return '100%';
    }
  }, [currentMonth]);

  const seasonClass = useMemo(() => {
    const month = currentMonth;
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, [currentMonth]);

  return (
    <div className="calendar">
      <Card bodyStyle={{ padding: '10px' }}>
        <div
          className="calendar-title"
          style={{
            backgroundImage: `url(${seasonImage})`,
            backgroundPositionX: bgPositionX,
          }}
        >
          <div className={`day ${seasonClass}`}>{currentDay}</div>
          <div className="ym">
            <div className={`year ${seasonClass}`}>{currentYear}/</div>
            <div className={`month ${seasonClass}`}>{months[currentMonth]}</div>
          </div>
          <div className="change">
            <div onClick={prevMonth} className="change prev">
              <LeftOutlined />
            </div>
            <div onClick={nextMonth} className="change next">
              <RightOutlined />
            </div>
          </div>
        </div>

        <div className="calendar-content">
          <div className="row title">
            {dateTitle.map((item) => (
              <span key={item} className="weekday-title">{item}</span>
            ))}
          </div>
          <div className="row content">
            {calendarDays.map((dayObj, index) => (
              <span
                key={index}
                className={`${!dayObj.isCurrent ? 'not-current' : ''} ${dayObj.isToday ? 'is-today' : ''}`}
              >
                {dayObj.day}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DatePunch;
