import { useAppSelector } from '@/store/store';

import { selectIsEnterprise } from '../state/settings.selectors';

export const useIsEnterprise = () => useAppSelector(selectIsEnterprise);
