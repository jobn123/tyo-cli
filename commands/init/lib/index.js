'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const Command = require('@tyo-cli/command');
const log = require('@tyo-cli/log');

class InitCommand extends Command {
    init() {
        console.log('init 业务逻辑');
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }

    async exec() {
        try {
            // 准备阶段
            const ret = await this.prepare();

            if (ret) {
                // 下载模板
                // 安装模板
            }

        } catch (e) {
            log.error(e.message);
        }
    }

    async prepare() {
        const localPath = process.cwd();
        // 判断目录是否为空
        if (!this.isDirEmpty(localPath)) {

            let ifContinue = false;
            // 询问是否创建
            if (!this.force) {
                ifContinue = await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: '当前文件夹不为空，是否继续创建项目?'
                }).ifContinue;

                if (!ifContinue) return
            }

            if (ifContinue || this.force) {
                // 再次确认 是否清空
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '确认是否清空当前目录下的所有文件?'
                });

                if (confirmDelete) {
                    fse.emptyDirSync(localPath);
                }
            }

        }
        // 是否启动强制更新
        // 选择创建项目、组件
        // 获取项目的基本信息
    }

    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        // 过滤文件
        fileList = fileList.filter(file => (
            !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
        ));
        return !fileList || fileList.length <= 0
    }
}

function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;