const exec = require('child_process').exec

module.exports = (ctx) => {
  return {
    respondsTo: (query, env = {}) => {
      const regex = `^(${Object.keys(env.shortcuts).join('|')})($|\\s)`;
      return query.match(regex);
    },
    search: (query, env = {}) => {
      return new Promise((resolve, reject) => {
        const components = query.split(' ').filter(x => x);
        if (!components || components.length === 0) {
          resolve([]);
        }
        const prefix = components[0];
        const shortcut = env.shortcuts[prefix];
        if (!shortcut) {
          resolve([]);
        }

        // identify correct overload for specified number of arguments
        const overload = shortcut.overloads[(components.length - 1).toString()];
        if (!overload) {
          resolve([]);
        }

        // process arguments (e.g. substitute aliases)
        const args = {};
        let argStr = "";
        for (let i = 1; i < components.length; i++) {
          const component = components[i];
          const argDef = shortcut.args[i - 1];
          const processedArg = processArgument(argDef, component, env.types);
          args[argDef.name] = processedArg;
          argStr = `${argStr} ${processedArg}`;
        }
        argStr = argStr.trim();

        // build command
        let value = null;
        if (overload.cmd) {
          value = `cmd:${substitute(overload.cmd, args)}`;
        }
        else if (overload.url) {
          value = `url:${encodeURI(substitute(overload.url, args))}`;
        }
        else {
          resolve([]);
        }
        resolve([{
          icon: shortcut.icon,
          title: argStr || overload.name,
          subtitle: argStr && overload.name,
          value
        }])
      })
    },
  }
}

function processArgument(definition, value, typeDefs) {
  const typeDef = typeDefs[definition.type];
  if (!typeDef) return value;

  // replace aliases
  let replaced = value;
  if (typeDef.aliases) {
    for (const alias in typeDef.aliases) {
      if (value === alias || (value.startsWith(alias)
        && value[alias.length].match(/\/|\\/))) {
        replaced = `${typeDef.aliases[alias]}${value.substring(alias.length)}`
      }
    }
  }

  // normalize separators
  const components = replaced.split(/\/|\\/);
  return components.join(typeDef.separator);
}

function substitute(value, args) {
  let substituted = value;
  for (const arg in args) {
    substituted = substituted.replace(new RegExp(`{{${arg}}}`, 'g'), args[arg]);
  }
  return substituted;
}