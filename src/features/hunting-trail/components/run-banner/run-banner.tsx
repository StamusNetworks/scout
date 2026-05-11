import { cn } from '@/common/lib/utils';

interface RunBannerProps {
  total: number;
  withResults: number;
  docsUrl: string;
  className?: string;
}

export function RunBanner({
  total,
  withResults,
  docsUrl,
  className,
}: RunBannerProps) {
  return (
    <div className={cn('mb-3 flex items-center gap-4 text-sm', className)}>
      <span>
        {total} queries ran · {withResults} returned results
      </span>
      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Learn more →
      </a>
    </div>
  );
}
