import { Navigation, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Container } from '@/common/design-system/atoms/layout/container';
import { Button } from '@/common/design-system/atoms/ui/button';

import { routes } from '../../../../pages/routes.config';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Container className="flex h-[calc(100vh-50px)] flex-col items-center justify-center gap-3">
      <SearchX size={64} />
      <Column className="gap-1.5 text-center">
        <h1 className="text-2xl font-bold">
          The page you are looking for does not exist.
        </h1>
        <p className="text-muted-foreground">
          Please check the URL and try again.
        </p>
      </Column>
      <Button
        className="mt-2"
        onClick={() => navigate(routes.operational_center)}
      >
        <Navigation />
        Bring me home
      </Button>
    </Container>
  );
};
