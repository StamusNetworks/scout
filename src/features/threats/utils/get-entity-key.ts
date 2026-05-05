export function getEntityKey(offender: boolean) {
  return offender ? 'stamus.source' : 'stamus.asset';
}
