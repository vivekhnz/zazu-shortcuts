const exec = require('child_process').exec

module.exports = (ctx) => {
  return {
    respondsTo: (query, env = {}) => {
      const prefixes = Object.keys(env.shortcuts)
        .map(key => {
          const shortcut = env.shortcuts[key];
          return {
            key,
            requireSpaceAfterPrefix: shortcut.requireSpaceAfterPrefix === undefined
              ? true
              : shortcut.requireSpaceAfterPrefix
          }
        });

      const withSpacePrefixes = prefixes.filter(p => p.requireSpaceAfterPrefix).map(p => p.key).join('|');
      const noSpacePrefixes = prefixes.filter(p => !p.requireSpaceAfterPrefix).map(p => p.key).join('|');
      const regex = `^(((${withSpacePrefixes})($|\\s))|(${noSpacePrefixes}))`;
      return query.match(regex);
    },
    search: (query, env = {}) => {
      return new Promise((resolve, reject) => {
        const queryComponents = query.split(' ').filter(x => x);
        if (!queryComponents || queryComponents.length === 0) {
          resolve([]);
        }

        const { shortcut, components } = parseComponents(queryComponents, env.shortcuts);
        if (!shortcut) {
          resolve([]);
        }

        // identify correct overload for specified number of arguments
        const overload = shortcut.overloads[(components.length - 1).toString()];
        if (!overload) {
          resolve([]);
        }

        // process argument batches (e.g. substitute aliases)
        const argBatches = [];
        for (let i = 1; i < components.length; i++) {
          const component = components[i];
          const argDef = shortcut.args[i - 1];
          argBatches.push({
            arg: argDef.name,
            values: processArgumentBatch(argDef, component, env.types)
          })
        }

        // build argument permutations
        const permutations = buildPermutations(argBatches);
        const argStr = permutations.length === 1 && permutations[0].str;

        // build commands
        const commands = permutations
          .map(p => {
            if (overload.cmd) {
              return `cmd:${substitute(overload.cmd, p.args)}`;
            }
            else if (overload.url) {
              return `url:${encodeURI(substitute(overload.url, p.args))}`;
            }
            return null;
          })
          .filter(c => c);
        if (commands.length === 0) {
          resolve([]);
        }

        resolve([{
          icon: shortcut.icon,
          title: (permutations.length === 1 && permutations[0].str) || overload.name,
          subtitle: permutations.length === 1
            ? overload.name
            : permutations.map(p => p.str).join(', '),
          value: commands
        }])
      })
    },
  }
}

function parseComponents(components, shortcuts) {
  const prefix = components[0];
  let shortcut = shortcuts[prefix];

  if (shortcut) {
    return {
      shortcut,
      components: components
    }
  }

  for (let i = prefix.length - 1; i > 0; i--) {
    const trimmed = prefix.substring(0, i);
    shortcut = shortcuts[trimmed];
    if (shortcut && shortcut.requireSpaceAfterPrefix === false) {
      return {
        shortcut,
        components: [
          trimmed,
          components[0].substring(trimmed.length),
          ...components.slice(1, components.length)
        ]
      }
    }
  }

  return null;
}

function processArgumentBatch(definition, value, typeDefs) {
  const typeDef = typeDefs[definition.type];
  if (!typeDef) return value.split(',').filter(x => x);

  return typeDef.enableBatching === false
    ? [processArgument(value, typeDef)]
    : value.split(',').filter(x => x).map(arg => processArgument(arg, typeDef));
}

function processArgument(value, typeDef) {
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

function buildPermutations(argBatches) {
  // source: https://stackoverflow.com/a/43053803
  const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
  const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

  const mapped = argBatches.map(b => b.values);
  const permutations = cartesian(...mapped);
  return permutations.map(values => {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const args = {};
    for (let i = 0; i < values.length; i++) {
      args[argBatches[i].arg] = values[i];
    }
    return {
      str: values.join(' '),
      args
    }
  });
}

function substitute(value, args) {
  let substituted = value;
  for (const arg in args) {
    substituted = substituted.replace(new RegExp(`{{${arg}}}`, 'g'), args[arg]);
  }
  return substituted;
}