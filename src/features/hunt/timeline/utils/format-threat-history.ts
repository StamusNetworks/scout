import { KillChainPhase } from '../../killchain/killchain';
import { OffendersData } from '../models/offenders.model';
import {
  KCChange,
  TimelineProps,
  TimelineThreat,
} from '../models/threat-history.model';
import { ThreatHistory } from '../models/threat-history.model';

export const formatThreatHistory = (
  threatHistory: ThreatHistory[],
): Omit<TimelineProps, 'offenders' | 'lateralMovements'> => {
  const entities = threatHistory.map((entity) => ({
    entity: entity.asset,
    threats: getThreats(entity.history),
    kc_phases: getKCPhases(
      entity.kc_change_history.slice(0, -2) as KCChange[],
      entity.last_seen,
    ),
  }));

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

const getThreats = (history: ThreatHistory['history']) =>
  Object.values(
    history.reduce(
      (acc, curr) => {
        if (!acc[curr.threat_id]) {
          acc[curr.threat_id] = {
            threat_id: curr.threat_id,
            start_date: new Date(curr.timestamp).getTime(),
            end_date: new Date(curr.timestamp).getTime(),
            type:
              'step_kill_chain' in curr.params &&
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

const getKCPhases = (kc_history: KCChange[], last_seen: string) =>
  kc_history.map((item, index) => {
    return {
      kc_phase: item.kc_step as KillChainPhase,
      start_date: new Date(item.timestamp).getTime(),
      end_date: new Date(
        index === kc_history.length - 1
          ? last_seen
          : kc_history[index + 1].timestamp,
      ).getTime(),
    };
  });

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
