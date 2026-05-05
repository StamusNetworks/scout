import { BookUp2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/common/design-system/atoms/ui/button';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { getConfig } from '@/config';

import { useUpdatePushRuleSetMutation } from '../api/rules.api';

export const UpdatePushRuleSet = () => {
  const { enterprise } = useFeatureFlags();
  const [updatePushRuleSet] = useUpdatePushRuleSetMutation();
  const handleClick = () => {
    updatePushRuleSet({ enterprise })
      .unwrap()
      .then(() => window.open(getConfig()?.apiUrl + '/rules/status/', '_blank'))
      .catch(() => toast.error('Error updating rulesets'));
  };
  return (
    <Button
      onClick={handleClick}
      variant="outline"
    >
      <BookUp2 />
      Update/Push Ruleset
    </Button>
  );
};
