import { scaleLinear } from 'd3-scale';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere,
  ZoomableGroup,
} from 'react-simple-maps';

import { replaceFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { useEnableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import { useTheme } from '@/features/ui/theming/useTheme';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

import { Tooltip, TooltipContent } from '../../molecules/tooltip';
import { WorldCountriesMap } from './world-map.config';

interface MapChartProps {
  data: { country: string; value: number }[];
}
const WorldMap = ({ data }: MapChartProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const forceTags = useEnableTags();
  const { isDark } = useTheme();
  const moving = useRef<boolean>(false);

  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const max = Math.max(...data.map((d) => d.value));

  const colors = !isDark
    ? {
        sphere: 'transparent',
        graticule: '#e4e5e6',
        emptyCountry: '#d6d9db',
        border: '#fff',
        rangeStart: '#0297a9',
        rangeEnd: '#005792',
      }
    : {
        sphere: 'transparent',
        graticule: '#4c4c4c',
        emptyCountry: '#2d2b35',
        border: '#000',
        rangeStart: '#0297a9',
        rangeEnd: '#005792',
      };

  const colorScale = scaleLinear()
    .domain([1, max])
    .range([colors.rangeStart, colors.rangeEnd] as Iterable<number>);

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <Tooltip
        open={!!tooltipContent}
        placement="top"
      >
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 147,
          }}
          height={400}
        >
          <ZoomableGroup
            center={[0, 0]}
            onMoveStart={() => {
              setTooltipContent(null);
              moving.current = true;
            }}
            onMoveEnd={() => {
              moving.current = false;
            }}
          >
            <Sphere
              id="main"
              stroke={colors.graticule}
              strokeWidth={0.5}
              fill={colors.sphere}
            />
            <Graticule
              stroke={colors.graticule}
              strokeWidth={0.5}
            />
            {data.length > 0 && (
              <Geographies geography={WorldCountriesMap}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const d = data.find(
                      (s) => s.country === geo.properties.ISO_A2,
                    );
                    const count = d?.value || 0;
                    const fill = d ? colorScale(count) : colors.emptyCountry;
                    const { NAME } = geo.properties;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill as string}
                        onMouseEnter={() => {
                          if (!moving.current)
                            setTooltipContent(`${NAME}: ${count}`);
                        }}
                        onMouseLeave={() => {
                          setTooltipContent(null);
                        }}
                        onClick={() => {
                          navigate(routes.explorer);
                          forceTags({
                            alert: false,
                            discovery: false,
                            stamus: true,
                          });
                          dispatch(
                            replaceFilters([
                              { key: 'geoip.country.name', value: NAME },
                            ]),
                          );
                        }}
                        style={{
                          default: {
                            outline: 'none',
                            stroke: colors.border,
                            strokeWidth: 0.25,
                          },
                          hover: {
                            outline: 'none',
                            stroke: colors.border,
                            strokeWidth: 0.25,
                            cursor: 'pointer',
                          },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            )}
          </ZoomableGroup>
        </ComposableMap>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export { WorldMap };
