import ReactMarkdown from 'react-markdown';

import { cn } from '@/common/lib/utils';

const LinkRenderer = ({ href, children }: React.ComponentProps<'a'>) => (
  <a
    href={href || ''}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

export const Markdown = ({
  className,
  content,
}: {
  className?: string;
  content: string;
}) => (
  <div
    className={cn(
      '[&_a]:text-primary [&_a]:font-bold [&_a]:underline [&_ul]:list-inside [&_ul]:list-disc',
      className,
    )}
  >
    <ReactMarkdown components={{ a: LinkRenderer }}>{content}</ReactMarkdown>
  </div>
);
