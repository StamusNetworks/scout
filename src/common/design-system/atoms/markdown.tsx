import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { cn } from '@/common/lib/utils';

const LinkRenderer = ({ href, children }: React.ComponentProps<'a'>) => (
  <Link
    to={href || ''}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </Link>
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
