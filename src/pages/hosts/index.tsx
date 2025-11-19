import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { DiscoveredHosts } from '@/features/analytics/hosts/components/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/analytics/hosts/components/home-net-picker/home-net-picker';
import { useHomeNetParam } from '@/features/analytics/hosts/components/home-net-picker/use-home-net-param';
import { HostsTable } from '@/features/analytics/hosts/components/hostsTable';

export const HostsPage = () => {
  const [inHomeNetwork] = useHomeNetParam();
  return (
    <>
      <OutletBreadcrumb>Hosts</OutletBreadcrumb>
      <DefaultPage
        title="Hosts"
        actions={<HomeNetPicker />}
        description="Gain deep visibility into network assets, enriched with live host indicators and actionable insights. Effortlessly pivot into host details, apply global filters, or monitor key roles and services to accelerate investigation and improve network security awareness."
      >
        <DiscoveredHosts />
        <HostsTable inHomeNetwork={inHomeNetwork} />
      </DefaultPage>
    </>
  );
};
