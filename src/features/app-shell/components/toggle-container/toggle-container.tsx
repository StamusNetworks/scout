import { Container } from '@/common/design-system/atoms/layout/container';
import { PageContainer } from '@/common/design-system/atoms/page';
import { cn } from '@/common/lib/utils';
import { useAppSelector } from '@/store/store';

import { selectWithPageContainer } from '../../state/ui-state.slice';

type PageContainerProps = React.ComponentProps<typeof Container>;
export const TogglePageContainer = ({
  children,
  className,
  ...rest
}: PageContainerProps) => {
  const withPageContainer = useAppSelector(selectWithPageContainer);
  return (
    <PageContainer
      className={cn('transition-all duration-300', className)}
      fluid={!withPageContainer}
      {...rest}
    >
      {children}
    </PageContainer>
  );
};
