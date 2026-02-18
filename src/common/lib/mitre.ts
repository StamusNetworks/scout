export const getMitreTechniqueUrl = (mitre_technique_id: string) => {
  if (mitre_technique_id.includes('.')) {
    return `https://attack.mitre.org/techniques/${mitre_technique_id.split('.')[0]}/${mitre_technique_id.split('.')[1]}`;
  }
  return `https://attack.mitre.org/techniques/${mitre_technique_id}`;
};

export const getMitreTacticUrl = (mitre_tactic_url: string) => {
  return `https://attack.mitre.org/tactics/${mitre_tactic_url}`;
};

export const formatMitreString = (mitreString: string) => {
  return mitreString.toString().replaceAll('_', ' ');
};
