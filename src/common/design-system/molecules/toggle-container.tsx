import { cn } from '@/common/lib/utils';
import { selectWithPageContainer } from '@/features/ui/ui-state.slice';
import { useAppSelector } from '@/store/store';

import { Container } from '../atoms/layout/container';
import { PageContainer } from '../atoms/page';

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
