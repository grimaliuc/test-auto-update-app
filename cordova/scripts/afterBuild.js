const fs = require('fs');
const util = require('util');
const path = require("path");

module.exports = function (ctx) {
    // Make sure android platform is part of build
    if (!ctx.opts.platforms.includes('android')) return;
    if (!fs.existsSync(ctx.opts.options.buildConfig))
        console.error('No build config file found. Please check if `build.json` file exists in cordova directory!');
    const rawConfig = JSON.parse(fs.readFileSync(ctx.opts.options.buildConfig));
    const platformRoot = path.join(ctx.opts.projectRoot, 'platforms/android');
    const apkFileLocation = path.join(platformRoot, 'app/build/outputs/apk/release/app-release.apk');
    if (!fs.existsSync(apkFileLocation))
        console.warn('No APK to move found! You can still continue if build was successful but you have to rename the app manually!');
    if (typeof rawConfig.appBuildDetails !== "undefined" && rawConfig.appBuildDetails.id && rawConfig.appBuildDetails.version) {
        const appName = `${rawConfig.appBuildDetails.id}.${rawConfig.appBuildDetails.version}.apk`
        const newApkFileLocation = path.join(ctx.opts.projectRoot, '../', 'build', 'releases', appName);
        return fs.copyFile(apkFileLocation, newApkFileLocation, (err) => {
            if (err) throw err;
            console.log(`${apkFileLocation} was copied to ${newApkFileLocation}`);
        });
    }
    console.error(`Could not copy ${apkFileLocation} to ${newApkFileLocation} please check previous logs for details!`)
};