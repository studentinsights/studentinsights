/**
 * performance-timing.js: Polyfill for performance.timing object
 * For greatest accuracy, this needs to be run as soon as possible in the page, preferably inline.
 * The values returned are necessarily not absolutely accurate, but are close enough for general purposes.
 * @author ShirtlessKirk. Copyright (c) 2014.
 * @license WTFPL (http://www.wtfpl.net/txt/copying)
 */
(function (window) {
    'use strict';

    var
        document = window.document,
        loadParams,
        setTimeout = window.setTimeout,
        D = Date,
        dateNow = D.now ? function () { return D.now(); } : function () { return (new D()).getTime(); },
        M = Math,
        min = M.min,
        start = dateNow(); // this is the earliest time we can get without built-in timing

    function domLoad() {
        var
            time = dateNow(),
            timing = window.performance.timing;

        /* DOMContentLoadedEventEnd value is set via domReady function.
         * However, this function may run before domReady does (making the value 0), so we check for the falsey value
         */
        timing.domContentLoadedEventEnd = timing.domContentLoadedEventStart = min(timing.domContentLoadedEventEnd, time) || time;
        /* If this function runs before domReady then DOMComplete will equal DOMContentLoadedEventStart
         * Otherwise there will be a few ms difference
         */
        timing.domComplete = timing.loadingEventEnd = timing.loadingEventStart = M.max(timing.domContentLoadedEventEnd, time);
        try {
            window.removeEventListener.apply(window, loadParams);
        } catch (e) {
            try {
                window.detachEvent('onload', domLoad);
            } catch (ignore) {}
        }
    }

    function domReady() {
        var
            readyState = document.readyState,
            time = dateNow(),
            timing = window.performance.timing;

        if (readyState === 'uninitialized' || readyState === 'loading' || readyState === 'interactive') {
            if (readyState === 'loading') {
                timing.domLoading = timing.domLoading || time;
            } else if (readyState === 'interactive') {
                timing.domInteractive = timing.domInteractive || time;
            }

            setTimeout(domReady, 9);

            return;
        }

        timing.domInteractive = timing.domInteractive || timing.domComplete || time;
        timing.domLoading = timing.domLoading || min(timing.navigationStart, time);
        timing.domContentLoadedEventEnd = timing.domContentLoadedEventStart = min(timing.domInteractive, time);
        if (window.history.length) {
            timing.unloadEventEnd = timing.unloadEventStart = timing.navigationStart;
        }
    }

    window.performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
    if (window.performance === undefined) {
        window.performance = {};
        window.performance.timing = {
            domComplete:                0,
            domContentLoadedEventEnd:   0,
            domContentLoadedEventStart: 0,
            domInteractive:             0,
            domLoading:                 0,
            legacyNavigationStart:      start,
            loadEventEnd:               0,
            loadEventStart:             0,
            navigationStart:            start,
            unloadEventEnd:             0,
            unloadEventStart:           0
        };
        loadParams = ['load', domLoad, false];

        if (document.readyState !== 'complete') {
            try {
                window.addEventListener.apply(window, loadParams);
            } catch (e) {
                try {
                    window.attachEvent('onload', domLoad);
                } catch (ignore) {}
            }
        }

        setTimeout(domReady, 0);
    }
}(global));