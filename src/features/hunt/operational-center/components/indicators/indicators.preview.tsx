import { IndicatorsTemplate } from './indicators';

export const indicatorsPreviewProps = {
  globalStats: {
    volumetry: 10012312415123,
    nb_events: 12040345,
    nb_discovered_threats: 21,
    nb_discovered_policies: 7,
    nb_assets_threat: 12,
    nb_assets_policy: 3,
    nb_threats: 12,
    nb_policies: 4,
    nb_assets_threat_victim: 100,
    nb_assets_threat_attacker: 100,
    nb_assets_threat_both: 100,
    nb_discovered: 28,
  },
  previousGlobalStats: {
    volumetry: 10345353461123,
    nb_events: 12055945,
    nb_discovered_threats: 27,
    nb_discovered_policies: 14,
    nb_assets_threat: 15,
    nb_assets_policy: 4,
    nb_threats: 15,
    nb_policies: 5,
    nb_assets_threat_victim: 100,
    nb_assets_threat_attacker: 100,
    nb_assets_threat_both: 100,
    nb_discovered: 41,
  },
  eventsCount: {
    prev_doc_count: 125029,
    doc_count: 125029,
  },
  previousEventsCount: {
    prev_doc_count: 100,
    doc_count: 152929,
  },
  isGlobalLoading: false,
  isPreviousGlobalLoading: false,
  isEventsLoading: false,
  isPreviousEventsLoading: false,
  kibana_url: 'https://kibana.url',
};

export const IndicatorsAppliancePreview = () => {
  return <IndicatorsTemplate {...indicatorsPreviewProps} />;
};
