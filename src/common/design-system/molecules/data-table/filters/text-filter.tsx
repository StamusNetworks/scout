import { useEffect, useState } from 'react';

import { Input } from '@/common/design-system/atoms/ui/input';

type TextFilterProps = {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TextFilter({ value, onChange, placeholder }: TextFilterProps) {
  const [localValue, setLocalValue] = useState(value ?? '');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(localValue);
    }, 550);

    return () => clearTimeout(timeoutId);
  }, [localValue, onChange]);

  return (
    <Input
      placeholder={placeholder ? placeholder : 'Write to filter...'}
      value={localValue}
      onChange={(event) => setLocalValue(event.target.value)}
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
}
