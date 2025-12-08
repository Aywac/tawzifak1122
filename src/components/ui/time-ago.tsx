'use client';

import { useEffect, useState } from 'react';

interface TimeAgoProps {
  date: string | number | Date;
  initialText?: string;
}

export function TimeAgo({ date, initialText }: TimeAgoProps) {
  const [timeText, setTimeText] = useState(initialText || '');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const dateObj = new Date(date);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

      if (seconds < 60) {
        setTimeText('الآن');
        return;
      }

      const interval = seconds / 31536000;
      if (interval > 1) {
        const years = Math.floor(interval);
        if (years === 1) setTimeText('قبل سنة');
        else if (years === 2) setTimeText('قبل سنتين');
        else if (years <= 10) setTimeText(`قبل ${years} سنوات`);
        else setTimeText(`قبل ${years} سنة`);
        return;
      }

      const months = Math.floor(seconds / 2592000);
      if (months >= 1) {
        if (months === 1) setTimeText('قبل شهر');
        else if (months === 2) setTimeText('قبل شهرين');
        else if (months <= 10) setTimeText(`قبل ${months} أشهر`);
        else setTimeText(`قبل ${months} شهر`);
        return;
      }

      const days = Math.floor(seconds / 86400);
      if (days >= 1) {
        if (days === 1) setTimeText('قبل يوم');
        else if (days === 2) setTimeText('قبل يومين');
        else if (days <= 10) setTimeText(`قبل ${days} أيام`);
        else setTimeText(`قبل ${days} يوم`);
        return;
      }

      const hours = Math.floor(seconds / 3600);
      if (hours >= 1) {
        if (hours === 1) setTimeText('قبل ساعة');
        else if (hours === 2) setTimeText('قبل ساعتين');
        else if (hours <= 10) setTimeText(`قبل ${hours} ساعات`);
        else setTimeText(`قبل ${hours} ساعة`);
        return;
      }

      const minutes = Math.floor(seconds / 60);
      if (minutes >= 1) {
        if (minutes === 1) setTimeText('قبل دقيقة');
        else if (minutes === 2) setTimeText('قبل دقيقتين');
        else if (minutes <= 10) setTimeText(`قبل ${minutes} دقائق`);
        else setTimeText(`قبل ${minutes} دقيقة`);
        return;
      }
    };

    calculateTimeAgo();

    const timer = setInterval(calculateTimeAgo, 60000);
    return () => clearInterval(timer);
  }, [date]);

  return (
    <span suppressHydrationWarning>
      {timeText}
    </span>
  );
}