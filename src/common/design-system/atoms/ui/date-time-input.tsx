import { useEffect, useRef } from 'react';
import { useTimescape } from 'timescape/react';

const inputClass =
  'rounded-sm bg-transparent text-foreground outline-hidden focus:ring-2 ring-offset-2 focus:ring-primary w-fit';

export function DateTimeInput({
  defaultValue = new Date(),
  minDate = 0,
  maxDate,
  onChange,
}: {
  defaultValue?: Date;
  minDate?: number;
  maxDate?: number;
  onChange: (date: Date | undefined) => void;
}) {
  const { getRootProps, getInputProps, update } = useTimescape({
    minDate: new Date(minDate),
    maxDate: maxDate ? new Date(maxDate) : undefined,
    date: defaultValue,
    onChangeDate: onChange,
    wheelControl: true,
  });

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    update((prev) => ({
      ...prev,
      minDate: minDate ? new Date(minDate) : new Date('1970-01-01 00:00:00'),
      maxDate: maxDate ? new Date(maxDate) : undefined,
    }));
  }, [minDate, maxDate, update]);

  const rootProps = getRootProps();
  return (
    <div
      className="border-input bg-background placeholder:text-muted-foreground flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      {...rootProps}
      // Ensure ref callback returns void, not null
      ref={(element) => {
        rootProps.ref(element);
      }}
    >
      <input
        {...getInputProps('years')}
        className={inputClass}
      />
      <span>/</span>
      <input
        {...getInputProps('months')}
        className={inputClass}
      />
      <span>/</span>
      <input
        {...getInputProps('days')}
        className={inputClass}
      />
      <span> </span>
      <input
        {...getInputProps('hours')}
        className={inputClass}
      />
      <span>:</span>
      <input
        {...getInputProps('minutes')}
        className={inputClass}
      />
      <span>:</span>
      <input
        {...getInputProps('seconds')}
        className={inputClass}
      />
    </div>
  );
}
