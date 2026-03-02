import { KillChainPhase } from '../../killchain/killchain';
import { OffendersData } from '../models/offenders.model';
import {
  KCChange,
  ThreatHistory,
  TimelineProps,
  TimelineThreat,
} from '../models/threat-history.model';

export const formatThreatHistory = (
  threatHistory: ThreatHistory[],
): Omit<TimelineProps, 'offenders' | 'lateralMovements'> => {
  // Group entries by asset
  const grouped = threatHistory.reduce(
    (acc, entry) => {
      if (!acc[entry.asset]) acc[entry.asset] = [];
      acc[entry.asset].push(entry);
      return acc;
    },
    {} as Record<string, ThreatHistory[]>,
  );

  const entities = Object.entries(grouped).map(([asset, entries]) => {
    const victimEntry = entries.find((e) => !e.is_offender);
    const offenderEntry = entries.find((e) => e.is_offender);

    // Threats: combine victim and offender
    const victimThreats = victimEntry ? getThreats(victimEntry.history) : [];
    const offenderThreats = offenderEntry
      ? getThreats(offenderEntry.history, true)
      : [];

    // KC phases: prefer victim, fallback to offender
    const kc_phases = victimEntry
      ? getKCPhases(
          victimEntry.kc_change_history.slice(0, -2) as KCChange[],
          victimEntry.last_seen,
        )
      : offenderEntry
        ? getKCPhases(
            offenderEntry.kc_change_history.slice(0, -2) as KCChange[],
            offenderEntry.last_seen,
            'kc_step_offender',
          )
        : [];

    return {
      entity: asset,
      threats: [...victimThreats, ...offenderThreats].sort(
        (a, b) => a.start_date - b.start_date,
      ),
      kc_phases,
    };
  });

  const start_date = Math.floor(
    Math.min(...threatHistory.map((tH) => new Date(tH.first_seen).getTime())),
  );
  const end_date = Math.floor(
    Math.max(...threatHistory.map((tH) => new Date(tH.last_seen).getTime())),
  );
  const gap = Math.floor(0.05 * (end_date - start_date));
  return {
    entities,
    start_date: start_date - gap,
    end_date: end_date + gap,
  };
};

const getThreats = (history: ThreatHistory['history'], isOffender = false) =>
  Object.values(
    history.reduce(
      (acc, curr) => {
        if (!acc[curr.threat_id]) {
          acc[curr.threat_id] = {
            threat_id: curr.threat_id,
            start_date: new Date(curr.timestamp).getTime(),
            end_date: new Date(curr.timestamp).getTime(),
            type: isOffender
              ? 'offender'
              : 'step_kill_chain' in curr.params &&
                  curr.params.step_kill_chain === 'pre_condition'
                ? 'dopv'
                : 'doc',
          };
        }
        if (curr.history_type === 'last_seen') {
          acc[curr.threat_id].end_date = new Date(curr.timestamp).getTime();
        }
        return acc;
      },
      {} as Record<string, TimelineThreat>,
    ),
  );

const getKCPhases = (
  kc_history: KCChange[],
  last_seen: string,
  phaseKey: 'kc_step' | 'kc_step_offender' = 'kc_step',
) => {
  const filtered =
    phaseKey === 'kc_step_offender'
      ? kc_history.filter((item) => item[phaseKey] != null)
      : kc_history;
  return filtered.map((item, index) => ({
    kc_phase: item[phaseKey] as KillChainPhase,
    start_date: new Date(item.timestamp).getTime(),
    end_date: new Date(
      index === filtered.length - 1 ? last_seen : filtered[index + 1].timestamp,
    ).getTime(),
  }));
};

export const getOffenders = (
  offendersData: OffendersData,
  entities: string[],
) =>
  offendersData.res.assets?.buckets.reduce(
    (acc, curr) => {
      if (!acc[curr.key]) {
        acc[curr.key] = [];
      }
      curr.offenders?.buckets.forEach((offender) => {
        if (entities.includes(offender.key)) {
          acc[curr.key].push({
            threat_id: offender.threat_id?.buckets[0].key.toString(),
            offender_ip: offender.key,
          });
        }
      });
      return acc;
    },
    {} as Record<
      string,
      {
        threat_id: string;
        offender_ip: string;
      }[]
    >,
  );
