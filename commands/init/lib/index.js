'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const semver = require('semver');

const Command = require('@tyo-cli/command');
const log = require('@tyo-cli/log');
const { setTimeout } = require('timers');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

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
        this.getProjectInfo();
    }


    async getProjectInfo() {
        const projectInfo = {};
        // 选择创建项目、组件
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [{
                name: '项目',
                value: TYPE_PROJECT
            }, {
                name: '组件',
                value: TYPE_COMPONENT
            }]
        });

        log.verbose('type:', type);

        if (type === TYPE_PROJECT) {
            const o = await inquirer.prompt([{
                type: 'input',
                name: 'projectName',
                message: '请输入项目名称',
                default: '',
                validate: function (v) {
                    const done = this.async();
                    setTimeout(() => {
                        if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                            done("请输入合法的项目名称");
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
                filter: function (v) {
                    return v;
                },
            }, {
                type: 'input',
                name: 'projectVersion',
                message: '请输入项目版本号',
                default: '1.0.0',
                validate: function (v) {
                    const done = this.async();
                    setTimeout(() => {
                        if (!(!!semver.valid(v))) {
                            done("请输入合法的版本号");
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
                filter: function (v) {
                    if (!!semver.valid(v)) {
                        return semver.valid(v)
                    }
                    return v;
                },
            }]);
            console.log(o);
        } else {

        }
        // 获取项目的基本信息
        return projectInfo;
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