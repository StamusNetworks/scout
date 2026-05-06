import { toPairs } from 'ramda';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { FormItem } from '@/common/design-system/atoms/ui/form';
import { Label } from '@/common/design-system/atoms/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/common/design-system/atoms/ui/radio-group';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  actionTypes,
  copyActionsItems,
  downloadActionsItems,
} from '../../definitions/export-actions.config';
import {
  ExportAction,
  selectEnabledActions,
  selectExportAction,
  selectExportFormat,
  setExportAction,
  setExportFormat,
  toggleEnabledAction,
} from '../../state/preferences.slice';
import { ExportButton } from '../export-button/export-button';
import {
  Category,
  CategoryContent,
  CategoryHeader,
  CategoryTitle,
  FieldDescription,
  FieldTitle,
} from '../preferences-layout';

export const ExportFormatSelector = () => {
  const dispatch = useAppDispatch();
  const exportFormat = useAppSelector(selectExportFormat);
  const exportAction = useAppSelector(selectExportAction);
  const enabledActions = useAppSelector(selectEnabledActions);

  const handleChangeExportFormat = (value: string) => {
    dispatch(setExportFormat(value as keyof typeof actionTypes));
  };
  const handleChangeExportAction = (value: string) => {
    dispatch(setExportAction(value as keyof typeof actionTypes));
  };
  const handleToggleEnabledAction = (value: string) => {
    dispatch(toggleEnabledAction(value as ExportAction));
  };
  return (
    <Category>
      <CategoryHeader>
        <CategoryTitle>Export format</CategoryTitle>
      </CategoryHeader>
      <CategoryContent>
        <Column>
          <FieldTitle>Table Export</FieldTitle>
          <FieldDescription>
            Select your default export action and format, and chose which other
            options will be available in the export menu.
          </FieldDescription>

          <Row className="gap-8">
            <FormItem>
              <Label>Default export action</Label>
              <Column>
                <RadioGroup
                  className="gap-1"
                  onValueChange={handleChangeExportAction}
                >
                  {toPairs(actionTypes).map(([id, { label }]) => (
                    <Row
                      className="flex items-center gap-2"
                      key={id}
                    >
                      <RadioGroupItem
                        value={id}
                        id={id}
                        checked={id === exportAction}
                      />
                      <Label
                        htmlFor={id}
                        className="text-sm font-normal"
                      >
                        {label}
                      </Label>
                    </Row>
                  ))}
                </RadioGroup>
              </Column>
            </FormItem>
            <FormItem>
              <Label>Default export format</Label>
              <Column>
                <RadioGroup
                  className="gap-1"
                  onValueChange={handleChangeExportFormat}
                >
                  {copyActionsItems
                    .concat(downloadActionsItems)
                    .filter((item) => item.id.startsWith(exportAction))
                    .map((item) => (
                      <Row
                        className="flex items-center gap-2"
                        key={item.id}
                      >
                        <RadioGroupItem
                          value={item.format}
                          id={item.format}
                          checked={item.format === exportFormat}
                        />
                        <Label
                          htmlFor={item.format}
                          className="text-sm font-normal"
                        >
                          {item.formatLabel}
                        </Label>
                      </Row>
                    ))}
                </RadioGroup>
              </Column>
            </FormItem>
            <FormItem>
              <Label>Enabled actions</Label>
              <Column className="gap-1">
                {downloadActionsItems.map((action) => (
                  <Row
                    className="flex items-center gap-2"
                    key={action.id}
                  >
                    <Checkbox
                      value={action.id}
                      id={action.id}
                      checked={enabledActions.includes(
                        action.id as ExportAction,
                      )}
                      onCheckedChange={() =>
                        handleToggleEnabledAction(action.id)
                      }
                    />
                    <Label htmlFor={action.id}>{action.label}</Label>
                  </Row>
                ))}
                <Separator className="my-1" />
                {copyActionsItems.map((action) => (
                  <Row
                    className="flex items-center gap-2"
                    key={action.id}
                  >
                    <Checkbox
                      value={action.id}
                      id={action.id}
                      checked={enabledActions.includes(
                        action.id as ExportAction,
                      )}
                      onCheckedChange={() =>
                        handleToggleEnabledAction(action.id)
                      }
                    />
                    <Label htmlFor={action.id}>{action.label}</Label>
                  </Row>
                ))}
              </Column>
            </FormItem>
          </Row>
        </Column>
        <ExportButton
          data={[]}
          headers={[]}
          className="h-8"
          demo
        />
      </CategoryContent>
    </Category>
  );
};
