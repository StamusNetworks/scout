export type ProbeDto = {
  appliance_id: number;
  name: string;
  descr: string;
  created_date: string;
  updated_date: string;
  address: string;
  port: number;
  last_seen: string;
  cores_count: number;
  cpu_model: string;
  memory: number;
  kernel: string;
  distribution: string;
  app_is_up: boolean;
  suri_running: boolean;
  suri_last_seen: string;
};
