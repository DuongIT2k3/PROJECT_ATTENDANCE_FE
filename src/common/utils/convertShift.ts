export function convertShiftToTime(shift: string): string {
  switch (shift) {
    case '1':
      return "07:15 - 09:15";
    case '2':
      return "09:25 - 11:25";
    case '3':
      return "12:00 - 14:00";
    case '4':
      return "14:10 - 16:10";
    case '5':
      return "16:20 - 18:20";
    case '6':
      return "18:30 - 20:30";
    default:
      return shift;
  }
}