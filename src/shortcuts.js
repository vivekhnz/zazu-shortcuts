// @ts-check
/**
 * @typedef {import('./typings/zazu-shortcuts').Variables} Variables
 * @typedef {import('./typings/zazu-shortcuts').VariableTypes} VariableTypes
 * @typedef {import('./typings/zazu-shortcuts').VariableType} VariableType
 * @typedef {import('./typings/zazu-shortcuts').Shortcuts} Shortcuts
 * @typedef {import('./typings/zazu-shortcuts').Shortcut} Shortcut
 * @typedef {import('./typings/zazu-shortcuts').Argument} Argument
 * @typedef {import('./typings/zazu-shortcuts').Command} Command
 * @typedef {import('./typings/zazu').ZazuResult<Command[]>} ZazuResult
 * @typedef {import('./typings/zazu').ZazuRootScript<Variables, Command[]>} Script
 * 
 * @typedef ArgumentBatch
 * @property {string} arg
 * @property {string[]} values
 * 
 * @typedef Permutation
 * @property {string} str
 * @property {{ [key: string]: string }} args
**/

/** @type Script */
const script = (ctx) => {
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
      const matches = query.match(regex);
      return matches && matches.length > 0;
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

        // identify suggestions
        const suggestNextArgument = query.endsWith(' ')
          || (components.length === 1 && shortcut.requireSpaceAfterPrefix === false);
        const index = components.length - (suggestNextArgument ? 0 : 1);
        const suggestions = getSuggestions(
          shortcut, index,
          suggestNextArgument ? '' : components[components.length - 1],
          components, env.types);

        const primaryResult = evaluateComponents(shortcut, components, env.types);
        resolve(primaryResult ? [primaryResult, ...suggestions] : suggestions);
      })
    }
  }
}

/**
 * @param {string[]} components
 * @param {Shortcuts} shortcuts
 */
function parseComponents(components, shortcuts) {
  const prefix = components[0];
  let shortcut = shortcuts[prefix];

  if (shortcut) {
    return {
      shortcut,
      components
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

/**
 * @param {Shortcut} shortcut
 * @param {number} overloadIndex
 * @param {string} prefix
 * @param {VariableTypes} typeDefs
 * @param {string[]} components
 * @returns {ZazuResult[]}
 */
function getSuggestions(shortcut, overloadIndex, prefix, components, typeDefs) {
  if (overloadIndex < 1 || shortcut.args.length < overloadIndex) return [];

  const arg = shortcut.args[overloadIndex - 1];
  if (!arg.type) return [];

  const typeDef = typeDefs[arg.type];
  if (!typeDef) return [];

  return Object.keys(typeDef.aliases)
    .filter(alias => alias !== prefix && alias.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b))
    .map(alias => {
      const lastComponent = components[components.length - 1];
      const autocompletedComponents = prefix && lastComponent.endsWith(prefix)
        ? [...components.slice(0, components.length - 1), alias]
        : [...components, alias];
      const evaluated = evaluateComponents(shortcut, autocompletedComponents, typeDefs);
      if (!evaluated) return null;

      /** @type {ZazuResult} */
      const result = {
        icon: shortcut.icon,
        title: typeDef.aliases[alias],
        subtitle: alias,
        value: evaluated.value
      };
      return result;
    })
    .filter(x => x);
}

/**
 * @param {Shortcut} shortcut
 * @param {string[]} components
 * @param {VariableTypes} typeDefs
 * @returns {ZazuResult | null}
 */
function evaluateComponents(shortcut, components, typeDefs) {
  // identify correct overload for specified number of arguments
  const overload = shortcut.overloads[(components.length - 1).toString()];
  if (!overload) return null;

  // process argument batches (e.g. substitute aliases)
  /** @type {ArgumentBatch[]} */
  const argBatches = [];
  for (let i = 1; i < components.length; i++) {
    const component = components[i];
    const argDef = shortcut.args[i - 1];
    argBatches.push({
      arg: argDef.name,
      values: processArgumentBatch(argDef, component, typeDefs)
    });
  }

  // build argument permutations
  const permutations = buildPermutations(argBatches);

  // build commands
  const commands = permutations
    .map(p => {
      /** @type {Command | null} */
      let command = null;
      if (overload.cmd) {
        command = {
          kind: 'cmd',
          cmd: substitute(overload.cmd, p.args)
        }
      }
      else if (overload.url) {
        command = {
          kind: 'url',
          url: encodeURI(substitute(overload.url, p.args))
        }
      }
      return command;
    })
    .filter(c => c);
  if (commands.length === 0) return null;

  // build result
  const title = (permutations.length === 1 && permutations[0].str) || overload.name;
  const subtitle = permutations.length === 1
    ? overload.name
    : permutations.map(p => p.str).join(', ');
  return {
    icon: shortcut.icon,
    title,
    subtitle: subtitle !== title && subtitle,
    value: commands
  };
}

/**
 * @param {Argument} definition
 * @param {string} value
 * @param {VariableTypes} typeDefs
 */
function processArgumentBatch(definition, value, typeDefs) {
  const typeDef = typeDefs[definition.type];
  if (!typeDef) return value.split(',').filter(x => x);

  return typeDef.enableBatching === false
    ? [processArgument(value, typeDef)]
    : value.split(',').filter(x => x).map(arg => processArgument(arg, typeDef));
}

/**
 * @param {string} value
 * @param {VariableType} typeDef
 */
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

/**
 * @param {ArgumentBatch[]} argBatches
 * @returns {Permutation[]}
 */
function buildPermutations(argBatches) {
  // source: https://stackoverflow.com/a/43053803
  const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
  const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

  const mapped = argBatches.map(b => b.values);
  const permutations = cartesian(...mapped);
  if (!permutations) {
    return [{
      str: '',
      args: {}
    }]
  }

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

/**
 * @param {string} value
 * @param {{ [arg: string]: string; }} args
 */
function substitute(value, args) {
  let substituted = value;
  for (const arg in args) {
    substituted = substituted.replace(new RegExp(`{{${arg}}}`, 'g'), args[arg]);
  }
  return substituted;
}

module.exports = script;