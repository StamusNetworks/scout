import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import {
  selectAutoOpenSidebarOnFilterAdd,
  setAutoOpenSidebarOnFilterAdd,
} from '@/features/app-shell/state/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  selectAutoOpenSidebarOnNavigation,
  setAutoOpenSidebarOnNavigation,
} from '../../state/preferences.slice';
import {
  Category,
  CategoryContent,
  CategoryHeader,
  CategoryTitle,
  FieldDescription,
  FieldTitle,
} from '../preferences-layout';

export const SidebarConfig = () => {
  const dispatch = useAppDispatch();
  const autoOpenSidebarOnNavigation = useAppSelector(
    selectAutoOpenSidebarOnNavigation,
  );
  const autoOpenSidebarOnFilterAdd = useAppSelector(
    selectAutoOpenSidebarOnFilterAdd,
  );
  return (
    <Category>
      <CategoryHeader>
        <CategoryTitle>Sidebars</CategoryTitle>
      </CategoryHeader>
      <CategoryContent>
        <Column>
          <Row className="gap-2">
            <Switch
              checked={autoOpenSidebarOnNavigation}
              onCheckedChange={() =>
                dispatch(
                  setAutoOpenSidebarOnNavigation(!autoOpenSidebarOnNavigation),
                )
              }
              className="mt-1"
              size="sm"
            />

            <Column>
              <FieldTitle>Auto open filters sidebar on navigation</FieldTitle>
              <FieldDescription>
                If enabled, the sidebar will be opened automatically when you
                navigate to a new page where the global filters are enabled.
              </FieldDescription>
            </Column>
          </Row>
          <Row className="gap-2">
            <Switch
              checked={autoOpenSidebarOnFilterAdd}
              onCheckedChange={() =>
                dispatch(
                  setAutoOpenSidebarOnFilterAdd(!autoOpenSidebarOnFilterAdd),
                )
              }
              className="mt-1"
              size="sm"
            />
            <Column>
              <FieldTitle>
                Auto open filters sidebar when adding a new filter
              </FieldTitle>
              <FieldDescription>
                If enabled, the sidebar will be opened automatically when you
                add a new global filter.
              </FieldDescription>
            </Column>
          </Row>
        </Column>
      </CategoryContent>
    </Category>
  );
};
