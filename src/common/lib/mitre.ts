export const getMitreTechniqueUrl = (mitre_technique_id: string) => {
  if (mitre_technique_id.includes('.')) {
    return `https://attack.mitre.org/techniques/${mitre_technique_id.split('.')[0]}/${mitre_technique_id.split('.')[1]}`;
  }
  return `https://attack.mitre.org/techniques/${mitre_technique_id}`;
};

export const formatMitreString = (mitreString: string) => {
  return mitreString.toString().replaceAll('_', ' ');
};
