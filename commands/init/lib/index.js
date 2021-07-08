'use strict';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const semver = require('semver');
const uesrHome = require('user-home');
const Spinner = require('cli-spinner').Spinner;

const Command = require('@tyo-cli/command');
const log = require('@tyo-cli/log');
const Package = require('@tyo-cli/package');

const template = ['vue2', 'vue-element-admin', 'react', 'umi', 'eggjs'];

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
            const projectInfo = await this.prepare();

            if (projectInfo) {
                // 下载模板
                log.verbose('projectInfo', projectInfo);
                await this.downloadTemplate(projectInfo);
                // 安装模板
                await this.installTemplate(projectInfo);
            }

        } catch (e) {
            log.error(e.message);
        }
    }

    async installTemplate(projectInfo) {

        if (!projectInfo) {
            throw new Error('项目模板不存在');
        }

        var spinner = new Spinner('processing.. %s');
        spinner.setSpinnerString('|/-\\');
        spinner.start('正在安装模板...');

        try {
            const templatePath = this.templateNpm.cacheFilePath;
            const targetPath = process.cwd();
            console.log(this.templateNpm.cacheFilePath);
            console.log(targetPath);
            fse.ensureDirSync(templatePath);
            fse.ensureDirSync(targetPath);
            fse.copySync(templatePath, targetPath);
        } catch (e) {
            throw e
        } finally {
            spinner.stop(true);
            log.success('模板安装成功');
        }

    }

    // 下载项目模板
    async downloadTemplate(projectInfo) {

        const targetPath = path.resolve(uesrHome, '.tyo-cli', 'template');
        const storeDir = path.resolve(uesrHome, '.tyo-cli', 'template', 'node_modules');
        console.log(targetPath, storeDir);

        const { projectTemplate } = projectInfo;

        const templateNpm = new Package({
            targetPath,
            storeDir,
            packageName: `@tyo-cli/tyo-cli-template-${projectTemplate}`,
            packageVersion: 'latest'
        });

        if (!await templateNpm.exists()) {
            await templateNpm.install();
            log.success('模板下载成功');
        } else {
            await templateNpm.update();
            log.success('模板下载成功');
        }
        this.templateNpm = templateNpm;
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
        return await this.getProjectInfo();
    }

    async getProjectInfo() {
        let projectInfo = {};

        let project = await inquirer.prompt([{
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
        }, {
            type: 'list',
            name: 'projectTemplate',
            message: '请选择项目模板',
            choices: template
        }]);

        projectInfo = {
            ...project
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