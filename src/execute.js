const exec = require('child_process').exec
const open = require('open');

module.exports = (ctx) => {
    return (commands) => {
        return new Promise((resolve, reject) => {
            commands.forEach(command => {
                if (command.startsWith('cmd:')) {
                    exec(
                        command.substring(4),
                        (err, stdout, stderr) => resolve(stdout));
                }
                else if (command.startsWith('url:')) {
                    open(command.substring(4))
                        .then(proc => resolve(proc));
                }
            });
        })
    }
}