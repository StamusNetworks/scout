import { useRouter } from '@tanstack/react-router';
import { ComponentType } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryProps,
  FallbackProps,
} from 'react-error-boundary';

import { Column } from './layout/column';
import { Row } from './layout/row';
import { Button } from './ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="error"
    >
      <p>Something went wrong:</p>
      <pre>{error?.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

type CustomErrorBoundaryProps = Omit<
  ErrorBoundaryProps,
  'fallback' | 'fallbackRender' | 'FallbackComponent'
> & {
  FallbackComponent?: ComponentType<FallbackProps>;
};

export function ErrorBoundary({
  FallbackComponent = ErrorFallback,
  ...props
}: CustomErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      {...props}
    >
      {props.children}
    </ReactErrorBoundary>
  );
}

export function PageErrorFallback({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="flex h-full items-center justify-center">
      <Column className="items-center">
        <h1 className="mb-1 text-2xl font-bold">Something went wrong :(</h1>
        <pre className="mb-2 text-sm">{error.message}</pre>
        <Row className="gap-2">
          <Button
            onClick={() => router.history.back()}
            variant="secondary"
          >
            Go back
          </Button>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </Row>
      </Column>
    </div>
  );
}
export function PageBoundary(props: React.PropsWithChildren) {
  return (
    <ErrorBoundary FallbackComponent={PageErrorFallback}>
      {props.children}
    </ErrorBoundary>
  );
}
