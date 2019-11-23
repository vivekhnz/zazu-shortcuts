export interface Variables {
    types?: VariableTypes;
    shortcuts?: Shortcuts;
}

type VariableTypes = { [name: string]: VariableType };
type Shortcuts = { [prefix: string]: Shortcut };

interface VariableType {
    separator: string;
    aliases: { [alias: string]: string };
    enableBatching?: boolean;
}

interface Shortcut {
    icon: string;
    overloads: { [argumentCount: string]: Overload };
    args: Argument[];
    requireSpaceAfterPrefix?: boolean;
}

interface Overload {
    name: string;
    cmd?: string;
    url?: string;
}

interface Argument {
    name: string;
    type?: string;
}

interface CmdCommand {
    kind: 'cmd';
    cmd: string;
}
interface UrlCommand {
    kind: 'url';
    url: string;
}
type Command = CmdCommand | UrlCommand;