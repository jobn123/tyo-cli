'use strict';

module.exports = init;

function init(projectName, cmdObj) {
    console.log(projectName, cmdObj, cmdObj.force, process.env.CLI_TARGET_PATH);
}