import 'react-flagpack/dist/style.css';
import { cn } from '@/common/lib/utils';

import { Row } from './layout/row';

const countryCodeExceptions = {
  GB: 'GBR',
} as Record<string, string>;

interface FlagProps {
  code: string | undefined;
  size?: 's' | 'm' | 'l';
  gradient?: '' | 'top-down' | 'real-circular' | 'real-linear';
  hasBorder?: boolean;
  hasDropShadow?: boolean;
  hasBorderRadius?: boolean;
  className?: string;
}

export const Flag = ({
  code,
  size = 's',
  gradient = 'real-circular',
  hasBorder = false,
  hasDropShadow = false,
  hasBorderRadius = true,
  className = 'h-fit shrink-0',
}: FlagProps) => {
  if (!code) return null;

  const flagCode = countryCodeExceptions[code] || code;
  const flagSrc = `${import.meta.env.BASE_URL}flags/${size}/${flagCode}.svg`;

  return (
    <div
      className={cn(
        'flag',
        gradient,
        'size-' + size,
        hasBorder && 'border',
        hasDropShadow && 'drop-shadow-sm',
        hasBorderRadius && 'border-radius',
        className,
      )}
    >
      <img
        src={flagSrc}
        alt={`Flag of ${flagCode}`}
      />
    </div>
  );
};

interface CountryProps {
  code: string | undefined;
  country: string | undefined;
}
export const Country = ({ code, country }: CountryProps) => (
  <Row className="items-center gap-1">
    <Flag code={code} />
    {country}
  </Row>
);
