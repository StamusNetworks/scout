import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import { MENU_WIDTH, useTimelineContext } from './timeline';

interface TimelineControlsProps {
  timelineRef: React.RefObject<HTMLDivElement | null>;
  setCursor: (cursor: 'grabbing' | 'grab' | 'default') => void;
}

export const TimelineControls = ({
  timelineRef,
  setCursor,
}: TimelineControlsProps) => {
  const { from_date, to_date, setFromDate, setToDate } = useTimelineContext();
  const [markerVisible, setMarkerVisible] = useState(false);
  const [markerXOffset, setMarkerXOffset] = useState<number>(0);
  const [markerTimestamp, setMarkerTimestamp] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragEndX, setDragEndX] = useState<number>(0);
  const [lastPanX, setLastPanX] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleZoomOut = useCallback(
    (event: KeyboardEvent) => {
      if (!isHovering) return;
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        const timeRange = to_date - from_date;
        const zoomAmount = timeRange * 0.5; // 50% of the current range

        setFromDate(from_date - zoomAmount);
        setToDate(to_date + zoomAmount);
      }
    },
    [from_date, to_date, setFromDate, setToDate, isHovering],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!event.shiftKey || !timelineRef.current || !markerVisible) return;

      event.preventDefault();
      const rect = timelineRef.current.getBoundingClientRect();
      const timelineWidth = rect.width - MENU_WIDTH;
      const timeRange = to_date - from_date;

      // Calculate the timestamp at the marker position
      const markerTimestamp =
        from_date + ((markerXOffset - MENU_WIDTH) / timelineWidth) * timeRange;

      // Calculate zoom factor based on wheel direction
      const delta = event.deltaX || event.deltaY;
      const zoomFactor = delta < 0 ? 0.9 : 1.1; // Zoom in on scroll up, out on scroll down

      // Calculate new dates centered on the marker position
      const newFromDate =
        markerTimestamp - (markerTimestamp - from_date) * zoomFactor;
      const newToDate =
        markerTimestamp + (to_date - markerTimestamp) * zoomFactor;

      setFromDate(newFromDate);
      setToDate(newToDate);
    },
    [
      markerVisible,
      markerXOffset,
      from_date,
      to_date,
      setFromDate,
      setToDate,
      timelineRef,
    ],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isDragging || isPanning)) {
        event.preventDefault();
        setIsDragging(false);
        setIsPanning(false);
        setCursor('default');
      }
      if (event.key === 'Shift' && isHovering && !isPanning) {
        setCursor('grab');
      }
    },
    [isDragging, isPanning, isHovering, setCursor],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Shift' && !isPanning) {
        setCursor('default');
      }
    },
    [isPanning, setCursor],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;

      // Only show marker when mouse is over the timeline area
      if (x > MENU_WIDTH) {
        setMarkerVisible(true);
        setMarkerXOffset(x);
        setIsHovering(true);

        if (event.shiftKey && !isPanning) {
          setCursor('grab');
        } else if (!isPanning) {
          setCursor('default');
        }

        // Calculate timestamp for the marker position
        const timelineWidth = rect.width - MENU_WIDTH;
        const timeRange = to_date - from_date;
        const timestamp =
          from_date + ((x - MENU_WIDTH) / timelineWidth) * timeRange;
        setMarkerTimestamp(new Date(timestamp));

        if (isDragging) {
          setDragEndX(x);
        } else if (isPanning) {
          const deltaX = x - lastPanX;
          const timelineWidth = rect.width - MENU_WIDTH;
          const timeRange = to_date - from_date;
          const timeDelta = (deltaX / timelineWidth) * timeRange;

          setFromDate(from_date - timeDelta);
          setToDate(to_date - timeDelta);
          setLastPanX(x);
        }
      } else {
        setIsHovering(false);
        setMarkerVisible(false);
        setMarkerTimestamp(null);
      }
    },
    [
      isDragging,
      isPanning,
      lastPanX,
      from_date,
      to_date,
      setFromDate,
      setToDate,
      setCursor,
      timelineRef,
    ],
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;

      if (x > MENU_WIDTH) {
        event.preventDefault(); // Prevent text selection

        if (event.shiftKey) {
          setIsPanning(true);
          setLastPanX(x);
          setCursor('grabbing');
        } else {
          setIsDragging(true);
          setDragStartX(x);
          setDragEndX(x);
        }
      }
    },
    [timelineRef, setCursor],
  );

  const handleMouseUp = useCallback(() => {
    if (!timelineRef.current || (!isDragging && !isPanning)) return;

    if (isDragging) {
      const rect = timelineRef.current.getBoundingClientRect();
      const timelineWidth = rect.width - MENU_WIDTH;
      const timeRange = to_date - from_date;

      // Calculate the selected dates based on drag positions
      const startX = Math.min(dragStartX, dragEndX);
      const endX = Math.max(dragStartX, dragEndX);

      // Only update dates if there was actual dragging (start and end positions are different)
      if (startX !== endX) {
        const newFromDate =
          from_date + ((startX - MENU_WIDTH) / timelineWidth) * timeRange;
        const newToDate =
          from_date + ((endX - MENU_WIDTH) / timelineWidth) * timeRange;

        setFromDate(newFromDate);
        setToDate(newToDate);
      }
    }

    setIsDragging(false);
    setIsPanning(false);
    setCursor('default');
  }, [
    isDragging,
    isPanning,
    dragStartX,
    dragEndX,
    from_date,
    to_date,
    setFromDate,
    setToDate,
    timelineRef,
    setCursor,
  ]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMarkerVisible(false);
    setMarkerTimestamp(null);
    setCursor('default');
    if (isDragging || isPanning) {
      setIsDragging(false);
      setIsPanning(false);
    }
  }, [isDragging, isPanning, setCursor]);

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleZoomOut);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleZoomOut);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleZoomOut,
    handleKeyDown,
    handleKeyUp,
    timelineRef,
  ]);

  return (
    <>
      {markerVisible && !isDragging && !isPanning && (
        <>
          <div
            className="bg-primary/50 pointer-events-none absolute left-(--markerXOffset) z-20 h-full w-px"
            style={
              { '--markerXOffset': `${markerXOffset}px` } as React.CSSProperties
            }
          />
          <div
            className="bg-primary/90 absolute top-1 left-(--markerXOffset) w-fit -translate-x-1/2 rounded px-2 py-1 text-xs text-wrap text-white"
            style={
              { '--markerXOffset': `${markerXOffset}px` } as React.CSSProperties
            }
          >
            {markerTimestamp && (
              <>
                <p>{format(markerTimestamp, 'dd/MM/yyyy')}</p>
                <p>{format(markerTimestamp, 'HH:mm:ss')}</p>
              </>
            )}
          </div>
        </>
      )}
      {isDragging && (
        <div
          className="border-primary/50 bg-primary/10 absolute top-0 z-40 h-full border"
          style={{
            left: `${Math.min(dragStartX, dragEndX)}px`,
            width: `${Math.abs(dragEndX - dragStartX)}px`,
          }}
        />
      )}
    </>
  );
};
