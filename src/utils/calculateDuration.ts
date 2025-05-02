export const calculateDuration = (startTime : string, endTime: string) => {
  const start = startTime.split(':');
  const end = endTime.split(':');
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  return endMinutes - startMinutes;
};