const exec = require('child_process').exec

module.exports = (ctx) => {
    return (command) => {
        return new Promise((resolve, reject) => {
            if (command.startsWith('cmd:')) {
                exec(
                    command.substring(4),
                    (err, stdout, stderr) => resolve(stdout));
            }
        })
    }
}