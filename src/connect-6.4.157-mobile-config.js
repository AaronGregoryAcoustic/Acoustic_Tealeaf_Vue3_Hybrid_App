// --------------------------------------------------------------------------------------
// ---------------------------------------------------------- Tealeaf configuration -----
// --------------------------------------------------------------------------------------
(function () {
    "use strict";

    var config,
        TLT = window.TLT,
        currentURL = window.location.hostname + window.location.pathname;

    // ----------------------------------------------------------------------------------
    // --------------------------------------- Prevent UIC loading on specific URLs -----
    // ----------------------------------------------------------------------------------
    // :: OPTIONAL ::
    if (currentURL === "www.sample.com/forms/complex-form"
        || currentURL === "some.other.url") {
        if (console) {
            console.info("This page is not meant to be captured. Exiting.");
        }
        TLT.terminationReason = "Unwanted page";
        return;
    }
    // ----------------------------------------------------------------------------------

    if (TLT.utils.isLegacyIE || window.document.documentMode) {
        if (console) {
            console.warn("This version of the UIC does not support Internet Explorer.");
            console.info("Applications requiring Internet Explorer 9, 10 or 11 support should use UIC 6.4.20");
            console.info("Applications requiring Internet Explorer 8 (or below) support should use UIC 5.2.0");
        }
        TLT.terminationReason = "Unsupported browser";
        return;
    }

    // ----------------------------------------------------------------------------------
    // ---------------- Delete existing TLTSID session cookie if its value is "DND" -----
    // ----------------------------------------------------------------------------------
    if (TLT.utils.getCookieValue("TLTSID") === "DND") {
        // Delete the cookie by setting it with the same name and path but with an expiration date in the past
        document.cookie = "TLTSID=;Expires=Thu, 01 Jan 1970 00:00:00 GMT;Domain=travelers.com;Path=/";
    }

    config = {
        core: {
            buildNote: "Reference 2025-05-01 - 6.4.157 - Mobile",
            blockedElements: [], // default []
            ieExcludedLinks: ["a[href*=\"javascript:void\"]", "input[onclick*='javascript:']"],
            blockedUserAgents: [
                { regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot|spider|archiver", flags: "i" },
                "PhantomJS"
            ],
            inactivityTimeout: 1000 * 60 * 29, // 29 minutes, just under 30 min Tealeaf app timeout
            // :: OPTIONAL ::
            // This could be any custom event, or DOM event.
            // screenviewLoadEvent: {
            //     name: "click",
            //     target: "[[\"maybe-hidden-content\"],[\"header\",0],[\"div\",1],[\"nav\",0]]"
            // },

            // Capture cross domain frames. The UIC needs to be injected in both parent and iframe(s).
            frames: {
                enableCrossDomainCommunication: false,
                // Set in the UIC running in the iframe, iframe ID should be unique
                eventProducer: { producerId: "my-frame" },
                // Set in UIC running in the parent, receive data only from these iframes. If the array is empty traffic from all hosts is accepted.
                eventConsumer: { childFrameHostnameWhitelist: ["test.sample.com", "stats.other.com"] },
            },

            modules: {
                replay: {
                    events: [
                        { name: "change", attachToShadows: true, recurseFrames: true },
                        { name: "click", recurseFrames: true },
                        { name: "dblclick", recurseFrames: true },
                        { name: "contextmenu", recurseFrames: true },
                        { name: "pointerdown", recurseFrames: true },
                        { name: "pointerup", recurseFrames: true },
                        { name: "hashchange", target: window },
                        { name: "focus", recurseFrames: true },
                        { name: "blur", recurseFrames: true },
                        { name: "load", target: window },
                        { name: "pagehide", target: window },
                        { name: "resize", target: window },
                        { name: "scroll", target: window },
                        { name: "mousemove", recurseFrames: true },
                        { name: "orientationchange", target: window },
                        { name: "touchend" },
                        { name: "touchstart" },
                        { name: "error", target: window },
                        { name: "visibilitychange" }
                    ]
                },
                // :: OPTIONAL ::
                gestures: {
                    /* This replay rule must also be added to replay gestures events in Tealeaf SaaS
                        <HostProfile name="www.sample.com">
                            <SimulateUIEvents value=".*" uiEvents="gestures,resize,valuechange,click,mouseup,scroll"/>
                        </HostProfile>
                    */
                    enabled: true,
                    events: [
                        { name: "tap", target: window },
                        { name: "hold", target: window },
                        { name: "drag", target: window },
                        { name: "release", target: window },
                        { name: "pinch", target: window }
                    ]
                },
                // :: OPTIONAL ::
                digitalData: {
                    enabled: false, // enabled boolean is only needed to set "false", but included for convenience
                    events: [{ name: "load", target: window }]
                },
                // :: OPTIONAL ::
                flushQueue: {
                    events: [] // Empty array is populated by custom logic below (e.g for iOS sessions)
                },
                overstat: {
                    enabled: true,
                    events: [
                        { name: "click", recurseFrames: true },
                        { name: "mousemove", recurseFrames: true },
                        { name: "mouseout", recurseFrames: true },
                        { name: "submit", recurseFrames: true }
                    ]
                },
                performance: {
                    enabled: true,
                    events: [
                        { name: "load", target: window },
                        { name: "pagehide", target: window }
                    ]
                },
                ajaxListener: {
                    enabled: false,
                    events: [
                        { name: "load", target: window },
                        { name: "pagehide", target: window }
                    ]
                },
                dataLayer: {
                    enabled: true,
                    events: [
                        { name: "load", target: window },
                        { name: "pagehide", target: window }
                    ]
                },
                TLCookie: {
                    enabled: true
                }
            },

            // Normalize URL, path, or fragment (can be commented out if not needed)
            normalization: { // default empty
            /**
              * User defined URL normalization function which accepts an URL, path or fragment and returns
              * the normalized value.
              * @param urlOrPath {String} URL, path or fragment which needs to be normalized
              * @param [messageType] {Integer} The message type to normalize, undefined otherwise
              * @returns {String} The normalized URL/path/fragment value
              */
                urlFunction: function (url, messageType) {
                    var normUrl = url;
                    if (messageType === 2) {
                        normUrl = url.replace(/param\d\d\d/, "paramXXX");
                    }
                    return normUrl;
                }
            },

            // Share session identifier with eluminate.js or other libraries (can be commented out if not needed)
            sessionDataEnabled: false, // default false
            sessionData: { // default empty
                sessionValueNeedsHashing: true,
                sessionQueryName: "sessionID",
                sessionQueryDelim: ";",
                sessionCookieName: "jsessionid"
            },

            screenviewAutoDetect: true, // default true
            framesBlacklist: [] // default []
        },
        services: {
            queue: {
                asyncReqOnUnload: true,
                // asyncReqOnUnload: /WebKit/i.test(navigator.userAgent), // No longer recommended as of May 2022
                useBeacon: true, // default true
                useFetch: true, // default true
                xhrLogging: true, // default true, option to set it false re-introduced in 6.3
                // :: OPTIONAL ::
                // If Fetch polyfill on the site is a concern:
                // useFetch: !!(window.fetch && !window.fetch.polyfill),
                // :: WORKER OPTION 1: use a web worker with external file. Requires tltWorker.js. Default is to not use (null).
                // tltWorker: window.fetch && window.Worker ? new Worker("/libraries/tealeaf/tltWorker.js") : null,
                // or, if there is reason to be concerned Fetch polyfill is in use on the site
                // tltWorker: (window.fetch && !window.fetch.polyfill && window.Worker) ? new Worker("/libraries/tealeaf/tltWorker.js") : null,
                // :: WORKER OPTION 2: spawn a web worker using optional createWorker() function above
                tltWorker: window.fetch && window.Worker && createWorker(),
                queues: [{
                    qid: "DEFAULT",
					endpoint:"/",
                    // endpoint: "https://teabooster-eu.acoustic-demo.com/collector/<yourIdHere>/collectorPost",
                    //endpoint: "https://lib-eu-1.brilliantcollector.com/collector/collectorPost",
                    // endpoint: "https://lib-us-1.brilliantcollector.com/collector/collectorPost",
                    //endpoint: "https://lib-us-2.brilliantcollector.com/collector/collectorPost",
                    // endpoint: "https://lib-ap-1.brilliantcollector.com/collector/collectorPost",
                    maxEvents: 30,
                    timerInterval: 30000, // default 0
                    maxSize: 300000, // default 0
                    checkEndpoint: true,
                    endpointCheckTimeout: 3000, // default 3000
                    encoder: "gzip"
                }]
            },
            message: {
                privacy: [{
                    // exclude: true, // Defaults to false. If true, flips targets to whitelist.
                    targets: [
                        "input[type=password]" // ------------------ Mask all password fields
                        // ":not(.piiSafe)", // -------------------- Mask form fields without piiSafe
                        // ".piiMask" // --------------------------- Mask form fields with piiMask
                    ],
                    maskType: 2  // Mask with XXXXX
                },
                {
                    // exclude: false, // Each set of targets can have its own "exclude" setting
                    targets: [
                        "#something-here"
                    ],
                    maskType: 4,
                    maskFunction: function (val, element) {
                        if (element && element.innerText) {
                            element.innerText = "Masked by Tealeaf UIC";
                        }
                        return val;
                    }
                },
                {
                    // Block all response content with "tlPrivate" class
                    targets: [".tlPrivate"],
                    maskType: 4,
                    maskFunction: function (value, element) {
                        if (element && element.innerText) {
                            element.innerText = element.innerText.replace(/[A-Z]/g, "X").replace(/[a-z]/g, "x").replace(/[0-9]/g, "9");
                        }
                        return value;
                    }
                },
                {
                    targets: ["input[id*=phone]", "input[name*=phone]"],
                    maskType: 4, // Replace all digits with X except last 3
                    maskFunction: function (value) {
                        return value.slice(0, -3).replace(/[0-9]/g, "X") + value.slice(-3);
                    }
                },
                // {
                //     // Whitelist privacy, un-masking only elements very unlikely to contain PII
                //     exclude: true,
                //     targets: [
                //         "input[type=hidden]",
                //         "input[type=radio]",
                //         "input[type=checkbox]",
                //         "input[type=submit]",
                //         "input[type=button]",
                //         "input[type=search]"
                //     ],
                //     maskType: 2
                // },
                {
                    // Block all numbers in the response text (not inside HTML tags)
                    // Warning: may not work reliably with DOM Diff enabled unless a callback is also used.
                    targets: [
                        "body" // Top level DOM element. Warning: the wrong choice can break replay!
                    ],
                    maskType: 4,
                    maskFunction: function (value, element) {
                        // Use createTreeWalker() to traverse the DOM iterating through text nodes
                        var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT),
                            node;
                        while ((node = walker.nextNode())) {
                            // Replace any digits in the text
                            node.nodeValue = node.nodeValue.replace(/\d/g, "X");
                        }
                        return value;
                    }
                }
                ],
                privacyPatterns: [
                    {
                        pattern: {
                            regex: '<a id=".*?-some-customer-full-name.*?">.*?</a>',
                            flags: "g"
                        },
                        replacement: "<a>XXXXXXX</a>"
                    },
                    {
                        pattern: {
                            regex: "<div[^<]*tlPrivate[^<]*>(.+?)</div>",
                            flags: "g"
                        },
                        // The replacement function used to replace a capture group can be
                        // simplified from the examples in the docs because "p1" will return
                        // falsy reliably when nothing is matched.
                        //
                        // If the regex has no matches the replacement function is never invoked
                        // If there is a match but p1 empty, e.g. matched by (.*?), p1 is ""
                        // If there is no capture group in the regex, p1 is 0
                        // If there is a disjunction p1 will be undefined
                        //
                        // Since we're not explicitly returning undefined if !p1, which is safe
                        // to do here, disablin ESLint's check for a consistent return value.
                        // eslint-disable-next-line consistent-return
                        replacement: function (match, p1) {
                            if (p1) return match.replace(p1, "XXXXX");
                        }
                    },
                ]
            },
            encoder: {
                gzip: {
                    encode: "window.pako.gzip",
                    defaultEncoding: "gzip"
                }
            },
            domCapture: {
                diffEnabled: true, // default true
                // Options are set to these defaults:
                //
                // maxMutations: 100           // If this threshold is reached, the full DOM is captured instead of a diff
                // maxLength: 1000000          // If this threshold is reached, the DOM snapshot will not be sent
                // captureShadowDOM: false     // Enable ONLY if app is using shadown DOM. Also set allowHitSplit to false in org properties.
                // captureFrames: false        // Enable ONLY if child frames/iframes need to be captured for replay
                // captureDynamicStyles: false // Enable ONLY if dynamic/constructable/CSSOM styles are present
                // captureHREFStyles: false    // Enable ONLY if all styles need to be inserted inline (e.g if CSS files unreachable)
                // removeScripts: true         // Disable ONLY if script tags need to be preserved
                // removeComments: true        // Disable ONLY if comments need to be preserved
                // discardBase64: 0            // Not present by default! Discard all base64 encoded inline image data that exceeds N characters.
                // captureStyle: true          // Disable to remove inline CSS. Reduces the size of the DOM snapshots, but may affect replay.
                // keepImports: false          // Enable to honor the "import" link type, a now deprecated and Chrome specific feature
                // Options below valid with DEBUG CORE ONLY:
                // debugVoidElementsEnabled: false, // Scan DOM for void elements with content. Runs on UIC initialization.
                // debugVoidElementsTimer: 10000    // Delay in ms after initialization before starting the scan.
                //
                // Override as needed below:
                options: {
                    maxLength: 5000000 // recommended minimum: 2000000 (2 MB)
                }
            },
            browser: {
                normalizeTargetToParentLink: true, // default true
                blacklist: ["myMenu"], // Note no leading "#"
                customid: ["name", "aria-id"] // default []
            }
        },
        modules: {
            overstat: {
                hoverThreshold: 3000
            },
            performance: {
                calculateRenderTime: true, // default false
                renderTimeThreshold: 600000,
                performanceAlert: {
                    enabled: true, // Enable logging of slow resources, default false
                    threshold: 3000,
                    maxAlerts: 100,
                    resourceTypes: ["script", "img", "css", "xmlhttprequest", "fetch", "iframe", "beacon"], // default [], meaning "all types"
                    // Blacklist the UIC's own calls so that if all calls are slow we don't capture our own calls about slow capture, then report on those, etc
                    blacklist: [{ regex: "brilliantcollector\\.com" }] // Blacklist based on URL, default []
                },
            },
            replay: {
                // Enable to increase replay fidelity across tabs at cost of extra unload/load on visibilityChange
                tab: false, // default false
                domCapture: {
                    enabled: true,
                    screenviewBlacklist: [],
                    triggers: [
                        // Note: also see "DOM Capture Config by URL" section below.
                        // Force Full DOM Capture on specific clicks
                        {
                            event: "click",
                            targets: [{ id: { regex: ".*ui-datepicker-div.*" }, idType: -2 }], // XPath with regex
                            fullDOMCapture: true,
                        },
                        // Some clicks may require a slight delay
                        {
                            event: "click",
                            targets: ["#register-tab", "#login-tab"],
                            delay: 100
                        },
                        // All other clicks except those on specific label elements. Avoids click+change for every interaction.
                        {
                            event: "click",
                            targets: [":not(.custom-control-label)"]               // CSS with :not pseudo class
                        },
                        // Force Full DOM Capture on specific changes
                        {
                            event: "change",
                            targets: [".form-radio", ".form-select", ".form-checkbox"],
                            fullDOMCapture: true
                        },
                        // Other changes can use DOM Diff
                        { event: "change" },
                        { event: "dblclick" },
                        { event: "contextmenu" },
                        { event: "visibilitychange" },
                        // Wait for spinner/loaders/overlay to be removed to avoid blank screen on load
                        {
                            event: "load",
                            fullDOMCapture: true,
                            delayUntil: { selector: '.async-hide, div.loader[style*="display: block"], div.content--faqs-box[style*="opacity"]', exists: false, timeout: 5000 }
                        }
                    ]
                },
                mousemove: { // default {}
                    enabled: false,
                    sampleRate: 200,
                    ignoreRadius: 3
                }
            },
            ajaxListener: {
                // Initialise Ajax Listener even if another tool is overriding XHR and/or Fetch.
                skipSafetyCheck: false, // only works with Ajax Listener 1.3.0+
                // Block the contents of the response if it is not of content-type "application/json"
                blockNonJSONResponse: false, // only works with Ajax Listener 1.3.1+
                // List of JSON fields for which values will be blocked. These will be blocked in
                // requestHeaders, responseHeaders, requestData, and responseData. All instances of
                // fields with these names will be blocked, anywhere in the payload. Exact match as
                // string, or regex object.
                fieldBlocklist: [ // only works with Ajax Listener 1.3.3+
                    "html",
                    "script",
                    "idKey",
                    "project_id",
                    { regex: "company_|sdk_", flags: "i" },
                    { regex: "banner_" }
                ],
                urlBlocklist: [ // only works with Ajax Listener 1.3.0+
                    { regex: "brilliantcollector\\.com|clarity|collectorPost|crazyegg|doubleclick|google|yimg", flags: "i" }
                ],
                filters: [
                    {
                        url: { regex: "/secureLogin", flags: "i" },
                        status: { regex: "[45]\\d\\d" }, // Log 4xx and 5xx status messages
                        log: {
                            requestHeaders: true,
                            requestData: false,
                            responseHeaders: true,
                            responseData: true
                        }
                    },
                    {
                        status: { regex: "[45]\\d\\d" }, // Log 4xx and 5xx status messages
                        log: {
                            requestHeaders: true,
                            requestData: true,
                            responseHeaders: true,
                            responseData: true
                        }
                    },
                    {
                        // Empty filter block, so ALL other calls will be logged with just basic info
                    }
                ]
            },
            // :: OPTIONAL ::
            gestures: {
                options: {
                    doubleTapInterval: 300
                }
            },
            dataLayer: {
                dataObjects: [
                    {
                        dataObject: "window.dataLayer", // In 6.4+ there is no longer any reason to use a function here
                        rules: {
                            screenviewBlocklist: [],
                            // Recommend HTML elements like "gtm.element" be ignored by default
                            propertyBlocklist: ["gtm.element"],
                            permittedProperties: [],
                            includeEverything: true // default: true
                        }
                    },
                    // Multiple data layers are supported in 6.4+
                    // {
                    //     dataObject: "window.anotherDataLayer",
                    //     rules: {
                    //         screenviewBlocklist: [],
                    //         propertyBlocklist: [],
                    //         permittedProperties: [],
                    //         includeEverything: true
                    //     }
                    // }
                ]
            },
            TLCookie: {
                appCookieWhitelist: [{ regex: ".*" }],
                tlAppKey: "b6c3709b7a4c479bb4b5a9fb8fec324c" // Datacenter/Org/App
                // secureTLTSID: true,                       // Defaults to false. Only set to true if 100% HTTPS.
                // sessionIDUsesStorage: true,               // Defaults to false. Use local storage for TLTSID.
                // sessionIDUsesCookie: false,               // Defaults to true. Set to false to prevent fallback from local storage.
                // sessionizationCookieName: "TLCookie",     // Defaults to TLTSID
                // samesite: "None"                          // Defaults to Strict, can be None|Lax|Strict
                // disableTLTDID: true                       // Defaults to false. Set to true to prevent TLTDID cookie being created.
                // sessionIDUsesFallbackStorage: true        // Defaults to false. Set to true if local storage
            }
        }
    };

    // ----------------------------------------------------------------------------------
    // ---------------------------------------- Prevent UIC loading on specific URL -----
    // ----------------------------------------------------------------------------------
    // :: OPTIONAL ::
    if (window.location.href.indexOf("StorefrontToolkit") > -1) {
        TLT.terminationReason = "Do not capture Developer Toolkit!";
        return;
    }

    // ----------------------------------------------------------------------------------
    // -------------------------------------------------- DOM Capture Config by URL -----
    // ----------------------------------------------------------------------------------
    // :: OPTIONAL ::
    (function () {
        var url = window.location.hostname + window.location.pathname;
        if (url === "www.sample.com/forms/complex-form") {
            config.services.domCapture.diffEnabled = false;
        }
    }());


    // ----------------------------------------------------------------------------------
    // ------------------------------------------------ DOM Capture Triggers by URL -----
    // ----------------------------------------------------------------------------------
    (function () {
        var url = window.location.pathname,
            triggers;
        // On "Cost Changes" page, wait for table to have content
        if (url === "/web/cc") {
            triggers = [
                { event: "click" },
                { event: "change" },
                { event: "visibilitychange" },
                {
                    event: "load",
                    fullDOMCapture: true,
                    delayUntil: { selector: "table.magicgrid tbody:empty", exists: false, timeout: 5000 }
                }
            ];
        }
        // On "Invite Users" page, wait for content in main div and spinner to be hidden
        if (url === "/web/usersignups/index") {
            triggers = [
                { event: "click" },
                { event: "change" },
                { event: "visibilitychange" },
                {
                    event: "load",
                    fullDOMCapture: true,
                    delayUntil: { selector: "div[role=main] div[ng-view] span.ng-hide", exists: true, timeout: 5000 }
                }
            ];
        }
        // On "Manage Distributors" page, wait grid and for spinner to be hidden
        if (url === "/web/DSD/index") {
            triggers = [
                { event: "click" },
                { event: "change" },
                { event: "visibilitychange" },
                {
                    event: "load",
                    fullDOMCapture: true,
                    delayUntil: { selector: "div[ng-show=showWaitIcon].ng-hide + div.ng-scope #gview_DistributorGrid", exists: true, timeout: 5000 }
                }
            ];
        }
        // On "User and Vendor Counts" page, wait for overlay to be removed
        if (url === "/web/venderUserReports/index") {
            triggers = [
                { event: "click" },
                { event: "change" },
                { event: "visibilitychange" },
                {
                    event: "load",
                    fullDOMCapture: true,
                    delayUntil: { selector: 'app-loading-spinner div[style="display: block;"]', exists: false, timeout: 5000 }
                }
            ];
        }

        if (triggers) config.modules.replay.domCapture.triggers = triggers;
    }());

    // ----------------------------------------------------------------------------------
    // ------------------------------------------ Automatic tlAppKey using location -----
    // ----------------------------------------------------------------------------------
    // :: OPTIONAL ::
    (function () {
        var host = window.location.hostname,
            url = host + window.location.pathname,
            appKey;
        if (host === "www.sample.com"
         || host === "accounts.sample.com") {
            appKey = "b2b4a1d10a40485e9511d27ad7d60c5e";
        } else if (host === "test.sample.com") {
            appKey = "0917aa9be9524b6cbb45c35c2079569c";
        } else if (url === "dev.sample.com/specific-url/") {          // URL exact match
            appKey = "0a262a3f6fd94e31ae0af2a668b48208";
        } else if (url.indexOf("dev.sample.com/this/section/") === 0  // URL starts with
         || url.indexOf("www.sample.com/that/section/") === 0) {
            appKey = "b6c3709b7a4c479bb4b5a9fb8fec324c";
        }

        if (appKey) config.modules.TLCookie.tlAppKey = appKey;
    }());

    // ----------------------------------------------------------------------------------
    // ------------------------------ Automatically add non-unique IDs to blacklist -----
    // ----------------------------------------------------------------------------------
    // :: OPTIONAL ::
    (function () {
        function uniqueIds() {
            var dups = [];
            Array.from(
                document.querySelectorAll("[id]")
            )
                .map(function (node) { return node.id; })
                .forEach(
                    function (elem, i, arr) {
                        if (arr.includes(elem, i + 1) && !dups.includes(elem) && elem !== "") {
                            dups.push(elem);
                        }
                    }
                );
            return dups;
        }
        // Note: ensure this parameter exists under config.services.browser: blacklist: []
        config.services.browser.blacklist = config.services.browser.blacklist.concat(uniqueIds());
    }());

    // ----------------------------------------------------------------------------------
    // ----------------------------------------------------- Android and iOS Tuning -----
    // ----------------------------------------------------------------------------------
    if (TLT.utils.isiOS || TLT.utils.isAndroid) {
        (function () {
            var uaMatch;

            // Reduce batch size, increase frequency, increase endpoint timeout
            config.services.queue.queues[0].maxEvents = 10;
            config.services.queue.queues[0].maxSize = 10000;
            config.services.queue.queues[0].timerInterval = 10000;
            config.services.queue.queues[0].endpointCheckTimeout = 10000;

            if (TLT.utils.isiOS) {
                // Disable Beacon in iOS 12 and earlier due to Safari on iOS bug
                uaMatch = window.navigator.userAgent.match(/OS (\d+)_/);
                if (uaMatch && uaMatch[1] < 13) {
                    config.services.queue.useBeacon = false;
                }
                // :: OPTIONAL ::
                // Flush queue on visibilitychange as unload is not a reliable trigger in iOS.
                // Requires flushQueue (or digitalData) module and entry in core.modules section.
                if (config.core.modules.flushQueue && config.core.modules.flushQueue.events) {
                    config.core.modules.flushQueue.events.push({ name: "visibilitychange" });
                } else {
                    console.log("Tealeaf Error: include the flushQueue module!");
                }
            }
        }());
    }


    // ----------------------------------------------------------------------------------
    // ----------------------------------------------- Run AFTER UIC Initialization -----
    // ----------------------------------------------------------------------------------
    // :: OPTIONAL ::
    // If you don't need to run code after the UIC initialises the afterInit() callback is
    // not required. If not in use, remove from the window.TLT.init call at the end of the UIC.
    function afterInit() {
        // ------------------------------------------------------------------------------
        // ---------------------------------------------------- Restart TLT for SPA -----
        // ------------------------------------------------------------------------------
        (function () {
            var origDestroy = window.TLT.destroy,
                prevConfig;
            // Check if document is active (visible and focused)
            function checkVisibility() {
                if (document.visibilityState === "visible" && document.hasFocus()) {
                    if (prevConfig && window.TLT && !TLT.isInitialized()) {
                        console.log("Restarting TLT");
                        TLT.init(prevConfig);
                        prevConfig = null;
                    }
                    window.removeEventListener("visibilitychange", checkVisibility);
                    window.removeEventListener("focus", checkVisibility);
                }
            }
            // If termination reason was inactivity, set listener for active document
            window.TLT.destroy = function (se, tr) {
                if (tr === "inactivity") {
                    prevConfig = TLT.getConfig();
                    window.addEventListener("visibilitychange", checkVisibility);
                    window.addEventListener("focus", checkVisibility);
                }
                origDestroy.call(window.TLT, se, tr);
            };
        }());

        // If the UIC is destroyed, don't bother proceeding further
        if (TLT.getState() === "destroyed") return;

        // ------------------------------------------------------------------------------
        // --------------------------------------- Rebind when element added to DOM -----
        // ------------------------------------------------------------------------------
        // :: OPTIONAL ::
        // Wait for an element to be added to the DOM, then use a Mutation Observer to
        // trigger a TLT.rebind() when that element mutates.
        // See https://stackoverflow.com/a/38882022 and https://stackoverflow.com/a/39332340
        (function () {
            let widgetExists = false,
                rebindCalls = 0,
                widget;
            new MutationObserver((mutations, obs) => {
                if (!widgetExists) {
                    widget = document.getElementById("spr-live-chat-app");
                    if (widget) {
                        obs.disconnect();
                        obs.observe(widget, { childList: true });
                        widgetExists = true;
                    }
                } else {
                    TLT.rebind(widget);
                    rebindCalls += 1;
                    console.log("---> TLT.rebind() calls: " + rebindCalls);
                }
            }).observe(document.body, { childList: true });
        }());
    }

    window.TLT.init(config, afterInit);
}());
