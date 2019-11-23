// @ts-check
/**
 * @typedef {import('./typings/zazu-shortcuts').Variables} Variables
 * @typedef {import('./typings/zazu-shortcuts').Command} Command
 * @typedef {import('./typings/zazu').ZazuPrefixScript<Variables, Command[]>} Script
**/

const exec = require('child_process').exec
const open = require('open');

/** @type Script */
const script = (ctx) => {
    return (commands) => {
        return new Promise((resolve, reject) => {
            commands.forEach(command => {
                switch (command.kind) {
                    case 'cmd':
                        exec(command.cmd, (err, stdout, stderr) => resolve(stdout));
                        break;
                    case 'url':
                        open(command.url).then(proc => resolve(proc));
                        break;
                }
            });
        })
    }
};

module.exports = script;