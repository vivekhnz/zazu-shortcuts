## Zazu Shortcuts

Zazu Shortcuts is a plugin for the [Zazu](https://zazuapp.org/) launcher that allows you to launch programs and URLs using custom aliases.

> NOTE: This plugin and the instructions below are only tested on Windows 10

## Installation

1. Install Zazu from https://zazuapp.org/
2. Open your Zazu config file in a text editor. On Windows, it's located at `%USERPROFILE%\.zazurc.json` e.g. `C:\Users\Vivek\.zazurc.json` and should look something like this:

```json
{
  "hotkey": "alt+space",
  "theme": "tinytacoteam/zazu-dark-theme",
  "displayOn": "detect",
  "plugins": []
}
```

3. Install the plugin by adding an entry to the `plugins` array like below:

```json
{
  "hotkey": "alt+space",
  "theme": "tinytacoteam/zazu-dark-theme",
  "displayOn": "detect",
  "plugins": [
    {
      "name": "vivekhnz/zazu-shortcuts",
      "variables": {
        "types": {},
        "shortcuts": {}
      }
    }
  ]
}
```

4. Launch Zazu. If it's already running, right-click on the tray icon and select **Reload Config**.
5. Activate Zazu using your configured hotkey combination (`Alt + Space` by default)

If you see Zazu's floating textbox, the plugin is installed and you're ready to configure some shortcuts!

## Usage

> NOTE: Any configuration file examples refer to the `variables` entry in the `vivekhnz/zazu-shortcuts` `plugins` array entry.

### 1. Zero argument program shortcut
In this example, we will set up a basic shortcut that launches Notepad.

![Zero argument program shortcut](gifs/zeroArgShortcut.gif)

Add a new entry to the `shortcuts` section like below:

```json
{
  "types": {},
  "shortcuts": {
    "n": {
      "icon": "fa-file-alt",
      "overloads": {
        "0": {
          "name": "Open Notepad",
          "cmd": "notepad"
        }
      }
    }
  }
}
```

- The shortcut's key (`n`) is what you type into Zazu to access the shortcut.
- The `icon` is an identifier for the [Font Awesome](https://fontawesome.com/) icon to display next to the shortcut result.
- The `overloads` section stores the possible command overloads that can be executed by this shortcut.
- We are setting up a zero argument shortcut so our overload's key is `0`.
- The overload's `name` is the text that is displayed within the shortcut result.
- The overload's `cmd` is the shell command to execute when the shortcut result is focused and the user presses the `Enter` key.

### 2. Single argument program shortcut
In this example, we will set up a shortcut that navigates to a specified path in Windows Explorer.

![Single argument program shortcut](gifs/singleArgShortcut.gif)

Add a new entry to the `shortcuts` section with the key `go` like below:

```json
{
  "types": {},
  "shortcuts": {
    "n": {
      "icon": "fa-file-alt",
      "overloads": {
        "0": {
          "name": "Open Notepad",
          "cmd": "notepad"
        }
      }
    },
    "go": {
      "icon": "fa-folder-open",
      "overloads": {
        "1": {
          "name": "Open in Explorer",
          "cmd": "explorer {{path}}"
        }
      },
      "args": [
        {
          "name": "path"
        }
      ]
    }
  }
}
```

- Our command overload takes a single argument so our overload's key is `1`.
- The `args` array stores a definition of each argument. For this shortcut, we only support a single argument so the array contains a single item. We set the `name` of that argument to `path` so that we can refer to the argument's value using `{{path}}` in the overload's `cmd`.
- The overload's `cmd` launches `explorer` with a single argument. The `{{path}}` is substituted with the value of the named argument `path`.

### 3. Shortcut overloads
In this example, we will extend our Notepad shortcut to be able to open a specified file.

![Overloaded program shortcut](gifs/overloadedShortcut.gif)

Modify the Notepad launcher shortcut we created in example 1 to add a second overload:

```json
{
  "types": {},
  "shortcuts": {
    "n": {
      "icon": "fa-file-alt",
      "overloads": {
        "0": {
          "name": "Open Notepad",
          "cmd": "notepad"
        },
        "1": {
          "name": "Open in Notepad",
          "cmd": "notepad {{path}}"
        }
      },
      "args": [
        {
          "name": "path"
        }
      ]
    }
  }
}
```

- Just like the Explorer shortcut we created in example 2, this new shortcut overload takes a single argument - the path to the file to open.
- This new overload doesn't replace the functionality of the previous overload. You can now use both. If you specify no arguments (i.e. `n`), it will execute the zero argument overload and open an empty Notepad window. If you specify a file path (i.e. `n path\to\file.txt`), it will execute the single argument overload and open the specified file in Notepad.

### 4. Auto-suggest
In this example, we will set up auto-suggest options for our shortcuts.

![Auto-suggest](gifs/autoSuggest.gif)

Add a new entry to the `types` section like below:

```json
{
  "types": {
    "filePath": {
      "aliases": {
        "pics": {
          "label": "Pictures",
          "value": "C:\\Users\\%USERNAME%\\Pictures"
        },
        "docs": {
          "label": "Documents",
          "value": "C:\\Users\\%USERNAME%\\Documents"
        },
        "music": {
          "label": "Music",
          "value": "C:\\Users\\%USERNAME%\\Music"
        },
        "vids": {
          "label": "Videos",
          "value": "C:\\Users\\%USERNAME%\\Videos"
        },
        "dl": {
          "label": "Downloads",
          "value": "C:\\Users\\%USERNAME%\\Downloads"
        },
        "proj": {
          "label": "Projects",
          "value": "C:\\Projects"
        },
        "u": {
          "label": "User Profile",
          "value": "%USERPROFILE%"
        }
      }
    }
  },
  ...
}
```

- This defines a custom argument type called `filePath`
- The `filePath` argument type has several `aliases` - these are presented as suggestions when entering a value for an argument of type `filePath`
- The alias key (e.g. `pics`, `docs` etc.) is what you type into Zazu to reference the alias
- The alias's `value` is what is used for the argument's value when the alias key is entered
- The alias's `label` is an optional field that is shown in the auto-suggest result

Next, modify your Notepad and Explorer shortcut arguments to use the `filePath` type:

```json
{
  "types": {...},

  "shortcuts": {
    "n": {
      ...,
      "args": [
        {
          "name": "path",
          "type": "filePath"
        }
      ]
    },
    "go": {
      ...,
      "args": [
        {
          "name": "path",
          "type": "filePath"
        }
      ]
    }
  }
}
```

### 5. Argument type separators
In this example, we will set up a custom separator for our `filePath` argument type to make it easier to compose longer paths.

![Custom argument type separator](gifs/separator.gif)

Add a `separator` value to the `filePath` argument type like below:

```json
{
  "types": {
    "filePath": {
      "separator": "\\",
      "aliases": {
        ...
      }
    }
  },
  ...
}
```

Any slashes in an argument value are automatically substituted with the argument type's `separator` e.g. `u/.zazurc.json` is converted to `%USERPROFILE%\.zazurc.json`.

### 6. URL shortcuts
In this example, we will set up an overloaded URL shortcut to quickly access various pages on GitHub.

![URL shortcut](gifs/urlShortcut.gif)

URL shortcuts launch the specified URL in your default web browser. The only difference in how they are configured is that their shortcut overloads have a `url` argument instead of the `cmd` argument used for program shortcuts.

The following configuration sets up an overloaded URL shortcut that:
- opens the GitHub homepage if no arguments were specified
- opens a specified user's profile page if one argument was specified
- opens a specified repository page if two arguments were specified
- opens a specified repository subpage if three arguments were specified

```json
{
  "types": {
    "githubRepoPage": {
      "separator": "/",
      "aliases": {
        "i": {
          "label": "Issues",
          "value": "issues"
        },
        "p": {
          "label": "Pull Requests",
          "value": "pulls"
        }
      }
    }
  },
  "shortcuts": {
    "gh": {
      "icon": "fa-code-branch",
      "overloads": {
        "0": {
          "name": "GitHub",
          "url": "https://github.com"
        },
        "1": {
          "name": "View GitHub profile",
          "url": "https://github.com/{{username}}"
        },
        "2": {
          "name": "View GitHub repository",
          "url": "https://github.com/{{username}}/{{repo}}"
        },
        "3": {
          "name": "View GitHub repository page",
          "url": "https://github.com/{{username}}/{{repo}}/{{page}}"
        }
      },
      "args": [
        {
          "name": "username"
        },
        {
          "name": "repo"
        },
        {
          "name": "page",
          "type": "githubRepoPage"
        }
      ]
    }
  }
}
```

### 7. Batching
You can execute a shortcut multiple times with different arguments by separating arguments with a comma. Using the GitHub shortcut from example 6, we can open the repository page for **Visual Studio Code** and **Windows Terminal** using a single command:

`gh microsoft vscode,terminal`

This command expands into two command executions which are both executed when you press the Enter key:
1. `gh microsoft vscode`
2. `gh microsoft terminal`

You can even batch over multiple arguments and the command will expand into each of the possible permutations. For example, `gh microsoft vscode,terminal i,p` will open the **Issues** and **Pull Requests** pages for both **Visual Studio Code** and **Windows Terminal**.

![Command batching](gifs/batching.gif)

### 8. Disabling space after command prefix
For short single-argument shortcuts, it is sometimes undesirable to have to enter a space after the command prefix. You can disable this requirement for a specific shortcut by setting the `requireSpaceAfterPrefix` field to `false` e.g.

```json
{
  "shortcuts": {
    "@": {
      "icon": "fa-globe",
      "requireSpaceAfterPrefix": false,
      "overloads": {
        "1": {
          "name": "View Twitter Profile",
          "url": "https://twitter.com/{{username}}"
        }
      },
      "args": [
        {
          "name": "username"
        }
      ]
    }
  }
}
```

![Command with no space after prefix](gifs/noSpaceAfterPrefix.gif)