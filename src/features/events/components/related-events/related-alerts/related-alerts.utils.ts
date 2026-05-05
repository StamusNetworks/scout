export const showMitreInfo = (mtn?: string, mti?: string) => {
  if (mtn && mti) {
    return `${mtn} ${mti}`;
  }
  if (mtn) {
    return mtn;
  }
  if (mti) {
    return mti;
  }
  return undefined;
};
