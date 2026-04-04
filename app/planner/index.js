import { Calendar } from "react-native-calendars";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export default function Planner() {
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadPlanner();
  }, []);

  const loadPlanner = async () => {
    const { data } = await supabase.from("planner").select("date");
    const marks = {};
    data?.forEach(d => {
      marks[d.date] = { marked: true };
    });
    setMarkedDates(marks);
  };

  return (
    <Calendar
      markedDates={markedDates}
      onDayPress={(day) => alert(`Selected ${day.dateString}`)}
    />
  );
}
``