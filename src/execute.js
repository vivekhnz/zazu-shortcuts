const exec = require('child_process').exec
const open = require('open');

module.exports = (ctx) => {
    return (command) => {
        return new Promise((resolve, reject) => {
            if (command.startsWith('cmd:')) {
                exec(
                    command.substring(4),
                    (err, stdout, stderr) => resolve(stdout));
            }
            else if (command.startsWith('url:')) {
                open(command.substring(4))
                    .then(proc => resolve(proc));
            }
        })
    }
}