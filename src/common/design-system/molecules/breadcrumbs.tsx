import { Link, useLocation } from '@tanstack/react-router';
import {
  createContext,
  Fragment,
  PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../atoms/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../atoms/ui/dropdown-menu';

// --- Context ---

interface BreadcrumbItemData {
  id: string;
  label: React.ReactNode;
  link: string;
  order: number;
}

interface BreadcrumbContextValue {
  register: (id: string, label: React.ReactNode, link: string) => void;
  unregister: (id: string) => void;
  items: BreadcrumbItemData[];
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

const useBreadcrumbs = () => {
  const ctx = use(BreadcrumbContext);
  if (!ctx) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return ctx;
};

// --- Provider ---

export const BreadcrumbProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<BreadcrumbItemData[]>([]);
  const orderRef = useRef(0);

  const register = useCallback(
    (id: string, label: React.ReactNode, link: string) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === id);
        if (existingIndex >= 0) {
          return prev.map((item) =>
            item.id === id ? { ...item, label, link } : item,
          );
        }
        return [...prev, { id, label, link, order: orderRef.current++ }];
      });
    },
    [],
  );

  const unregister = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ register, unregister, items }),
    [register, unregister, items],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// --- OutletBreadcrumb ---

interface BreadcrumbProps extends PropsWithChildren {
  link?: string;
}

export const OutletBreadcrumb = ({ children, link }: BreadcrumbProps) => {
  const id = useId();
  const location = useLocation();
  const { register, unregister } = useBreadcrumbs();
  const href = link || location.pathname;

  useEffect(() => {
    register(id, children, href);
  }, [id, children, href, register]);

  useEffect(() => {
    return () => unregister(id);
  }, [id, unregister]);

  return null;
};

// --- BreadcrumbsOutlet ---

/**
 * Computes how many breadcrumb items to collapse based on available width.
 *
 * Uses position-based measurements from the hidden measurement row's
 * `getBoundingClientRect()` values. This naturally accounts for flex gaps
 * (including responsive ones like `gap-1.5 sm:gap-2.5`) without parsing CSS.
 *
 * Measurement row children layout (N = context item count):
 *   [Home] [sep] [ctx0] [sep] [ctx1] [sep] … [ctxN-1] [sep] [ell] [sep]
 *   Index:   0      1    2      3      4      5          2N    2N+1  2N+2  2N+3
 *   Total children = 2·N + 4
 */
function computeCollapsedCount(
  measureEl: HTMLOListElement,
  availableWidth: number,
  itemCount: number,
): number {
  if (availableWidth === 0 || itemCount < 2) return 0;

  const children = Array.from(measureEl.children) as HTMLElement[];
  const expectedCount = 2 * itemCount + 4;
  if (children.length < expectedCount) return 0;

  const rects = children.map((c) => c.getBoundingClientRect());
  const N = itemCount;

  // k = 0: visible = [Home, sep, ctx0, sep, …, ctxN-1]
  // These occupy measurement-row indices 0…2N (contiguous), so we can
  // read the total width directly from element positions (gaps included).
  const widthK0 = rects[2 * N].right - rects[0].left;
  if (widthK0 <= availableWidth) return 0;

  // Derive the flex gap from adjacent element positions.
  const gap = rects[1].left - rects[0].right;
  const homeW = rects[0].width;
  const sepW = rects[1].width;
  const ellW = rects[2 * N + 2].width;

  // k > 0: visible = [Home, sep, ell, sep, ctxK, sep, …, ctxN-1]
  // The context slice ctxK…ctxN-1 is contiguous in the measurement row
  // (indices 2K+2…2N), so we measure it directly from positions.
  // Non-contiguous items (Home, sep, ell, sep) are summed individually.
  for (let k = 1; k < N; k++) {
    const ctxGroupWidth = rects[2 * N].right - rects[2 * k + 2].left;
    const width = homeW + 2 * sepW + ellW + ctxGroupWidth + 4 * gap;
    if (width <= availableWidth) return k;
  }

  return N - 1;
}

export const BreadcrumbsOutlet = () => {
  const { items } = useBreadcrumbs();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const [collapsedCount, setCollapsedCount] = useState(0);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items],
  );

  // Observe both the container (for available width) and the measurement
  // row (for item width changes). The ResizeObserver callback is an
  // external-system subscription, so calling setState here is valid.
  useEffect(() => {
    const containerEl = containerRef.current;
    const measureEl = measureRef.current;
    if (!containerEl || !measureEl) return;

    const recompute = () => {
      const count = computeCollapsedCount(
        measureEl,
        containerEl.clientWidth,
        sortedItems.length,
      );
      setCollapsedCount(count);
    };

    const observer = new ResizeObserver(recompute);
    observer.observe(containerEl);
    observer.observe(measureEl);

    // Compute immediately so the collapse state is correct before the
    // first ResizeObserver callback fires (which may be async).
    recompute();

    return () => observer.disconnect();
  }, [sortedItems]);

  const collapsedItems = sortedItems.slice(0, collapsedCount);
  const visibleItems = sortedItems.slice(collapsedCount);

  return (
    <div
      ref={containerRef}
      className="min-w-0 flex-1 overflow-hidden"
    >
      <Breadcrumb>
        {/* Hidden measurement row — always renders every item so we can
            measure widths and compute how many to collapse. */}
        <BreadcrumbList
          ref={measureRef}
          className="invisible absolute flex-nowrap"
          aria-hidden
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="text-sm"
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          {sortedItems.map((item) => (
            <Fragment key={item.id}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={item.link}
                  className="text-sm"
                >
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}

          <BreadcrumbItem>
            <BreadcrumbEllipsis className="h-auto w-auto" />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>

        {/* Visible row */}
        <BreadcrumbList className="flex-nowrap">
          {/* Home — always visible, outside context registry */}
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="text-sm"
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>

          {sortedItems.length > 0 && <BreadcrumbSeparator />}

          {/* Collapsed items dropdown */}
          {collapsedCount > 0 && (
            <>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-center"
                    >
                      <BreadcrumbEllipsis className="h-auto w-auto" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {collapsedItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        asChild
                      >
                        <Link to={item.link}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          {/* Visible context items */}
          {visibleItems.map((item, idx) => (
            <Fragment key={item.id}>
              <BreadcrumbItem>
                {idx === visibleItems.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.link}
                    className="text-sm"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {idx < visibleItems.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
