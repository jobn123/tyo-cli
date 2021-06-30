'use strict';

const path = require('path');
const cp = require('child_process');
const Package = require('@tyo-cli/package');
const log = require('@tyo-cli/log');

const SETTINGS = {
    init: 'tyo-cli'
};

const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = '';
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';
    let pkg;

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR);  // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath);
        log.verbose('storeDir', storeDir);

        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });

        if (await pkg.exists()) {
            // 更新
            await pkg.update();
        } else {
            // 安装
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });

        const rootFile = pkg.getRootFilePath();
        if (rootFile) {
            try {
                const args = Array.from(arguments);
                const cmd = args[args.length - 1];
                const o = Object.create(null);
                Object.keys(cmd).forEach(key => {
                    if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                        o[key] = cmd[key];
                    }
                });
                args[args.length - 1] = o;
                // console.log(args);
                const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
                const child = spawn('node', ['-e', code], {
                    cwd: process.cwd(),
                    stdio: 'inherit'
                });
                child.on('error', function (e) {
                    log.error(e.message);
                    process.exit(1);
                });
                child.on('exit', function (e) {
                    log.verbose('命令执行成功:', e);
                    process.exit(e);
                })
            } catch (e) {
                log.error(e.message)
            }
        }
    }

    function spawn(command, args, options) {
        const win32 = process.platform === 'win32';

        const cmd = win32 ? 'cmd' : command;
        const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

        return cp.spawn(cmd, cmdArgs, options || {});
    }
}

module.exports = exec;