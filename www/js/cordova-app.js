// const apiEntryPoint = 'https://api.erp-levtech.ro/v2/';
// const apiEntryPoint = 'http://erp-api/v2/';
// const splashScreenTimeout = 3000;
let updateUrl = "https://api.erp-levtech.ro/apps/version-io.framework7.myapp.xml";
let updatePluginInitRetries = 5;

var cordovaApp = {
    f7: null,
    /*
    This method hides splashscreen after 2 seconds
    */
    handleSplashscreen: function () {
        var f7 = cordovaApp.f7;
        if (!window.navigator.splashscreen || f7.device.electron) return;
        setTimeout(() => {
            window.navigator.splashscreen.hide();
        }, 2000);
    },
    /*
    This method prevents back button tap to exit from app on android.
    In case there is an opened modal it will close that modal instead.
    In case there is a current view with navigation history, it will go back instead.
    */
    handleAndroidBackButton: function () {
        var f7 = cordovaApp.f7;
        const $ = f7.$;
        if (f7.device.electron) return;

        var countPress = 0;

        document.addEventListener(
            'backbutton',
            function (e) {
                if ($('.actions-modal.modal-in').length) {
                    f7.actions.close('.actions-modal.modal-in');
                    e.preventDefault();
                    return false;
                }
                if ($('.dialog.modal-in').length) {
                    f7.dialog.close('.dialog.modal-in');
                    e.preventDefault();
                    return false;
                }
                if ($('.sheet-modal.modal-in').length) {
                    f7.sheet.close('.sheet-modal.modal-in');
                    e.preventDefault();
                    return false;
                }
                if ($('.popover.modal-in').length) {
                    f7.popover.close('.popover.modal-in');
                    e.preventDefault();
                    return false;
                }
                if ($('.popup.modal-in').length) {
                    if ($('.popup.modal-in>.view').length) {
                        const currentView = f7.views.get('.popup.modal-in>.view');
                        if (currentView && currentView.router && currentView.router.history.length > 1) {
                            currentView.router.back();
                            e.preventDefault();
                            return false;
                        }
                    }
                    f7.popup.close('.popup.modal-in');
                    e.preventDefault();
                    return false;
                }
                if ($('.login-screen.modal-in').length) {
                    f7.loginScreen.close('.login-screen.modal-in');
                    e.preventDefault();
                    return false;
                }

                if ($('.page-current .searchbar-enabled').length) {
                    f7.searchbar.disable('.page-current .searchbar-enabled');
                    e.preventDefault();
                    return false;
                }

                if ($('.page-current .card-expandable.card-opened').length) {
                    f7.card.close('.page-current .card-expandable.card-opened');
                    e.preventDefault();
                    return false;
                }

                const currentView = f7.views.current;
                if (currentView && currentView.router && currentView.router.history.length > 1) {
                    currentView.router.back();
                    e.preventDefault();
                    return false;
                }

                if ($('.panel.panel-in').length) {
                    f7.panel.close('.panel.panel-in');
                    e.preventDefault();
                    return false;
                }
                if (currentView && currentView.router && currentView.name === 'home') {
                    e.preventDefault();
                    if (countPress >= 1) {
                        navigator.app.exitApp();
                    }
                    countPress += 1;
                    setTimeout(function () {
                        countPress = 0;
                    }, 1000);
                    showToastBottom(f7);
                }
            },
            false,
        );
    },
    /*
    This method does the following:
      - provides cross-platform view "shrinking" on keyboard open/close
      - hides keyboard accessory bar for all inputs except where it required
    */
    handleKeyboard: function () {
        var f7 = cordovaApp.f7;
        if (!window.Keyboard || !window.Keyboard.shrinkView || f7.device.electron) return;
        var $ = f7.$;
        window.Keyboard.shrinkView(false);
        window.Keyboard.disableScrollingInShrinkView(true);
        window.Keyboard.hideFormAccessoryBar(true);
        window.addEventListener('keyboardWillShow', () => {
            f7.input.scrollIntoView(document.activeElement, 0, true, true);
        });
        window.addEventListener('keyboardDidShow', () => {
            f7.input.scrollIntoView(document.activeElement, 0, true, true);
        });
        window.addEventListener('keyboardDidHide', () => {
            if (document.activeElement && $(document.activeElement).parents('.messagebar').length) {
                return;
            }
            window.Keyboard.hideFormAccessoryBar(false);
        });
        window.addEventListener('keyboardHeightWillChange', (event) => {
            var keyboardHeight = event.keyboardHeight;
            if (keyboardHeight > 0) {
                // Keyboard is going to be opened
                document.body.style.height = `calc(100% - ${keyboardHeight}px)`;
                $('html').addClass('device-with-keyboard');
            } else {
                // Keyboard is going to be closed
                document.body.style.height = '';
                $('html').removeClass('device-with-keyboard');
            }
        });
        $(document).on(
            'touchstart',
            'input, textarea, select',
            function (e) {
                var nodeName = e.target.nodeName.toLowerCase();
                var type = e.target.type;
                var showForTypes = ['datetime-local', 'time', 'date', 'datetime'];
                if (nodeName === 'select' || showForTypes.indexOf(type) >= 0) {
                    window.Keyboard.hideFormAccessoryBar(false);
                } else {
                    window.Keyboard.hideFormAccessoryBar(true);
                }
            },
            true,
        );
    },
    /**
     *
     * @return {boolean}
     */
    checkForApplicationUpdate: function () {
        if (!window.AppUpdate) {
            console.log('The auto update plugin is not available on your platform');
            return false;
        }
        console.log('Trying to update the application... Retries left: ' + updatePluginInitRetries);
        if (window.AppUpdate && updatePluginInitRetries > 0) {
            console.log('Auto update plugin is available, checking for updates...');
            window.AppUpdate.checkAppUpdate(cordovaApp.onAutoUpdateSuccess, cordovaApp.onAutoUpdateFail, updateUrl);
            return true;
        }
        if (updatePluginInitRetries <= 0) {
            console.log('Could not check for updates.');
            return false;
        }
        updatePluginInitRetries--;
        setTimeout(cordovaApp.checkForApplicationUpdate, 1000);
    },
    /**
     *
     */
    onAutoUpdateFail: function () {
        console.log('Failed to check for new version. Err details', JSON.stringify(arguments), arguments);
    },
    /**
     *
     */
    onAutoUpdateSuccess: function () {
        console.log('Successfully verified for a newer version.', JSON.stringify(arguments), arguments);
    },

    init: function (f7) {
        // Save f7 instance
        cordovaApp.f7 = f7;
        // document.addEventListener('readystatechange', (event) => {//just for browser testing
        document.addEventListener('deviceready', () => {
            // if (event.target.readyState === 'complete') {//just for browser testing
            console.log('Device is ready');
            // check if we have a newer version first thing on device ready
            // will also check on every page init
            cordovaApp.checkForApplicationUpdate();
            console.log('After check for updates');
            // Handle Keyboard
            cordovaApp.handleKeyboard();
            // Handle Android back button
            cordovaApp.handleAndroidBackButton();
            cordovaApp.handleSplashscreen();

            app.views.create('.view-main', {url: '/'});
            // }//just for browser testing
        });
    },

};
const showToastBottom = (f7) => {
    f7.toast.create({
        text: 'Press back again to exit',
        closeTimeout: 2000,
    }).open();
}
