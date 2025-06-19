import moment from 'moment';

export function getTimeFromDateString(dateString: string): string {
  return moment(dateString).format('HH:mm');
}

export function getDateFromDateString(dateString: string): string {
  return moment(dateString).format('DD/MM/YYYY');
}
