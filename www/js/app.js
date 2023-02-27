var $ = Dom7;
var f7Device = Framework7.getDevice();
var options = {
    clientId: '51c1dcee-9472-45f1-be29-ef05ebf8d11e',
    tenantId: "5669e44c-6a4d-415f-bad4-de9d7605e699",
    authorities: [
        {
            type: 'AAD',
            audience: 'AzureADMyOrg',
            cloudInstance: 'MSALAzurePublicCloudInstance',
            default: true
        }
    ],
    authorizationUserAgent: 'WEBVIEW',
    multipleCloudsSupported: false,
    brokerRedirectUri: false,
    accountMode: 'SINGLE',
    scopes: ['User.Read']
}
var app = new Framework7({
    name: 'Auto Update App', // App name
    theme: 'auto', // Automatic theme detection
    el: '#app', // App root element
    version: '1.0.5',
    id: 'io.framework7.myapp', // App bundle ID
    // App store
    store: store,
    // App routes
    routes: routes,

    // Input settings
    input: {
        scrollIntoViewOnFocus: f7Device.cordova && !f7Device.electron,
        scrollIntoViewCentered: f7Device.cordova && !f7Device.electron,
    },
    // Cordova Statusbar settings
    statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: false,
    },
    on: {
        init: function () {
            var f7 = this;
            // if (f7.device.cordova) {
                if (f7.device.android) {
                // Init cordova APIs (see cordova-app.js)
                cordovaApp.init(f7);
            }
        },
        pageInit: function ($page) {
            if ($page.name === 'map') {
                console.log($page)
                // do something when page initialized
                $('#test').on('click', function () {
                    app.dialog.alert('Failed because');
                });
            }
            if ($page.name === 'login-screen') {
                $('#signInApp').on('click', function () {
                    window.cordova.plugins.msalPlugin.msalInit(function (resp) {
                            console.log('msalInit');
                            console.log(resp);
                            window.cordova.plugins.msalPlugin.signInSilent(
                                function (respAuth) {
                                    console.log(respAuth['account']['username']);
                                    localStorage.setItem('client', respAuth['account']['username']);
                                    console.log('signed in');
                                    location.reload();
                                },
                                function (err) {
                                    window.cordova.plugins.msalPlugin.signInInteractive(
                                        function (resp) {
                                            console.log('signInInteractive');
                                            isDeviceAuthenticated = true;
                                            isUserAuthenticated = true;
                                            console.log(resp);
                                        },
                                        function (err) {
                                            console.log('signInInteractive err')
                                            console.log(err);
                                            window.cordova.plugins.msalPlugin.signOut(
                                                function (msg) {
                                                    localStorage.removeItem('client');
                                                    console.log('out');
                                                    console.log(msg);
                                                },
                                                function (err) {
                                                    console.log('out err');
                                                    console.log(err);
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        },
                        function (err) {
                            console.log(err);
                        }, options);
                });
            }
            if ($page.name === 'home') {
                $('#camera').on('click', function () {
                    navigator.camera.getPicture(onSuccess, onFail, {
                        quality: 50,
                        destinationType: Camera.DestinationType.DATA_URL,
                        correctOrientation: true
                    });
                });
            }
        },
    },
});
// Login Screen Demo
$('#my-login-screen .login-button').on('click', function () {
    var username = $('#my-login-screen [name="username"]').val();
    var password = $('#my-login-screen [name="password"]').val();

    // Close login screen
    app.loginScreen.close('#my-login-screen');

    // Alert username and password
    app.dialog.alert('Username: ' + username + '<br/>Password: ' + password);
});

function onSuccess(imageData) {
    var image = document.getElementById('img');
    image.style.display = 'block';
    image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    alert('Failed because: ' + message);
}