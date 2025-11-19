export type DashboardPanel = {
  panelId: string;
  tooltip: string;
  title: string;
  position: number;
  itemsMinWidth?: string;
  items: DashboardBlock[];
};

export type DashboardBlock = {
  i: string;
  title: string;
  tooltip: string;
};
