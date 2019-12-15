## Zazu Shortcuts

Launch programs and URLs using aliases.

> NOTE: Only tested on Windows 10

Example config:

`.zazurc.json / plugins`
```json
{
  "name": "vivekhnz/zazu-shortcuts",
  "variables": {
    "types": {
      "path": {
        "separator": "\\",
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
          "p": {
            "label": "Projects",
            "value": "C:\\Projects"
          }
        }
      },
      "googlePage": {
        "separator": "/",
        "aliases": {
          "i": {
            "label": "Google Images",
            "value": "images"
          },
          "m": {
            "label": "Google Maps",
            "value": "maps"
          }
        }
      }
    },
    "shortcuts": {
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
            "name": "path",
            "type": "path"
          }
        ]
      },
      "cmd": {
        "icon": "fa-terminal",
        "overloads": {
          "0": {
            "name": "Open Command Prompt",
            "cmd": "powershell \"start-process cmd -argumentlist '/K','cd %USERPROFILE%'\""
          },
          "1": {
            "name": "Open Command Prompt at...",
            "cmd": "powershell \"start-process cmd -argumentlist '/K','cd {{cwd}}'\""
          }
        },
        "args": [
          {
            "name": "cwd",
            "type": "path"
          }
        ]
      },
      "cmda": {
        "icon": "fa-terminal",
        "overloads": {
          "0": {
            "name": "Open Command Prompt (Admin)",
            "cmd": "powershell \"start-process cmd -verb runas -argumentlist '/K','cd %USERPROFILE%'\""
          },
          "1": {
            "name": "Open Command Prompt (Admin) at...",
            "cmd": "powershell \"start-process cmd -verb runas -argumentlist '/K','cd {{cwd}}'\""
          }
        },
        "args": [
          {
            "name": "cwd",
            "type": "path"
          }
        ]
      },
      "ps": {
        "icon": "fa-terminal",
        "overloads": {
          "0": {
            "name": "Open PowerShell",
            "cmd": "powershell \"start-process powershell -argumentlist '-noexit','-command cd $env:USERPROFILE'\""
          },
          "1": {
            "name": "Open PowerShell at...",
            "cmd": "powershell \"start-process powershell -argumentlist '-noexit','-command cd {{cwd}}'\""
          }
        },
        "args": [
          {
            "name": "cwd",
            "type": "path"
          }
        ]
      },
      "psa": {
        "icon": "fa-terminal",
        "overloads": {
          "0": {
            "name": "Open PowerShell (Admin)",
            "cmd": "powershell \"start-process powershell -verb runas -argumentlist '-noexit','-command cd $env:USERPROFILE'\""
          },
          "1": {
            "name": "Open PowerShell (Admin) at...",
            "cmd": "powershell \"start-process powershell -verb runas -argumentlist '-noexit','-command cd {{cwd}}'\""
          }
        },
        "args": [
          {
            "name": "cwd",
            "type": "path"
          }
        ]
      },
      "code": {
        "icon": "fa-code",
        "overloads": {
          "0": {
            "name": "Open VS Code",
            "cmd": "code"
          },
          "1": {
            "name": "Open VS Code at...",
            "cmd": "code {{cwd}}"
          }
        },
        "args": [
          {
            "name": "cwd",
            "type": "path"
          }
        ]
      },
      "g": {
        "icon": "fa-globe",
        "overloads": {
          "0": {
            "name": "Google",
            "url": "http://google.com"
          },
          "1": {
            "name": "Google",
            "url": "http://google.com/{{page}}"
          }
        },
        "args": [
          {
            "name": "page",
            "type": "googlePage"
          }
        ]
      }
    }
  }
}
```