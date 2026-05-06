import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/common/design-system/atoms/ui/command';
import {
  selectIsModalOpen,
  setOpenModal,
} from '../../state/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useGlobalCommands } from './global-command.actions';

export const GlobalCommand = () => {
  const dispatch = useAppDispatch();
  const globalCommandOpen = useAppSelector(selectIsModalOpen('globalCommand'));
  const handleOpenChange = () => dispatch(setOpenModal('globalCommand'));

  const globalCommands = useGlobalCommands();

  return (
    <CommandDialog
      open={globalCommandOpen}
      onOpenChange={handleOpenChange}
      className="**:[[cmdk-item]]:py-2"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>No commands found.</CommandEmpty>
        {globalCommands.map(({ title, items }, index) => (
          <CommandGroup
            key={title || 'group' + index}
            heading={title}
          >
            {items.map(({ title, action, shortcut, Icon, disabled }) => (
              <CommandItem
                key={title}
                onSelect={() => {
                  dispatch(setOpenModal(null));
                  action();
                }}
                disabled={disabled}
              >
                {Icon && <Icon />}
                <span>{title}</span>
                {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
