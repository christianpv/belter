import { ZalgoPromise } from 'zalgo-promise/src';


import { inlineMemoize } from './util';
import { isDevice } from './device';

export function isDocumentReady() {
    return Boolean(document.body) && document.readyState === 'complete';
}

export function waitForWindowReady() {
    return inlineMemoize(waitForWindowReady, function () {
        return new ZalgoPromise(function (resolve) {
            if (isDocumentReady()) {
                resolve();
            }

            window.addEventListener('load', function () {
                return resolve();
            });
        });
    });
}

export function waitForDocumentReady() {
    return inlineMemoize(waitForDocumentReady, function () {
        return new ZalgoPromise(function (resolve) {

            if (isDocumentReady()) {
                return resolve();
            }

            var interval = setInterval(function () {
                if (isDocumentReady()) {
                    clearInterval(interval);
                    return resolve();
                }
            }, 10);
        });
    });
}

export function waitForDocumentBody() {
    return waitForDocumentReady.then(function () {
        if (document.body) {
            return document.body;
        }

        throw new Error('Document ready but document.body not present');
    });
}

export function parseQuery(queryString) {
    return inlineMemoize(parseQuery, function () {
        var params = {};

        if (!queryString) {
            return params;
        }

        if (queryString.indexOf('=') === -1) {
            return params;
        }

        for (var _i2 = 0, _queryString$split2 = queryString.split('&'), _length2 = _queryString$split2 == null ? 0 : _queryString$split2.length; _i2 < _length2; _i2++) {
            var pair = _queryString$split2[_i2];
            pair = pair.split('=');

            if (pair[0] && pair[1]) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
        }

        return params;
    }, [queryString]);
}

export function getQueryParam(name) {
    return parseQuery(window.location.search.slice(1))[name];
}

export function urlWillRedirectPage(url) {

    if (url.indexOf('#') === -1) {
        return true;
    }

    if (url.indexOf('#') === 0) {
        return false;
    }

    if (url.split('#')[0] === window.location.href.split('#')[0]) {
        return false;
    }

    return true;
}

export function extendUrl(url) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    var hasHash = url.indexOf('#') > 0;

    var _url$split = url.split('#'),
        serverUrl = _url$split[0],
        hash = _url$split[1];

    if (hash && !serverUrl) {
        var _ref = ['#' + hash, ''];
        serverUrl = _ref[0];
        hash = _ref[1];
    }

    var _serverUrl$split = serverUrl.split('?'),
        originalUrl = _serverUrl$split[0],
        originalQueryString = _serverUrl$split[1];

    if (originalQueryString) {
        var originalQuery = parseQuery(originalQueryString);

        for (var _key in originalQuery) {
            if (!params.hasOwnProperty(_key)) {
                params[_key] = originalQuery[_key];
            }
        }
    }

    var newQueryString = Object.keys(params).filter(function (key) {
        return key && params[key];
    }).sort().map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');

    var newUrl = originalUrl;

    if (newQueryString) {
        newUrl = newUrl + '?' + newQueryString;
    }

    if (hasHash) {
        newUrl = newUrl + '#' + (hash || '');
    }

    return newUrl;
}

export function redirect(url) {
    var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;

    return new ZalgoPromise(function (resolve) {
        setTimeout(function () {
            win.location = url;
            if (!urlWillRedirectPage(url)) {
                resolve();
            }
        }, 1);
    });
}

export function hasMetaViewPort() {
    var meta = document.querySelector('meta[name=viewport]');

    if (isDevice() && window.screen.width < 660 && !meta) {
        return false;
    }

    return true;
}

export function isElementVisible(el) {
    return Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

export function enablePerformance() {
    return inlineMemoize(enablePerformance, function () {
        /* eslint-disable compat/compat */
        return Boolean(window.performance && performance.now && performance.timing && performance.timing.connectEnd && performance.timing.navigationStart && Math.abs(performance.now() - Date.now()) > 1000 && performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart) > 0);
        /* eslint-enable compat/compat */
    });
}

export function getPageRenderTime() {
    return waitForDocumentReady().then(function () {

        if (!enablePerformance()) {
            return;
        }

        var timing = window.performance.timing;

        if (timing.connectEnd && timing.domInteractive) {
            return timing.domInteractive - timing.connectEnd;
        }
    });
}

export function htmlEncode() {
    var html = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return html.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\//g, '&#x2F;');
}

export function isBrowser() {
    return typeof window !== 'undefined';
}