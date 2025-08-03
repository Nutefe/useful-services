import * as moment from 'moment';

export function getTimeFromDateString(dateString: string): string {
  const heure = moment(dateString).format('HH:mm');
  return heure;
}

export function getDateFromDateString(dateString: string): string {
  const date = moment(dateString).format('DD/MM/YYYY');
  return date;
}
