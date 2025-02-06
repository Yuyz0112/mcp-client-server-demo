import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useCallback } from "react";

dayjs.extend(relativeTime);

const Time = ({ date }: { date: Date }) => {
  const [displayText, setDisplayText] = useState("");

  const updateTime = useCallback(() => {
    const time = dayjs(date);
    const now = dayjs();
    const diffInSeconds = now.diff(time, "second");
    const diffInMinutes = now.diff(time, "minute");

    let newDisplayText;

    if (diffInSeconds < 60) {
      newDisplayText = `${diffInSeconds} 秒前`;
    } else if (diffInMinutes < 60) {
      newDisplayText = `${diffInMinutes} 分钟前`;
    } else {
      newDisplayText = time.format("YYYY-MM-DD HH:mm");
    }

    setDisplayText(newDisplayText);
  }, [date]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [updateTime]);

  return displayText;
};

export default Time;
