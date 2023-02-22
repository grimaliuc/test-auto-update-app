var isDeviceAuthenticated = true;
var isUserAuthenticated = true;

async function checkAuth(context) {
    var router = this;
    /* some condition to check user is logged in */
    if (isDeviceAuthenticated && isUserAuthenticated) {
        // if (localStorage.getItem('user_email') === null
        // || localStorage.getItem('user_email').length === 0
        // || Object.keys(store.state.user).length === 0)
        //   await getOrganizerDetails(context)
        context.resolve();
    } else {
        context.reject();
        router.navigate('/login-screen/');
    }
}

var routes = [
    {
        path: '/',
        name: 'home',
        componentUrl: './pages/home.html',
        // url: './pages/home.html',
        beforeEnter: checkAuth,
    },
    {
        path: '/map/',
        url: './pages/map.html',
    },
    {
        path: '/about/',
        url: './pages/about.html',
    },
    {
        path: '/form/',
        url: './pages/form.html',
    },
    {
        path: '/catalog/',
        componentUrl: './pages/catalog.html',
    },
    {
        path: '/login-screen/',
        componentUrl: './pages/login-screen.html',
    },
    {
        path: '/product/:id/',
        componentUrl: './pages/product.html',
    },
    {
        path: '/settings/',
        url: './pages/settings.html',
    },
    {
        path: '/map/',
        url: './pages/map.html',
    },
    {
        path: '/dynamic-route/blog/:blogId/post/:postId/',
        componentUrl: './pages/dynamic-route.html',
    },
    {
        path: '/request-and-load/user/:userId/',
        async: function ({router, to, resolve}) {
            // App instance
            var app = router.app;

            // Show Preloader
            app.preloader.show();

            // User ID from request
            var userId = to.params.userId;

            // Simulate Ajax Request
            setTimeout(function () {
                // We got user data from request
                var user = {
                    firstName: 'Vladimir',
                    lastName: 'Kharlampidi',
                    about: 'Hello, i am creator of Framework7! Hope you like it!',
                    links: [
                        {
                            title: 'Framework7 Website',
                            url: 'http://framework7.io',
                        },
                        {
                            title: 'Framework7 Forum',
                            url: 'http://forum.framework7.io',
                        },
                    ]
                };
                // Hide Preloader
                app.preloader.hide();

                // Resolve route to load page
                resolve(
                    {
                        componentUrl: './pages/request-and-load.html',
                    },
                    {
                        props: {
                            user: user,
                        }
                    }
                );
            }, 1000);
        },
    },
    // Default route (404 page). MUST BE THE LAST
    {
        path: '(.*)',
        url: './pages/404.html',
    },
];
