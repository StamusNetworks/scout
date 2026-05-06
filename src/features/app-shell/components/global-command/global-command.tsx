import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/common/design-system/atoms/ui/command';

import { useGlobalCommandModal } from '../../hooks/use-global-command-modal';
import { useGlobalCommands } from './global-command.actions';

export const GlobalCommand = () => {
  const { isOpen, close, setOpen } = useGlobalCommandModal();

  const globalCommands = useGlobalCommands();

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setOpen}
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
                  close();
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
