/*!
  Copyright (C) Microsoft. All rights reserved.
  This library is supported for use in Windows Store apps only.
*/
(function(WinJS)
{
    "use strict";
    WinJS.Namespace.define("MicrosoftNSJS.Advertising", {
        AdGlobalEventManager: WinJS.Class.define(function()
        {
            if (!this._isNullOrUndefined(window))
            {
                if (this._isNullOrUndefined(window._msAdsGlobalEventManager) || window._msAdsGlobalEventManager.isInitialized !== true)
                {
                    if (!this._isNullOrUndefined(window._msAdsGlobalEventManager) && window._msAdsGlobalEventManager._objectName !== MicrosoftNSJS.Advertising.AdGlobalEventManager.OBJECT_NAME)
                    {
                        this._logError("window._msAdsGlobalEventManager already exists but is not of correct object type [{0}]. Overwriting.", MicrosoftNSJS.Advertising.AdGlobalEventManager.OBJECT_NAME)
                    }
                    this._objectName = MicrosoftNSJS.Advertising.AdGlobalEventManager.OBJECT_NAME;
                    this._isInitialized = true;
                    window._msAdsGlobalEventManager = this
                }
                return window._msAdsGlobalEventManager
            }
        }, {
            isInitialized: {get: function()
                {
                    return this._isInitialized
                }}, _eventListeners: null, _isInitialized: false, addEventListener: function(eventType, listener)
                {
                    if (this._isNullOrUndefined(eventType) || this._isNullOrUndefined(listener))
                    {
                        this._logError("Could not add listener, eventType or listener null or undefined");
                        return
                    }
                    try
                    {
                        this._initializeEventListenersContainer(eventType);
                        this._eventListeners[eventType].push(listener);
                        return listener
                    }
                    catch(err)
                    {
                        this._logError("Could not add listener type '" + eventType + "', exception was thrown [{0}]", err);
                        return null
                    }
                }, removeEventListener: function(eventType, listener)
                {
                    if (this._isNullOrUndefined(eventType) || this._isNullOrUndefined(listener))
                    {
                        this._logError("Could not remove listener, eventType or listener null or undefined.");
                        return
                    }
                    if (!this._eventArrayExists(eventType))
                    {
                        this._logError("Could not remove listener, no listener found for eventType: " + eventType);
                        return null
                    }
                    else
                    {
                        try
                        {
                            var listeners = this._eventListeners[eventType];
                            for (var i = 0; i < listeners.length; i++)
                            {
                                if (listeners[i] === listener)
                                {
                                    var l = listeners.splice(i, 1);
                                    return l[0]
                                }
                            }
                        }
                        catch(err)
                        {
                            this._logError("Could not remove listener, exception was thrown [{0}]", err);
                            return null
                        }
                    }
                }, broadcastEvent: function(eventType, args)
                {
                    if (this._isNullOrUndefined(eventType))
                    {
                        this._logError("Could not broadcast event, eventType null or undefined");
                        return
                    }
                    if (!this._eventArrayExists(eventType))
                    {
                        return
                    }
                    else
                    {
                        var listeners = this._eventListeners[eventType];
                        for (var i = 0; i < listeners.length; i++)
                        {
                            if (!this._isNullOrUndefined(listeners[i]))
                            {
                                listeners[i](args)
                            }
                        }
                    }
                }, dispose: function(force)
                {
                    try
                    {
                        if (force === true)
                        {
                            this._dispose();
                            return
                        }
                        var eventsLeft = false;
                        for (var i in MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE)
                        {
                            if (this._eventArrayExists(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE[i]) && this._eventListeners[MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE[i]].length > 0)
                            {
                                eventsLeft = true;
                                break
                            }
                        }
                        if (eventsLeft === false)
                        {
                            this._dispose()
                        }
                        else
                        {
                            this._logError("Could not dispose, events collection is not empty.")
                        }
                    }
                    catch(err)
                    {
                        try
                        {
                            this._logError("Could not dispose, exception thrown [{0}].", err)
                        }
                        catch(err) {}
                    }
                }, _dispose: function()
                {
                    this._eventListeners = null;
                    this._isInitialized = false;
                    window._msAdsGlobalEventManager = null
                }, _initializeEventListenersContainer: function(eventType)
                {
                    if (this._eventListeners === null)
                    {
                        this._eventListeners = {};
                        this._eventListeners[eventType] = []
                    }
                    else if (this._isNullOrUndefined(this._eventListeners[eventType]))
                    {
                        this._eventListeners[eventType] = []
                    }
                }, _eventArrayExists: function(eventType)
                {
                    if (this._eventListeners === null || this._eventListeners[eventType] === null || typeof(this._eventListeners[eventType]) === "undefined")
                    {
                        return false
                    }
                    return true
                }, _isNullOrUndefined: function(object)
                {
                    if (typeof(object) === "undefined" || object === null)
                    {
                        return true
                    }
                    return false
                }, _logError: function(message, err){}
        }, {
            OBJECT_NAME: "MicrosoftNSJS.Advertising.AdGlobalEventManager", EVENT_TYPE: {
                    AD_ENGAGED: "msAdEngaged", AD_DISENGAGED: "msAdDisengaged"
                }
        }), AdControl: WinJS.Class.define(function(element, options)
            {
                try
                {
                    if (element === null || typeof(element) === "undefined")
                    {
                        element = document.createElement("div")
                    }
                    else if (this._isElementAllowed(element))
                    {
                        element = element
                    }
                    else
                    {
                        return
                    }
                    element.winControl = this;
                    this._adsGlobalEventManager = new MicrosoftNSJS.Advertising.AdGlobalEventManager;
                    this._adSettingsControl = new MicrosoftNSJS.Advertising.AdSettingsControl({
                        flyoutHtmlTemplateURI: "ms-appx:///MSAdvertisingJS/ads/MSASettingsPanel.html", resourceLoaderURI: "MicrosoftAdvertising/UIStrings"
                    });
                    try
                    {
                        this._rendererOptions = new MicrosoftAdvertising.Shared.WinRT.RendererOptions
                    }
                    catch(err) {}
                    this._rendererOptionsUsedInRequest = null;
                    this._globalAdEngagedHandler = null;
                    this._globalAdDisengagedHandler = null;
                    this._ad = null;
                    this._adIFrame = null;
                    this._expandedIFrame = null;
                    this._iFrameToRemove = null;
                    this._applicationId = "";
                    this._adUnitId = "";
                    this._currentAdHeight = null;
                    this._currentAdWidth = null;
                    this._defaultStateSize = {};
                    this._isDisposed = false;
                    this._errorReportCount = 0;
                    this._expandProperties = null;
                    this._isAutoRefreshEnabled = true;
                    this._isExpanded = false;
                    this._isUserEngaged = false;
                    this._isSuspended = false;
                    this._ormmaState = this._ORMMA_STATE_DEFAULT;
                    this._placement = null;
                    this._previousOrmmaState = "";
                    this._refreshPeriodSeconds = 60;
                    this._refreshTimerId = null;
                    this._requestInProgress = false;
                    this._timeAtLastRotation = null;
                    this._currentCloseBandHeight = this._RESERVED_CLOSE_BAND_HEIGHT;
                    this._accelerometer = {
                        device: null, tiltHandlers: [], shakeHandlers: []
                    };
                    this._lastCoords = {
                        x: 0, y: 0, z: 0
                    };
                    this._viewableChangedTimer = null;
                    this._hasViewablility = false;
                    this._viewableCheckPeriodMs = 500;
                    this._orientationChangedHandler = null;
                    this._fadeOptions = {
                        timer: {linear: " cubic-bezier(0,0,1,1)"}, fadeInTimeS: 0.7, fadeOutTimeS: 0.7
                    };
                    this._sensorOptions = {accelerometer: {reportIntervalMS: 50}};
                    this._adInstanceState = null;
                    this._onAdRefreshedInternal = null;
                    this._onAdRefreshed = null;
                    this._onBeforeAdRender = null;
                    this._onErrorOccurred = null;
                    this._onEngagedChanged = null;
                    this._onPointerDown = null;
                    this._onPointerUp = null;
                    this._onPointerMove = null;
                    this._onPointerHover = null;
                    this._onMouseWheel = null;
                    this._onManipulationStateChanged = null;
                    this._preventDefaultAppHandlers = false;
                    this._applicationEventsMask = 0;
                    element.style.breakInside = "avoid";
                    element.style.overflow = "hidden";
                    WinJS.UI.setOptions(this, options);
                    this._setElement(element);
                    this._setupEvents();
                    var self = this;
                    setImmediate(function()
                    {
                        if (!self._requestInProgress && self._ad === null)
                        {
                            self._refreshInternal()
                        }
                    })
                }
                catch(err)
                {
                    return
                }
            }, {
                _MSG_TYPE_ADPARAMS: "adParams", _MSG_TYPE_PRMPARAMS: "prmParams", _MSG_TYPE_APPPARAMS: "appParams", _MSG_TYPE_INIT: "init", _MSG_TYPE_ORMMA_START: "ormmaStart", _MSG_TYPE_SCRIPT: "script", _MSG_TYPE_SETMAXSIZE: "setMaxSize", _MSG_TYPE_SETSCREENSIZE: "setScreenSize", _MSG_TYPE_SETSIZE: "setSize", _MSG_TYPE_SETSTATE: "setState", _MSG_TYPE_SETID: "setId", _MSG_TYPE_FIRESHAKE: "fireShake", _MSG_TYPE_UPDATETILTCOORDS: "updateTiltCoords", _MSG_TYPE_UPDATEORIENTATION: "updateOrienation", _MSG_TYPE_SETNETWORK: "setNetwork", _MSG_TYPE_VIEWABLECHANGE: "viewableChange", _MSG_TYPE_SETLOCALE: "setLocale", _MSG_TYPE_SETSDKINFO: "setSdkInfo", _MSG_TYPE_SETCAPABILITY: "setCapability", _MSG_TYPE_SETADINSTANCESTATE: "setAdInstanceState", _MSG_TYPE_WIREAPPEVENTS: "wireAppEvents", _MSG_TYPE_INITIALIZED: "adInitialized", _MSG_TYPE_ADRENDERED: "rendered", _MSG_TYPE_OPEN: "web", _MSG_TYPE_EXPAND: "expand", _MSG_TYPE_CLOSE: "close", _MSG_TYPE_RESIZE: "resize", _MSG_TYPE_HIDE: "hide", _MSG_TYPE_SHOW: "show", _MSG_TYPE_SETEXPANDPROPERTIES: "setexpandproperties", _MSG_TYPE_SETUSERENGAGED: "setuserengaged", _MSG_TYPE_TILT: "tilt", _MSG_TYPE_SHAKE: "shake", _MSG_TYPE_LISTENER: "listener", _MSG_TYPE_VALUESTART: "start", _MSG_TYPE_VALUESTOP: "stop", _MSG_TYPE_GETTILT: "gettilt", _MSG_TYPE_GETORIENTATION: "getorientation", _MSG_TYPE_REFRESH: "refresh", _MSG_TYPE_REQUEST: "request", _MSG_TYPE_STOREADINSTANCESTATE: "storeadinstancestate", _MSG_TYPE_ONPOINTERDOWN: "MSPointerDown", _MSG_TYPE_ONPOINTERUP: "MSPointerUp", _MSG_TYPE_USECUSTOMCLOSE: "usecustomclose", _MSG_TYPE_ONMOUSEWHEEL: "MSMouseWheel", _MSG_TYPE_ONPOINTERMOVE: "MSPointerMove", _MSG_TYPE_ONPOINTERHOVER: "MSPointerHover", _MSG_TYPE_ONMANIPSTATECHANGED: "MSManipulationStateChanged", _MSG_TYPE_ERROR: "error", _ORMMA_STATE_DEFAULT: "default", _ORMMA_STATE_EXPANDED: "expanded", _ORMMA_STATE_HIDDEN: "hidden", _ORMMA_STATE_RESIZED: "resized", _ORMMA_STATE_SUSPENDED: "suspended", _ORMMA_NETWORK_OFFLINE: "offline", _ORMMA_NETWORK_WIFI: "wifi", _ORMMA_NETWORK_CELL: "cell", _ORMMA_NETWORK_UNKNOWN: "unknown", _ORMMA_RESPONSE_IGNORE: "ignore", _ORMMA_RESPONSE_PROXY: "proxy", _HTTP_HEADER_CACHE_CONTROL: "cache-control", _HTTP_HEADER_VALUE_CACHE_CONTROL_NO_CACHE: "no-cache", _RESERVED_CLOSE_BAND_HEIGHT: 2 * 50, _MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_METERED: 60000, _MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_UNMETERED: 30000, _MAX_ERROR_REPORT: 20, _MAX_ERROR_REPORT_MESSAGE: "error reporting maximum reached, no more errors will be reported", _MAX_URL_LENGTH: 2048, _ERROR_ENUM: {
                        Unknown: "Unknown", NoAdAvailable: "NoAdAvailable", NetworkConnectionFailure: "NetworkConnectionFailure", ClientConfiguration: "ClientConfiguration", ServerSideError: "ServerSideError", InvalidServerResponse: "InvalidServerResponse", RefreshNotAllowed: "RefreshNotAllowed", Other: "Other"
                    }, _EVENT_TYPE_ENUM: {
                        All: ~0, PointerDown: 1, PointerUp: 1 << 1, PointerMove: 1 << 2, PointerHover: 1 << 3, MouseWheel: 1 << 4, ManipulationStateChanged: 1 << 5
                    }, onAdRefreshed: {
                        get: function()
                        {
                            return this._onAdRefreshed
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onAdRefreshed = value
                                }
                            }
                    }, onBeforeAdRender: {
                        get: function()
                        {
                            return this._onBeforeAdRender
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onBeforeAdRender = value
                                }
                            }
                    }, onErrorOccurred: {
                        get: function()
                        {
                            return this._onErrorOccurred
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onErrorOccurred = value
                                }
                            }
                    }, onEngagedChanged: {
                        get: function()
                        {
                            return this._onEngagedChanged
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onEngagedChanged = value
                                }
                            }
                    }, onPointerDown: {
                        get: function()
                        {
                            return this._onPointerDown
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onPointerDown = value;
                                    if (typeof(value) === "function")
                                    {
                                        this._addApplicationEventType(this._EVENT_TYPE_ENUM.PointerDown);
                                        this._updateApplicationEvents()
                                    }
                                    else
                                    {
                                        this._removeApplicationEventType(this._EVENT_TYPE_ENUM.PointerDown);
                                        this._updateApplicationEvents()
                                    }
                                }
                            }
                    }, onPointerUp: {
                        get: function()
                        {
                            return this._onPointerUp
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onPointerUp = value;
                                    if (typeof(value) === "function")
                                    {
                                        this._addApplicationEventType(this._EVENT_TYPE_ENUM.PointerUp)
                                    }
                                    else
                                    {
                                        this._removeApplicationEventType(this._EVENT_TYPE_ENUM.PointerUp)
                                    }
                                    this._updateApplicationEvents()
                                }
                            }
                    }, onMouseWheel: {
                        get: function()
                        {
                            return this._onMouseWheel
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onMouseWheel = value;
                                    if (typeof(value) === "function")
                                    {
                                        this._addApplicationEventType(this._EVENT_TYPE_ENUM.MouseWheel)
                                    }
                                    else
                                    {
                                        this._removeApplicationEventType(this._EVENT_TYPE_ENUM.MouseWheel)
                                    }
                                    this._updateApplicationEvents()
                                }
                            }
                    }, onPointerMove: {
                        get: function()
                        {
                            return this._onPointerMove
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onPointerMove = value;
                                    if (typeof(value) === "function")
                                    {
                                        this._addApplicationEventType(this._EVENT_TYPE_ENUM.PointerMove)
                                    }
                                    else
                                    {
                                        this._removeApplicationEventType(this._EVENT_TYPE_ENUM.PointerMove)
                                    }
                                    this._updateApplicationEvents()
                                }
                            }
                    }, onPointerHover: {
                        get: function()
                        {
                            return this._onPointerHover
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onPointerHover = value;
                                    if (typeof(value) === "function")
                                    {
                                        this._addApplicationEventType(this._EVENT_TYPE_ENUM.PointerHover)
                                    }
                                    else
                                    {
                                        this._removeApplicationEventType(this._EVENT_TYPE_ENUM.PointerHover)
                                    }
                                    this._updateApplicationEvents()
                                }
                            }
                    }, onManipulationStateChanged: {
                        get: function()
                        {
                            return this._onManipulationStateChanged
                        }, set: function(value)
                            {
                                if (typeof(value) === "function" || value === null || typeof(value) === "undefined")
                                {
                                    this._onManipulationStateChanged = value;
                                    if (typeof(value) === "function")
                                    {
                                        this._addApplicationEventType(this._EVENT_TYPE_ENUM.ManipulationStateChanged)
                                    }
                                    else
                                    {
                                        this._removeApplicationEventType(this._EVENT_TYPE_ENUM.ManipulationStateChanged)
                                    }
                                    this._updateApplicationEvents()
                                }
                            }
                    }, preventDefaultApplicationEvents: {
                        get: function()
                        {
                            return this._preventDefaultAppHandlers
                        }, set: function(value)
                            {
                                if (this._preventDefaultAppHandlers !== value)
                                {
                                    this._preventDefaultAppHandlers = value
                                }
                            }
                    }, applicationId: {
                        get: function()
                        {
                            return this._applicationId
                        }, set: function(value)
                            {
                                if (this._applicationId !== value)
                                {
                                    this._applicationId = value
                                }
                            }
                    }, adUnitId: {
                        get: function()
                        {
                            return this._adUnitId
                        }, set: function(value)
                            {
                                if (this._adUnitId !== value)
                                {
                                    this._adUnitId = value
                                }
                            }
                    }, isAutoRefreshEnabled: {
                        get: function()
                        {
                            return this._isAutoRefreshEnabled
                        }, set: function(value)
                            {
                                if (this._isAutoRefreshEnabled !== value)
                                {
                                    this._isAutoRefreshEnabled = value;
                                    if (this._isAutoRefreshEnabled)
                                    {
                                        this._scheduleRefresh()
                                    }
                                    else
                                    {
                                        this._unscheduleRefresh()
                                    }
                                }
                            }
                    }, isEngaged: {get: function()
                        {
                            return this._isExpanded || this._isUserEngaged
                        }}, isSuspended: {get: function()
                        {
                            return this._isSuspended
                        }}, latitude: {
                        get: function()
                        {
                            return this._latitude
                        }, set: function(value)
                            {
                                if (typeof(value) === "string")
                                {
                                    this._latitude = parseFloat(value)
                                }
                                else
                                {
                                    this._latitude = value
                                }
                            }
                    }, longitude: {
                        get: function()
                        {
                            return this._longitude
                        }, set: function(value)
                            {
                                if (typeof(value) === "string")
                                {
                                    this._longitude = parseFloat(value)
                                }
                                else
                                {
                                    this._longitude = value
                                }
                            }
                    }, element: {get: function()
                        {
                            return this._domElement
                        }}, addAdTag: function(tagName, tagValue)
                    {
                        if (typeof(tagName) === "string" && typeof(tagValue) === "string")
                        {
                            try
                            {
                                this._rendererOptions.addRendererOption(tagName, tagValue)
                            }
                            catch(e)
                            {
                                this._fireErrorOccurred("could not add renderer option or value", this._ERROR_ENUM.Other)
                            }
                        }
                        else
                        {
                            this._fireErrorOccurred("could not add renderer option or value as they were not strings", this._ERROR_ENUM.Other)
                        }
                    }, removeAdTag: function(tagName)
                    {
                        if (typeof(tagName) === "string")
                        {
                            try
                            {
                                this._rendererOptions.removeRendererOption(tagName)
                            }
                            catch(e)
                            {
                                this._fireErrorOccurred("could not remove renderer option or value", this._ERROR_ENUM.Other)
                            }
                        }
                    }, refresh: function()
                    {
                        if (this._isAutoRefreshEnabled)
                        {
                            this._fireErrorOccurred("refresh() may not be called when auto-refresh is enabled (isAutoRefreshEnabled=true)", this._ERROR_ENUM.RefreshNotAllowed);
                            return
                        }
                        if (!this._checkIfRefreshIntervalMetAndRaiseError())
                        {
                            return
                        }
                        this._refreshInternal()
                    }, suspend: function()
                    {
                        if (this._isExpanded)
                        {
                            this._closePopup()
                        }
                        this._unscheduleRefresh();
                        if (this._ormmaState !== this._ORMMA_STATE_SUSPENDED)
                        {
                            this._setState(this._ORMMA_STATE_SUSPENDED)
                        }
                        this._isSuspended = true
                    }, resume: function()
                    {
                        this._scheduleRefresh();
                        if (this._ormmaState === this._ORMMA_STATE_SUSPENDED)
                        {
                            if (typeof(this._previousOrmmaState) === "undefined" || this._previousOrmmaState === null)
                            {
                                this._setState(this._ORMMA_STATE_DEFAULT)
                            }
                            else
                            {
                                this._setState(this._previousOrmmaState)
                            }
                        }
                        this._isSuspended = false
                    }, dispose: function()
                    {
                        try
                        {
                            if (this._expandedIFrame !== null)
                            {
                                this._closePopup()
                            }
                            if (typeof(this._resizeHandler) === "function")
                            {
                                window.removeEventListener("resize", this._resizeHandler);
                                this._resizeHandler = null
                            }
                            if (typeof(this._domNodeRemovedHandler) === "function")
                            {
                                if (this._domElement !== null)
                                {
                                    this._domElement.removeEventListener("DOMNodeRemoved", this._domNodeRemovedHandler)
                                }
                                this._domNodeRemovedHandler = null
                            }
                            if (this._adIFrame !== null)
                            {
                                this._removeIFrame(this._adIFrame);
                                this._adIFrame = null
                            }
                            this._disposeAccelerometer();
                            this._stopOrientationMonitoring();
                            this._stopViewableChangeMonitoring();
                            this._onAdRefreshedInternal = null;
                            this._onAdRefreshed = null;
                            this._onBeforeAdRender = null;
                            this._onErrorOccurred = null;
                            this._onEngagedChanged = null;
                            this._onPointerDown = null;
                            this._onPointerUp = null;
                            this._onMouseWheel = null;
                            this._onPointerMove = null;
                            this._onPointerHover = null;
                            this._onManipulationStateChanged = null;
                            this._onRemove();
                            this._applicationEventsMask = 0;
                            this._preventDefaultAppHandlers = false;
                            this._adsGlobalEventManager.removeEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_ENGAGED, this._globalAdEngagedHandler);
                            this._adsGlobalEventManager.removeEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_DISENGAGED, this._globalAdDisengagedHandler);
                            this._adsGlobalEventManager.dispose();
                            if (this._domElement !== null)
                            {
                                this._domElement.winControl = null;
                                this._domElement.onresize = null;
                                this._domElement = null
                            }
                            this._rendererOptionsUsedInRequest = null;
                            this._isDisposed = true
                        }
                        catch(err) {}
                    }, _checkIfRefreshIntervalMetAndRaiseError: function()
                    {
                        var isIntervalMet = false;
                        var refreshInterval = this._MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_UNMETERED;
                        if (this._timeAtLastRotation !== null)
                        {
                            try
                            {
                                var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                                if (connectionProfile !== null)
                                {
                                    var currentConnectionCost = connectionProfile.getConnectionCost();
                                    var isMeteredConnection = currentConnectionCost.NetworkCostType === Windows.Networking.Connectivity.NetworkCostType.fixed || currentConnectionCost.NetworkCostType === Windows.Networking.Connectivity.NetworkCostType.variable;
                                    refreshInterval = isMeteredConnection ? this._MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_METERED : this._MIN_AD_REFRESH_INTERVAL_IN_MILLISECONDS_UNMETERED
                                }
                            }
                            catch(err) {}
                        }
                        else
                        {
                            this._timeAtLastRotation = new Date;
                            return true
                        }
                        isIntervalMet = new Date - this._timeAtLastRotation > refreshInterval;
                        if (!isIntervalMet)
                        {
                            this._fireErrorOccurred("refresh() may not be called more than once every " + refreshInterval / 1000 + " seconds.", this._ERROR_ENUM.RefreshNotAllowed)
                        }
                        return isIntervalMet
                    }, _log: function(msg){}, _getSdkInfo: function()
                    {
                        try
                        {
                            var info = MicrosoftAdvertising.Shared.WinRT.SdkInfoProvider.getSdkInfo();
                            return {
                                    sdkVersion: info.sdkVersion, client: info.client, runtimeType: info.runtimeType
                                }
                        }
                        catch(err)
                        {
                            return {}
                        }
                    }, _fadeIn: function(elem, callback)
                    {
                        try
                        {
                            if (typeof(elem) === "object" && elem !== null)
                            {
                                elem.style.visibility = "inherit";
                                elem.style.transition = "opacity " + this._fadeOptions.fadeInTimeS + "s" + this._fadeOptions.timer.linear;
                                elem.style.opacity = 1;
                                if (typeof(callback) === "function")
                                {
                                    window.setTimeout(function()
                                    {
                                        callback(true)
                                    }, this._fadeOptions.fadeInTimeS * 1000)
                                }
                            }
                            else if (typeof(callback) === "function")
                            {
                                callback(false)
                            }
                        }
                        catch(err) {}
                    }, _fadeOut: function(elem, callback)
                    {
                        try
                        {
                            if (typeof(elem) === "object" && elem !== null)
                            {
                                elem.style.transition = "opacity " + this._fadeOptions.fadeInTimeS + "s" + this._fadeOptions.timer.linear;
                                elem.style.opacity = 0;
                                if (typeof(callback) === "function")
                                {
                                    window.setTimeout(function()
                                    {
                                        callback(true)
                                    }, this._fadeOptions.fadeOutTimeS * 1000)
                                }
                            }
                            else if (typeof(callback) === "function")
                            {
                                callback(false)
                            }
                        }
                        catch(err) {}
                    }, _refreshInternal: function()
                    {
                        if (this._requestInProgress)
                        {
                            this._fireErrorOccurred("refresh triggered but request is already in progress", this._ERROR_ENUM.RefreshNotAllowed);
                            return
                        }
                        this._requestInProgress = true;
                        try
                        {
                            if (Windows.ApplicationModel.DesignMode.designModeEnabled)
                            {
                                this._requestInProgress = false;
                                return
                            }
                        }
                        catch(err) {}
                        if (window !== top)
                        {
                            this._requestInProgress = false;
                            this._fireErrorOccurred("ad control may not be loaded in an iframe", this._ERROR_ENUM.Other);
                            return
                        }
                        if (this._domElement === null || this._domElement.offsetWidth === 0 || this._domElement.offsetHeight === 0)
                        {
                            this._requestInProgress = false;
                            return
                        }
                        if (this._isExpanded)
                        {
                            this._requestInProgress = false;
                            return
                        }
                        if (this._isSuspended)
                        {
                            this._requestInProgress = false;
                            this._fireErrorOccurred("cannot refresh when suspended", this._ERROR_ENUM.RefreshNotAllowed);
                            return
                        }
                        if (this._isUserEngaged)
                        {
                            this._requestInProgress = false;
                            this._scheduleRefresh();
                            return
                        }
                        if (typeof(window._msAdEngaged) !== "undefined" && window._msAdEngaged)
                        {
                            this._requestInProgress = false;
                            this._scheduleRefresh();
                            return
                        }
                        if (!this._validateParameters())
                        {
                            this._requestInProgress = false;
                            this._scheduleRefresh();
                            return
                        }
                        if (this._adIFrame !== null && (document.hidden || !this._isOnScreen()))
                        {
                            this._requestInProgress = false;
                            this._fireErrorOccurred("refresh not performed because ad is not on screen", this._ERROR_ENUM.RefreshNotAllowed);
                            this._scheduleRefresh();
                            return
                        }
                        if (this._placement === null)
                        {
                            try
                            {
                                this._placement = new MicrosoftAdvertising.Shared.WinRT.AdPlacement
                            }
                            catch(err)
                            {
                                this._requestInProgress = false;
                                this._fireErrorOccurred("could not initialize AdPlacement", this._ERROR_ENUM.Other);
                                return
                            }
                        }
                        this._placement.applicationId = this._applicationId;
                        this._placement.adUnitId = this._adUnitId;
                        this._placement.latitude = this.latitude;
                        this._placement.longitude = this.longitude;
                        this._placement.width = this._domElement.offsetWidth;
                        this._placement.height = this._domElement.offsetHeight;
                        if (this._rendererOptions !== null && typeof(this._rendererOptions) !== "undefined")
                        {
                            try
                            {
                                this._rendererOptionsUsedInRequest = this._rendererOptions.getOptionsJson()
                            }
                            catch(e)
                            {
                                this._log("error: could not get renderer options as json")
                            }
                            this._placement.adTags = this._rendererOptions.getOptions()
                        }
                        try
                        {
                            var self = this;
                            this._placement.getAdAsync().done(function(ad)
                            {
                                if (ad !== null)
                                {
                                    self._adRefreshedCallback(ad)
                                }
                                else
                                {
                                    if (!self._isDisposed && self._placement !== null && typeof(self._placement) !== "undefined")
                                    {
                                        var error = self._placement.lastError;
                                        self._errorOccurredCallback(error)
                                    }
                                }
                            }, function(evt)
                            {
                                if (!self._isDisposed && self._placement !== null && typeof(self._placement) !== "undefined")
                                {
                                    var error = self._placement.lastError;
                                    self._errorOccurredCallback(error)
                                }
                            });
                            this._timeAtLastRotation = new Date
                        }
                        catch(err)
                        {
                            self._errorOccurredCallback({
                                errorMessage: err.message, errorCode: this._ERROR_ENUM.Other
                            })
                        }
                    }, _networkInfo: function()
                    {
                        try
                        {
                            return Windows.Networking.Connectivity.NetworkInformation
                        }
                        catch(err) {}
                    }(), _networkChangedEventHandler: function(){}, _isViewable: function()
                    {
                        if (this._adIFrame === null)
                        {
                            return false
                        }
                        var iframeOpacity = 0;
                        try
                        {
                            var iframeStyle = getComputedStyle(this._adIFrame, null);
                            if (typeof(iframeStyle) !== "undefined" && iframeStyle !== null && typeof(iframeStyle.opacity) === "string")
                            {
                                iframeOpacity = parseInt(iframeStyle.opacity, 10);
                                if (isNaN(iframeOpacity))
                                {
                                    iframeOpacity = 0
                                }
                            }
                        }
                        catch(e)
                        {
                            return false
                        }
                        return (this._isOnScreen() && iframeOpacity === 1)
                    }, _isOnScreen: function()
                    {
                        if (this._domElement === null || this._domElement.offsetWidth === 0 || this._domElement.offsetHeight === 0 || this._isElementHidden() || this._adIFrame.offsetWidth === 0 || this._adIFrame.offsetHeight === 0)
                        {
                            return false
                        }
                        var fractionAllowedOffScreen = 0.4;
                        var adRect = {};
                        try
                        {
                            adRect = this._domElement.getBoundingClientRect()
                        }
                        catch(e)
                        {
                            return false
                        }
                        var xAllowedOff = this._domElement.offsetWidth * fractionAllowedOffScreen;
                        var yAllowedOff = this._domElement.offsetHeight * fractionAllowedOffScreen;
                        return (adRect.left >= -xAllowedOff) && (adRect.top >= -yAllowedOff) && (adRect.right < document.documentElement.offsetWidth + xAllowedOff) && (adRect.bottom < document.documentElement.offsetHeight + yAllowedOff)
                    }, _isElementHidden: function()
                    {
                        var tempElem = this._domElement;
                        while (tempElem !== null && typeof(tempElem) === "object" && tempElem.nodeName !== 'BODY')
                        {
                            var vis = typeof(tempElem.style) != "undefined" ? tempElem.style.visibility : "";
                            if (vis === "hidden" || vis === "collapse")
                            {
                                return true
                            }
                            else if (vis === 'visible')
                            {
                                break
                            }
                            else
                            {
                                tempElem = tempElem.parentNode
                            }
                        }
                        return false
                    }, _errorOccurredCallback: function(evt)
                    {
                        if (this._isDisposed)
                        {
                            return
                        }
                        if (typeof(evt) !== "object" || evt === null)
                        {
                            this._fireErrorOccurred("Other", this._ERROR_ENUM.Other)
                        }
                        else
                        {
                            this._fireErrorOccurred(evt.errorMessage, evt.errorCode)
                        }
                        this._currentAdHeight = null;
                        this._currentAdWidth = null;
                        this._requestInProgress = false;
                        this._scheduleRefresh()
                    }, _adRefreshedCallback: function(ad)
                    {
                        if (this._isDisposed)
                        {
                            return
                        }
                        if (ad !== null)
                        {
                            this._onAdReceived(ad)
                        }
                        this._requestInProgress = false;
                        this._updateApplicationEvents();
                        this._scheduleRefresh()
                    }, _addApplicationEventType: function(eventType)
                    {
                        if (eventType !== null && typeof(eventType) === "number" && (eventType & this._applicationEventsMask) === 0)
                        {
                            this._applicationEventsMask = this._applicationEventsMask | eventType
                        }
                    }, _removeApplicationEventType: function(eventType)
                    {
                        var off;
                        if (eventType !== null && typeof(eventType) === "number" && (eventType & this._applicationEventsMask) !== 0)
                        {
                            off = eventType ^ (~0);
                            this._applicationEventsMask = this._applicationEventsMask & off
                        }
                    }, _updateApplicationEvents: function()
                    {
                        if (this._isDisposed === true)
                        {
                            return
                        }
                        if (this._requestInProgress === true)
                        {
                            return
                        }
                        try
                        {
                            if (this._adIFrame !== null && typeof(this._adIFrame) !== "undefined" && this._ormmaState !== this._ORMMA_STATE_EXPANDED)
                            {
                                this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_WIREAPPEVENTS + ":" + JSON.stringify({
                                    events: this._applicationEventsMask, preventDefault: this.preventDefaultApplicationEvents
                                }))
                            }
                        }
                        catch(err)
                        {
                            return
                        }
                    }, _onAdReceived: function(ad)
                    {
                        if (typeof(ad) !== "undefined" && ad !== null)
                        {
                            this._resetAdControl();
                            this._ad = ad;
                            this._currentAdHeight = this._placement.height;
                            this._currentAdWidth = this._placement.width;
                            if (typeof(this._iFrameToRemove) !== "undefined" && this._iFrameToRemove !== null)
                            {
                                this._removeIFrame(this.iFrameToRemove);
                                this._iFrameToRemove = null
                            }
                            this._iFrameToRemove = this._adIFrame;
                            try
                            {
                                var rendererUrl = this._ad.rendererUrl;
                                var adString = this._ad.adParameters;
                                var prmString = this._ad.prmParameters
                            }
                            catch(err)
                            {
                                if (err !== null && typeof(err) === "object")
                                {
                                    this._fireErrorOccurred(err.message, this._ERROR_ENUM.Other)
                                }
                                return
                            }
                            var self = this;
                            var createFrameAndLoadAd = function()
                                {
                                    var newFrame = self._createMainFrame();
                                    if (newFrame === null || typeof(newFrame) !== "object")
                                    {
                                        self._fireErrorOccurred("could not create iframe", self._ERROR_ENUM.Other);
                                        return
                                    }
                                    self._adIFrame = newFrame;
                                    self._onAdRefreshedInternal = function()
                                    {
                                        if (typeof(self._iFrameToRemove) === "object" && self._iFrameToRemove !== null)
                                        {
                                            self._fadeIn(newFrame, function()
                                            {
                                                self._removeIFrame(self._iFrameToRemove);
                                                self._iFrameToRemove = null
                                            })
                                        }
                                        else
                                        {
                                            self._showIFrame(newFrame)
                                        }
                                        self._onAdRefreshedInternal = null
                                    };
                                    self._loadAdInFrame(newFrame, rendererUrl, adString, prmString)
                                };
                            var promise = this._fireBeforeAdRender();
                            if (typeof(promise) === "object" && promise !== null && typeof(promise.then) === "function")
                            {
                                promise.then(createFrameAndLoadAd)
                            }
                            else
                            {
                                createFrameAndLoadAd()
                            }
                        }
                    }, _resetAdControl: function()
                    {
                        this._adInstanceState = null;
                        this._disposeAccelerometer();
                        this._stopOrientationMonitoring();
                        this._stopViewableChangeMonitoring();
                        this._setUseCustomClose(false);
                        this._errorReportCount = 0;
                        this._expandProperties = null;
                        this._ormmaState = this._ORMMA_STATE_DEFAULT;
                        this._previousOrmmaState = "";
                        this._currentCloseBandHeight = this._RESERVED_CLOSE_BAND_HEIGHT
                    }, _showIFrame: function(iFrame)
                    {
                        if (typeof(iFrame) === "object" && iFrame !== null)
                        {
                            iFrame.style.opacity = 1;
                            iFrame.style.visibility = "inherit"
                        }
                    }, _removeIFrame: function(iFrame)
                    {
                        if (iFrame === null || typeof(iFrame) === "undefined")
                        {
                            iFrame = this._adIFrame
                        }
                        this._removeFromParent(iFrame)
                    }, _removeFromParent: function(child)
                    {
                        try
                        {
                            if (child !== null && typeof(child) === "object")
                            {
                                var parentElem = child.parentNode;
                                if (parentElem !== null && typeof(parentElem) === "object")
                                {
                                    parentElem.removeChild(child)
                                }
                            }
                        }
                        catch(err) {}
                    }, _createMainFrame: function()
                    {
                        return this._createIFrame(this._domElement.id + "_webFrame_" + (+new Date), this._domElement.offsetWidth, this._domElement.offsetHeight, this._domElement, this._ORMMA_STATE_DEFAULT)
                    }, _initializeOrmma: function(iframe, width, height, ormmaState)
                    {
                        var adSize = {
                                height: height, width: width
                            };
                        var locale = "undefined";
                        try
                        {
                            locale = Windows.Globalization.ApplicationLanguages.languages[0]
                        }
                        catch(err)
                        {
                            this._log("locale init error: " + (typeof(err) === "object" ? err.message : err))
                        }
                        if (ormmaState === this._ORMMA_STATE_DEFAULT)
                        {
                            this._defaultStateSize = adSize
                        }
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSIZE + ":" + JSON.stringify(adSize));
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETMAXSIZE + ":" + JSON.stringify(adSize));
                        this._setOrmmaScreenSize(iframe);
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSTATE + ":" + ormmaState);
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETLOCALE + ":" + locale);
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETNETWORK + ":" + this._getNetworkState());
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSDKINFO + ":" + JSON.stringify(this._getSdkInfo()));
                        var isAccelerometerPresent = false;
                        try
                        {
                            isAccelerometerPresent = Windows.Devices.Sensors.Accelerometer.getDefault() !== null
                        }
                        catch(err) {}
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETCAPABILITY + ":" + JSON.stringify({
                            capability: "tilt", value: isAccelerometerPresent
                        }));
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETCAPABILITY + ":" + JSON.stringify({
                            capability: "shake", value: isAccelerometerPresent
                        }));
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_ORMMA_START)
                    }, _createIFrame: function(frameId, width, height, parentElem, ormmaState)
                    {
                        try
                        {
                            var iframe = document.createElement("iframe");
                            iframe.src = "ms-appx-web:///MSAdvertisingJS/ads/bootstrap.html";
                            iframe.width = width + "px";
                            iframe.height = height + "px";
                            iframe.frameBorder = "0px";
                            iframe.marginwidth = "0px";
                            iframe.marginheight = "0px";
                            iframe.id = frameId;
                            iframe.scrolling = "no";
                            iframe.style.position = "absolute";
                            iframe.style.visibility = "hidden";
                            iframe.style.backgroundColor = "transparent";
                            iframe.style.opacity = 0;
                            parentElem.appendChild(iframe);
                            this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETID + ":" + this._domElement.id);
                            this._initializeOrmma(iframe, width, height, ormmaState);
                            return iframe
                        }
                        catch(err)
                        {
                            return
                        }
                    }, _setElement: function(element)
                    {
                        if (element.id === null || element.id === "")
                        {
                            element.id = this._generateUniqueId()
                        }
                        this._domElement = element
                    }, _generateUniqueId: function()
                    {
                        var generatedId = null;
                        var existingElem = null;
                        do
                        {
                            generatedId = "ad" + Math.floor(Math.random() * 10000);
                            existingElem = document.getElementById(generatedId)
                        } while (existingElem !== null);
                        return generatedId
                    }, _loadAdInFrame: function(iframe, rendererUrl, adString, prmString)
                    {
                        if (this._renderContent === null || typeof(this._renderContent) === "undefined")
                        {
                            if (this._getNetworkState() === this._ORMMA_NETWORK_OFFLINE)
                            {
                                this._removeIFrame(iframe);
                                this._fireErrorOccurred("no network is available", this._ERROR_ENUM.NetworkConnectionFailure);
                                return
                            }
                            var xhr = new XMLHttpRequest;
                            var self = this;
                            xhr.onreadystatechange = function()
                            {
                                if (xhr.readyState === XMLHttpRequest.DONE)
                                {
                                    if (xhr.status === 200)
                                    {
                                        self._rendererContent = xhr.responseText;
                                        self._loadAdInFrameB(iframe, self._rendererContent, adString, prmString)
                                    }
                                    else
                                    {
                                        self._removeIFrame(iframe);
                                        self._fireErrorOccurred("error loading ad renderer: code " + xhr.status, self._ERROR_ENUM.NetworkConnectionFailure)
                                    }
                                }
                            };
                            xhr.open("GET", rendererUrl, true);
                            xhr.timeout = 10000;
                            try
                            {
                                xhr.send(null)
                            }
                            catch(e)
                            {
                                this._removeIFrame(iframe);
                                this._fireErrorOccurred("http request error: " + e.message, this._ERROR_ENUM.NetworkConnectionFailure);
                                return
                            }
                        }
                        else
                        {
                            this._loadAdInFrameB(iframe, this._rendererContent, adString, prmString)
                        }
                    }, _loadAdInFrameB: function(iframe, rendererContent, adString, prmString)
                    {
                        this._rendererParams = adString;
                        this._prmParams = prmString;
                        this._sendAdDataToAdContainer(iframe, rendererContent, adString, prmString)
                    }, _sendMessageToAdContainer: function(iframe, msg)
                    {
                        if (iframe !== null && iframe !== undefined)
                        {
                            var target = iframe.contentWindow;
                            var origin = "ms-appx-web://" + document.location.host;
                            var self = this;
                            setImmediate(function()
                            {
                                if (target && !self._isDisposed)
                                {
                                    try
                                    {
                                        target.postMessage(msg, origin)
                                    }
                                    catch(err)
                                    {
                                        if (err !== null && typeof(err) === "object")
                                        {
                                            self._log("postMessage error" + (typeof(err) !== "undefined" ? ": " + err.message : ""))
                                        }
                                    }
                                }
                            })
                        }
                    }, _sendMessageToAllAdContainers: function(msg)
                    {
                        try
                        {
                            this._sendMessageToAdContainer(this._adIFrame, msg);
                            this._sendMessageToAdContainer(this._expandedIFrame, msg)
                        }
                        catch(err) {}
                    }, _sendAdDataToAdContainer: function(iframe, renderer, ad, prm)
                    {
                        try
                        {
                            if (typeof(ad) === "string" && ad !== "")
                            {
                                this._sendMessageToAdContainer(iframe, this._MSG_TYPE_ADPARAMS + ":" + ad)
                            }
                            if (typeof(prm) === "string" && prm !== "")
                            {
                                this._sendMessageToAdContainer(iframe, this._MSG_TYPE_PRMPARAMS + ":" + prm)
                            }
                            var appPrm = this._rendererOptionsUsedInRequest;
                            if (typeof(appPrm) === "string" && appPrm !== "")
                            {
                                this._sendMessageToAdContainer(iframe, this._MSG_TYPE_APPPARAMS + ":" + appPrm)
                            }
                            this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SCRIPT + ":" + renderer);
                            this._sendMessageToAdContainer(iframe, this._MSG_TYPE_INIT)
                        }
                        catch(err) {}
                    }, _fireErrorOccurred: function(msg, errorCode)
                    {
                        this._log(msg + " (" + errorCode + ")");
                        if (typeof(this._onErrorOccurred) === "function")
                        {
                            this._onErrorOccurred(this, {
                                errorMessage: msg, errorCode: errorCode
                            })
                        }
                    }, _firePointerDown: function(msg)
                    {
                        if (typeof(this._onPointerDown) === "function")
                        {
                            this._onPointerDown(this, msg)
                        }
                    }, _firePointerUp: function()
                    {
                        if (typeof(this._onPointerUp) === "function")
                        {
                            this._onPointerUp(this)
                        }
                    }, _fireEngagedChanged: function()
                    {
                        if (typeof(this._onEngagedChanged) === "function")
                        {
                            this._onEngagedChanged(this)
                        }
                    }, _fireMouseWheel: function(evt)
                    {
                        if (typeof(this._onMouseWheel) === "function")
                        {
                            this._onMouseWheel(this, evt)
                        }
                    }, _firePointerMove: function(evt)
                    {
                        if (typeof(this._onPointerMove) === "function")
                        {
                            this._onPointerMove(this, evt)
                        }
                    }, _firePointerHover: function(evt)
                    {
                        if (typeof(this._onPointerHover) === "function")
                        {
                            this._onPointerHover(this, evt)
                        }
                    }, _fireManipulationStateChanged: function(evt)
                    {
                        if (typeof(this._onManipulationStateChanged) === "function")
                        {
                            this._onManipulationStateChanged(this, evt)
                        }
                    }, _fireAdRefreshed: function()
                    {
                        if (!this._isExpanded)
                        {
                            if (typeof(this._onAdRefreshedInternal) === "function")
                            {
                                this._onAdRefreshedInternal()
                            }
                            if (typeof(this._onAdRefreshed) === "function")
                            {
                                this._onAdRefreshed(this)
                            }
                        }
                    }, _fireBeforeAdRender: function()
                    {
                        if (typeof(this._onBeforeAdRender) === "function")
                        {
                            return this._onBeforeAdRender(this)
                        }
                        else
                        {
                            return null
                        }
                    }, _receiveMessage: function(msg)
                    {
                        if (msg.origin !== "ms-appx-web://" + document.location.host)
                        {
                            return
                        }
                        var msgStr = msg.data;
                        var colonIx = msgStr.indexOf(":");
                        if (colonIx < 0)
                        {
                            return
                        }
                        var divId = msgStr.substr(0, colonIx);
                        if (divId === "null")
                        {
                            return
                        }
                        msgStr = msgStr.substr(colonIx + 1);
                        var controlElem = document.getElementById(divId);
                        if (controlElem === null)
                        {
                            return
                        }
                        var control = controlElem.winControl;
                        if (control === null || typeof(control) !== "object" || control._isDisposed)
                        {
                            return
                        }
                        var msgType = null;
                        var msgParams = null;
                        colonIx = msgStr.indexOf(":");
                        if (colonIx < 0)
                        {
                            msgType = msgStr
                        }
                        else
                        {
                            msgType = msgStr.substr(0, colonIx);
                            msgParams = msgStr.substr(colonIx + 1)
                        }
                        if (msgType === control._MSG_TYPE_EXPAND)
                        {
                            try
                            {
                                var props = JSON.parse(msgParams);
                                if (control._ormmaState === control._ORMMA_STATE_DEFAULT || control._ormmaState === control._ORMMA_STATE_RESIZED)
                                {
                                    control._expand(props.url)
                                }
                                else
                                {
                                    control._reportError("expand", "state is not default or resized, current state is:" + control._ormmaState)
                                }
                            }
                            catch(err)
                            {
                                control._reportError(control._MSG_TYPE_EXPAND, "unable to parse expand properties as json")
                            }
                        }
                        else if (msgType === control._MSG_TYPE_CLOSE)
                        {
                            if (control._ormmaState === control._ORMMA_STATE_EXPANDED)
                            {
                                control._closePopup()
                            }
                            else if (control._ormmaState === control._ORMMA_STATE_DEFAULT)
                            {
                                control._resize(0, 0, control._ORMMA_STATE_HIDDEN)
                            }
                            else if (control._ormmaState === control._ORMMA_STATE_RESIZED)
                            {
                                control._resize(control._defaultStateSize.width, control._defaultStateSize.height, control._ORMMA_STATE_DEFAULT)
                            }
                            else
                            {
                                control._reportError("close", "state is not expanded, default or resized, current state is:" + control._ormmaState)
                            }
                        }
                        else if (msgType === control._MSG_TYPE_SETEXPANDPROPERTIES)
                        {
                            control._updateExpandProperties(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_SETUSERENGAGED)
                        {
                            control._processSetUserEngaged(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_ADRENDERED)
                        {
                            control._fireAdRefreshed()
                        }
                        else if (msgType === control._MSG_TYPE_INITIALIZED)
                        {}
                        else if (msgType === control._MSG_TYPE_TILT)
                        {
                            control._processTiltMessage(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_SHAKE)
                        {
                            control._processShakeMessage(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_GETORIENTATION)
                        {
                            control._processGetOrientationMessage(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_ERROR)
                        {
                            control._removeIFrame();
                            control._fireErrorOccurred(msgParams, control._ERROR_ENUM.Other)
                        }
                        else if (msgType === control._MSG_TYPE_RESIZE)
                        {
                            if (control._ormmaState === control._ORMMA_STATE_DEFAULT)
                            {
                                var resizeProps = JSON.parse(msgParams);
                                control._resize(resizeProps.width, resizeProps.height, control._ORMMA_STATE_RESIZED)
                            }
                            else
                            {
                                control._reportError("resize", "state is not default, current state is:" + control._ormmaState)
                            }
                        }
                        else if (msgType === control._MSG_TYPE_HIDE)
                        {
                            if (control._ormmaState === control._ORMMA_STATE_DEFAULT)
                            {
                                control._resize(0, 0, control._ORMMA_STATE_HIDDEN)
                            }
                            else
                            {
                                control._reportError("hide", "state is not default, current state is:" + control._ormmaState)
                            }
                        }
                        else if (msgType === control._MSG_TYPE_SHOW)
                        {
                            if (control._ormmaState === control._ORMMA_STATE_HIDDEN)
                            {
                                control._resize(control._defaultStateSize.width, control._defaultStateSize.height, control._ORMMA_STATE_DEFAULT)
                            }
                            else
                            {
                                control._reportError("show", "state is not hidden, current state is:" + control._ormmaState)
                            }
                        }
                        else if (msgType === control._MSG_TYPE_OPEN)
                        {
                            var data = JSON.parse(msgParams);
                            var uri = control._getUri(data);
                            if (uri !== null)
                            {
                                try
                                {
                                    Windows.System.Launcher.launchUriAsync(uri)
                                }
                                catch(err)
                                {
                                    control._reportError("open", "unable to open URL")
                                }
                            }
                            else
                            {
                                control._reportError("open", "parameters are not valid")
                            }
                        }
                        else if (msgType === control._MSG_TYPE_REQUEST)
                        {
                            control._request(JSON.parse(msgParams))
                        }
                        else if (msgType === control._MSG_TYPE_VIEWABLECHANGE)
                        {
                            control._processViewableChangeMessage(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_STOREADINSTANCESTATE)
                        {
                            control._storeAdInstanceState(msgParams)
                        }
                        else if (msgType === control._MSG_TYPE_ONPOINTERDOWN)
                        {
                            control._firePointerDown(JSON.parse(msgParams))
                        }
                        else if (msgType === control._MSG_TYPE_ONPOINTERUP)
                        {
                            control._firePointerUp()
                        }
                        else if (msgType === control._MSG_TYPE_USECUSTOMCLOSE)
                        {
                            control._setUseCustomClose(JSON.parse(msgParams))
                        }
                        else if (msgType === control._MSG_TYPE_ONMOUSEWHEEL)
                        {
                            control._fireMouseWheel(JSON.parse(msgParams))
                        }
                        else if (msgType === control._MSG_TYPE_ONPOINTERMOVE)
                        {
                            control._firePointerMove(JSON.parse(msgParams))
                        }
                        else if (msgType === control._MSG_TYPE_ONPOINTERHOVER)
                        {
                            control._firePointerHover(JSON.parse(msgParams))
                        }
                        else if (msgType === control._MSG_TYPE_ONMANIPSTATECHANGED)
                        {
                            control._fireManipulationStateChanged(JSON.parse(msgParams))
                        }
                        else
                        {
                            control._reportError("unknown", "unknown action")
                        }
                    }, _reportError: function(action, message)
                    {
                        if (this._errorReportCount < this._MAX_ERROR_REPORT)
                        {
                            this._errorReportCount++;
                            message = this._errorReportCount >= this._MAX_ERROR_REPORT ? this._MAX_ERROR_REPORT_MESSAGE : message;
                            this._sendMessageToAllAdContainers(this._MSG_TYPE_ERROR + ":" + JSON.stringify({
                                action: action, message: message
                            }))
                        }
                    }, _setupEvents: function()
                    {
                        try
                        {
                            window.addEventListener("message", this._receiveMessage);
                            var self = this;
                            this._domElement.onresize = function()
                            {
                                self._onResize()
                            };
                            this._resizeHandler = this._onDocumentResize.bind(this);
                            window.addEventListener("resize", this._resizeHandler);
                            this._domNodeRemovedHandler = function(evt)
                            {
                                if (evt.target === self._domElement)
                                {
                                    self._onRemove()
                                }
                            };
                            this._domElement.addEventListener("DOMNodeRemoved", this._domNodeRemovedHandler);
                            this._networkChangedEventHandler = function(eventArgs)
                            {
                                self._sendMessageToAllAdContainers(self._MSG_TYPE_SETNETWORK + ":" + self._getNetworkState())
                            };
                            this._networkInfo.addEventListener("networkstatuschanged", this._networkChangedEventHandler);
                            if (this._adsGlobalEventManager !== null && typeof(this._adsGlobalEventManager) !== "undefined" && this._adsGlobalEventManager.isInitialized === true)
                            {
                                this._globalAdEngagedHandler = this._adsGlobalEventManager.addEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_ENGAGED, function(engagedAdId)
                                {
                                    if (self.element !== null && typeof(self.element !== "undefined") && self.element.id !== engagedAdId)
                                    {
                                        self.suspend()
                                    }
                                });
                                this._globalAdDisengagedHandler = this._adsGlobalEventManager.addEventListener(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_DISENGAGED, function(disengagedAdId)
                                {
                                    if (self.element !== null && typeof(self.element !== "undefined") && self.element.id !== disengagedAdId)
                                    {
                                        self.resume()
                                    }
                                })
                            }
                        }
                        catch(err) {}
                    }, _setUseCustomClose: function(flag)
                    {
                        var previousCloseBandHeight = this._currentCloseBandHeight;
                        if (flag)
                        {
                            this._currentCloseBandHeight = 0
                        }
                        else
                        {
                            this._currentCloseBandHeight = this._RESERVED_CLOSE_BAND_HEIGHT
                        }
                        if (previousCloseBandHeight !== this._currentCloseBandHeight)
                        {
                            this._setOrmmaScreenSize(this._adIFrame)
                        }
                    }, _disposeAdPlacement: function()
                    {
                        if (this._placement !== null)
                        {
                            this._placement.onadrefreshed = null;
                            this._placement.onerroroccurred = null;
                            this._placement = null
                        }
                    }, _onRemove: function()
                    {
                        this._unscheduleRefresh();
                        this._stopOrientationMonitoring();
                        this._networkInfo.removeEventListener("networkstatuschanged", this._networkChangedEventHandler);
                        this._disposeAdPlacement()
                    }, _onDocumentResize: function()
                    {
                        if (this._adIFrame !== null)
                        {
                            this._setOrmmaScreenSize(this._adIFrame);
                            if (this._ormmaState === this._ORMMA_STATE_EXPANDED)
                            {
                                this._positionExpandedFrame();
                                this._setOrmmaScreenSize(this._expandedIFrame)
                            }
                        }
                    }, _setOrmmaScreenSize: function(iframe)
                    {
                        var screenSize = {
                                height: document.documentElement.offsetHeight - this._currentCloseBandHeight, width: document.documentElement.offsetWidth
                            };
                        if (screenSize.height < 0)
                        {
                            screenSize.height = 0
                        }
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSCREENSIZE + ":" + JSON.stringify(screenSize))
                    }, _onResize: function()
                    {
                        var newWidth = this.element.offsetWidth;
                        var newHeight = this.element.offsetHeight;
                        var currentWidth = this._currentAdWidth;
                        var currentHeight = this._currentAdHeight;
                        if (newWidth !== currentWidth || newHeight !== currentHeight)
                        {
                            if (!this._requestInProgress)
                            {
                                this._unscheduleRefresh();
                                this._refreshInternal()
                            }
                        }
                        else
                        {
                            this._scheduleRefresh()
                        }
                    }, _updateExpandProperties: function(newExpandProps)
                    {
                        try
                        {
                            this._expandProperties = JSON.parse(newExpandProps)
                        }
                        catch(err)
                        {
                            this._reportError(this._MSG_TYPE_SETEXPANDPROPERTIES, "unable to parse expand properties as json");
                            return
                        }
                        if (this._isExpanded && this._expandedIFrame !== null)
                        {
                            var expandedBounds = this._getExpandedBounds();
                            this._expandedIFrame.style.top = expandedBounds.y + "px";
                            this._expandedIFrame.style.left = expandedBounds.x + "px";
                            this._expandedIFrame.width = expandedBounds.width + "px";
                            this._expandedIFrame.height = expandedBounds.height + "px";
                            this._setSize(this._expandedIFrame, expandedBounds.width, expandedBounds.height)
                        }
                    }, _getExpandedBounds: function()
                    {
                        var screenHeight = document.documentElement.offsetHeight;
                        var screenWidth = document.documentElement.offsetWidth;
                        var expandedX = 0;
                        var expandedY = 0;
                        var expandedHeight = screenHeight - this._currentCloseBandHeight;
                        var expandedWidth = screenWidth;
                        if (this._expandProperties)
                        {
                            expandedWidth = this._expandProperties.width !== undefined ? this._expandProperties.width : expandedWidth;
                            expandedHeight = this._expandProperties.height !== undefined ? this._expandProperties.height : expandedHeight;
                            if (expandedHeight > screenHeight - this._currentCloseBandHeight)
                            {
                                expandedWidth = expandedWidth * (screenHeight - this._currentCloseBandHeight) / expandedHeight;
                                expandedHeight = screenHeight - this._currentCloseBandHeight
                            }
                            if (expandedWidth > screenWidth)
                            {
                                expandedHeight = expandedHeight * (screenWidth / expandedWidth);
                                expandedWidth = screenWidth
                            }
                            expandedX = (screenWidth - expandedWidth) / 2;
                            expandedY = (screenHeight - expandedHeight) / 2
                        }
                        return {
                                x: expandedX, y: expandedY, width: expandedWidth, height: expandedHeight
                            }
                    }, _expand: function(url)
                    {
                        if (this._isExpanded || (typeof(window._msAdEngaged) !== "undefined" && window._msAdEngaged))
                        {
                            return
                        }
                        var screenHeight = document.documentElement.offsetHeight;
                        var screenWidth = document.documentElement.offsetWidth;
                        var expandedBounds = this._getExpandedBounds();
                        var expandedAdZIndex = 2147483647 - 10;
                        try
                        {
                            this._overlayDiv = document.createElement("div");
                            this._overlayDiv.style.zIndex = expandedAdZIndex - 1;
                            this._overlayDiv.style.position = "absolute";
                            this._overlayDiv.style.top = "0px";
                            this._overlayDiv.style.left = "0px";
                            this._overlayDiv.style.width = screenWidth + "px";
                            this._overlayDiv.style.height = screenHeight + "px";
                            this._overlayDiv.id = this._domElement.id + "_overlayDiv";
                            this._overlayDiv.style.backgroundColor = "#000000";
                            this._overlayDiv.style.opacity = 0.8;
                            var control = this;
                            this._overlayDiv.onclick = function(evt)
                            {
                                control._closePopup()
                            };
                            document.body.appendChild(this._overlayDiv);
                            this._expandedIFrame = document.createElement("iframe");
                            this._expandedIFrame.id = this._domElement.id + "_expandIframe";
                            this._expandedIFrame.style.top = expandedBounds.y + "px";
                            this._expandedIFrame.style.left = expandedBounds.x + "px";
                            this._expandedIFrame.style.zIndex = expandedAdZIndex;
                            this._expandedIFrame.style.position = "absolute";
                            this._expandedIFrame.width = expandedBounds.width + "px";
                            this._expandedIFrame.height = expandedBounds.height + "px";
                            this._expandedIFrame.marginwidth = "0px";
                            this._expandedIFrame.marginheight = "0px";
                            this._expandedIFrame.frameBorder = "0px";
                            this._expandedIFrame.onblur = function(evt)
                            {
                                try
                                {
                                    evt.currentTarget.focus()
                                }
                                catch(err) {}
                            };
                            document.body.appendChild(this._expandedIFrame)
                        }
                        catch(err)
                        {
                            this._overlayDiv = this._disposeElement(this._overlayDiv);
                            this._expandedIFrame = this._disposeElement(this._expandedIFrame);
                            return
                        }
                        if (typeof(url) === "string" && url.length !== 0)
                        {
                            this._expandedIFrame.src = url;
                            this._expandedIFrame.style.backgroundColor = "#FFFFFF"
                        }
                        else
                        {
                            this._expandedIFrame.src = "ms-appx-web:///MSAdvertisingJS/ads/bootstrap.html";
                            this._sendMessageToAdContainer(this._expandedIFrame, this._MSG_TYPE_SETID + ":" + this._domElement.id);
                            if (this._adInstanceState !== null)
                            {
                                this._sendMessageToAdContainer(this._expandedIFrame, this._MSG_TYPE_SETADINSTANCESTATE + ":" + this._adInstanceState)
                            }
                            this._initializeOrmma(this._expandedIFrame, expandedBounds.width, expandedBounds.height, this._ORMMA_STATE_EXPANDED);
                            this._sendAdDataToAdContainer(this._expandedIFrame, this._rendererContent, this._rendererParams, this._prmParams);
                            try
                            {
                                this._adsGlobalEventManager.broadcastEvent(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_ENGAGED, this.element.id)
                            }
                            catch(err)
                            {
                                this._log("this._adsGlobalEventManager could not be called")
                            }
                        }
                        this._unscheduleRefresh();
                        this._setState(this._ORMMA_STATE_EXPANDED);
                        if (this._adIFrame !== null && typeof(this._adIFrame) === "object")
                        {
                            this._setSize(this._adIFrame, expandedBounds.width, expandedBounds.height)
                        }
                        var engagedBefore = this.isEngaged;
                        this._isExpanded = true;
                        window._msAdEngaged = true;
                        if (engagedBefore !== this.isEngaged)
                        {
                            this._fireEngagedChanged()
                        }
                    }, _disposeElement: function(node)
                    {
                        if (node !== null && typeof(node) === "object")
                        {
                            try
                            {
                                document.body.removeChild(node);
                                return null
                            }
                            catch(err)
                            {
                                this._log("unable to remove node")
                            }
                        }
                        return node
                    }, _closePopup: function()
                    {
                        if (this._overlayDiv !== null && typeof(this._overlayDiv) !== "undefined")
                        {
                            this._removeFromParent(this._overlayDiv);
                            this._overlayDiv = null
                        }
                        if (this._expandedIFrame !== null)
                        {
                            this._expandedIFrame.src = "about:blank";
                            this._removeFromParent(this._expandedIFrame);
                            this._expandedIFrame = null
                        }
                        this._setState(this._previousOrmmaState);
                        this._scheduleRefresh();
                        if (this._adIFrame !== null && typeof(this._adIFrame) === "object")
                        {
                            this._setSize(this._adIFrame, this._adIFrame.width, this._adIFrame.height)
                        }
                        var engagedBefore = this.isEngaged;
                        this._isExpanded = false;
                        window._msAdEngaged = false;
                        if (engagedBefore !== this.isEngaged)
                        {
                            this._fireEngagedChanged()
                        }
                        try
                        {
                            this._adsGlobalEventManager.broadcastEvent(MicrosoftNSJS.Advertising.AdGlobalEventManager.EVENT_TYPE.AD_DISENGAGED, this.element.id)
                        }
                        catch(err)
                        {
                            this._log("this._adsGlobalEventManager could not be called")
                        }
                    }, _positionExpandedFrame: function()
                    {
                        if (this._expandedIFrame === null)
                        {
                            return
                        }
                        var screenWidth = document.documentElement.offsetWidth;
                        var screenHeight = document.documentElement.offsetHeight;
                        if (this._overlayDiv !== null && typeof(this._overlayDiv) !== "undefined")
                        {
                            this._overlayDiv.style.width = screenWidth + "px";
                            this._overlayDiv.style.height = screenHeight + "px"
                        }
                        var expandedX = (screenWidth - this._expandedIFrame.width) / 2;
                        var expandedY = (screenHeight - this._expandedIFrame.height) / 2;
                        this._expandedIFrame.style.left = expandedX + "px";
                        this._expandedIFrame.style.top = expandedY + "px"
                    }, _resize: function(width, height, state)
                    {
                        if (this._adIFrame !== null && typeof(this._adIFrame) !== "undefined")
                        {
                            this._adIFrame.height = height;
                            this._adIFrame.width = width;
                            this._setSize(this._adIFrame, width, height);
                            this._setState(state)
                        }
                    }, _setState: function(state)
                    {
                        this._previousOrmmaState = this._ormmaState;
                        this._ormmaState = state;
                        this._sendMessageToAllAdContainers(this._MSG_TYPE_SETSTATE + ":" + state)
                    }, _setSize: function(iframe, width, height)
                    {
                        this._sendMessageToAdContainer(iframe, this._MSG_TYPE_SETSIZE + ":" + JSON.stringify({
                            height: height, width: width
                        }))
                    }, _processSetUserEngaged: function(msgStr)
                    {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                        {
                            this._log("invalid setUserEngaged message: " + msgStr)
                        }
                        else
                        {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === "engaged")
                            {
                                var engagedBefore = this.isEngaged;
                                this._isUserEngaged = (msgArray[1] === "true");
                                if (this._isAutoRefreshEnabled)
                                {
                                    if (this._isUserEngaged)
                                    {
                                        this._unscheduleRefresh()
                                    }
                                    else
                                    {
                                        this._scheduleRefresh()
                                    }
                                }
                                if (engagedBefore !== this.isEngaged)
                                {
                                    this._fireEngagedChanged()
                                }
                            }
                            else
                            {
                                this._log("invalid setUserEngaged message: " + msgStr)
                            }
                        }
                    }, _processTiltMessage: function(msgStr)
                    {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                        {
                            this._log("invalid tilt message: " + msgStr)
                        }
                        else
                        {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                            {
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                {
                                    this._startTiltAccelerometer()
                                }
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                {
                                    this._stopTiltAccelerometer()
                                }
                                else
                                {
                                    this._log("invalid tilt message: " + msgStr)
                                }
                            }
                            else if (msgArray[0] === this._MSG_TYPE_GETTILT && msgArray[1] === this._MSG_TYPE_REFRESH)
                            {
                                this._getTilt()
                            }
                            else
                            {
                                this._log("invalid tilt message: " + msgStr)
                            }
                        }
                    }, _processShakeMessage: function(msgStr)
                    {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                        {
                            this._log("invalid shake message: " + msgStr)
                        }
                        else
                        {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                            {
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                {
                                    this._startShakeAccelerometer()
                                }
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                {
                                    this._stopShakeAccelerometer()
                                }
                                else
                                {
                                    this._log("invalid shake message: " + msgStr)
                                }
                            }
                            else
                            {
                                this._log("invalid shake message: " + msgStr)
                            }
                        }
                    }, _startTiltAccelerometer: function()
                    {
                        if (this._checkAndCreateAccelerometer())
                        {
                            try
                            {
                                if (typeof(this._accelerometer.tiltHandlers[this._ad.guid]) === "undefined" || this._accelerometer.tiltHandlers[this._ad.guid] === null)
                                {
                                    this._accelerometer.device.addEventListener("readingchanged", this._generateTiltListener())
                                }
                            }
                            catch(err) {}
                        }
                    }, _generateTiltListener: function()
                    {
                        try
                        {
                            var self = this;
                            var handler = function(eventArgs)
                                {
                                    var coords = self._generateCoordsMessage(eventArgs.reading.accelerationX, eventArgs.reading.accelerationY, eventArgs.reading.accelerationZ);
                                    self._sendMessageToAllAdContainers(self._MSG_TYPE_UPDATETILTCOORDS + ":{" + coords + "}")
                                };
                            if (this._accelerometer !== null && typeof(this._accelerometer) !== "undefined")
                            {
                                this._accelerometer.tiltHandlers[self._ad.guid] = handler
                            }
                            return handler
                        }
                        catch(err)
                        {
                            return
                        }
                    }, _generateCoordsMessage: function(x, y, z)
                    {
                        return '"x":"' + x + '","y":"' + y + '","z":"' + z + '"'
                    }, _stopTiltAccelerometer: function()
                    {
                        try
                        {
                            var handler = this._accelerometer.tiltHandlers[this._ad.guid];
                            if (handler !== null && typeof(handler) !== "undefined")
                            {
                                this._accelerometer.device.removeEventListener("readingchanged", handler);
                                this._accelerometer.tiltHandlers[this._ad.guid] = null
                            }
                        }
                        catch(err)
                        {
                            this._log("could not stop the tilt accelerometer")
                        }
                    }, _startShakeAccelerometer: function()
                    {
                        if (this._checkAndCreateAccelerometer())
                        {
                            try
                            {
                                if (typeof(this._accelerometer.shakeHandlers[this._ad.guid]) === "undefined" || this._accelerometer.shakeHandlers[this._ad.guid] === null)
                                {
                                    this._accelerometer.device.addEventListener("shaken", this._generateShakeListener())
                                }
                            }
                            catch(err)
                            {
                                this._log("could not start the shake accelerometer")
                            }
                        }
                    }, _generateShakeListener: function()
                    {
                        var self = this;
                        var handler = function(eventArgs)
                            {
                                self._sendMessageToAllAdContainers(self._MSG_TYPE_FIRESHAKE)
                            };
                        if (this._accelerometer !== null && typeof(this._accelerometer) !== "undefined")
                        {
                            this._accelerometer.shakeHandlers[self._ad.guid] = handler
                        }
                        return handler
                    }, _stopShakeAccelerometer: function()
                    {
                        try
                        {
                            var handler = this._accelerometer.shakeHandlers[this._ad.guid];
                            if (handler !== null && typeof(handler) !== "undefined")
                            {
                                this._accelerometer.device.removeEventListener("shaken", handler);
                                this._accelerometer.shakeHandlers[this._ad.guid] = null
                            }
                        }
                        catch(err)
                        {
                            this._log("could not stop shake accelerometer")
                        }
                    }, _getTilt: function()
                    {
                        if (this._checkAndCreateAccelerometer())
                        {
                            try
                            {
                                var coords = this._lastCoords;
                                var strCoords = this._generateCoordsMessage(coords.x, coords.y, coords.z);
                                this._sendMessageToAllAdContainers(this._MSG_TYPE_UPDATETILTCOORDS + ":{" + strCoords + "}");
                                var reading = this._accelerometer.device.getCurrentReading();
                                this._lastCoords = {
                                    x: reading.accelerationX, y: reading.accelerationY, z: reading.accelerationZ
                                }
                            }
                            catch(err)
                            {
                                this._log("error in getTilt")
                            }
                        }
                    }, _disposeAccelerometer: function()
                    {
                        if (this._accelerometer === null)
                        {
                            return
                        }
                        else if (this._accelerometer.device !== null && typeof(this._accelerometer.device) === "object")
                        {
                            this._stopShakeAccelerometer();
                            this._stopTiltAccelerometer()
                        }
                    }, _checkAndCreateAccelerometer: function()
                    {
                        if (this._accelerometer === null || typeof(this._accelerometer.device) !== "object")
                        {
                            this._accelerometer = {}
                        }
                        try
                        {
                            if (this._accelerometer.device === null || typeof(this._accelerometer.device) !== "object")
                            {
                                this._accelerometer.device = Windows.Devices.Sensors.Accelerometer.getDefault();
                                this._accelerometer.device.reportInterval = this._sensorOptions.accelerometer.reportIntervalMS
                            }
                            if (this._accelerometer.device === null || typeof(this._accelerometer.device) !== "object")
                            {
                                this._log("could not instantiate the accelerometer object, is the sensor online?");
                                return false
                            }
                            return true
                        }
                        catch(err)
                        {
                            return false
                        }
                    }, _processViewableChangeMessage: function(msgStr)
                    {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                        {
                            this._log("invalid viewable change message: " + msgStr)
                        }
                        else
                        {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                            {
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                {
                                    this._startViewableChangeMonitoring()
                                }
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                {
                                    this._stopViewableChangeMonitoring()
                                }
                                else
                                {
                                    this._log("invalid viewable change message: " + msgStr)
                                }
                            }
                            else
                            {
                                this._log("invalid viewably change message: " + msgStr)
                            }
                        }
                    }, _storeAdInstanceState: function(adInstanceState)
                    {
                        this._adInstanceState = adInstanceState;
                        if (this._ormmaState === this._ORMMA_STATE_EXPANDED)
                        {
                            this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_SETADINSTANCESTATE + ":" + this._adInstanceState)
                        }
                    }, _startViewableChangeMonitoring: function()
                    {
                        if (this._viewableChangedTimer === null)
                        {
                            this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_VIEWABLECHANGE + ":" + JSON.stringify({viewable: this._isViewable()}));
                            var self = this;
                            this._viewableChangedTimer = window.setInterval(function()
                            {
                                var onScreen = self._isViewable();
                                if (self._hasViewablility !== onScreen)
                                {
                                    self._hasViewablility = onScreen;
                                    self._sendMessageToAdContainer(self._adIFrame, self._MSG_TYPE_VIEWABLECHANGE + ":" + JSON.stringify({viewable: onScreen}))
                                }
                            }, this._viewableCheckPeriodMs)
                        }
                        this._hasViewablility = this._isViewable();
                        this._sendMessageToAdContainer(this._adIFrame, this._MSG_TYPE_VIEWABLECHANGE + ":" + JSON.stringify({viewable: this._hasViewablility}))
                    }, _stopViewableChangeMonitoring: function()
                    {
                        if (this._viewableChangedTimer !== null && typeof(this._viewableChangedTimer) === "number")
                        {
                            window.clearInterval(this._viewableChangedTimer);
                            this._viewableChangedTimer = null
                        }
                    }, _processGetOrientationMessage: function(msgStr)
                    {
                        if (msgStr === null || msgStr.indexOf("=") === -1)
                        {
                            this._updateOrienation()
                        }
                        else
                        {
                            var msgArray = msgStr.split("=");
                            if (msgArray[0] === this._MSG_TYPE_LISTENER)
                            {
                                if (msgArray[1] === this._MSG_TYPE_VALUESTART)
                                {
                                    this._startOrientationMonitoring()
                                }
                                else if (msgArray[1] === this._MSG_TYPE_VALUESTOP)
                                {
                                    this._stopOrientationMonitoring()
                                }
                                else
                                {
                                    this._log("invalid orientation message: " + msgStr)
                                }
                            }
                            else
                            {
                                this._log("invalid orientation message: " + msgStr)
                            }
                        }
                    }, _updateOrienation: function()
                    {
                        var orientation = -1;
                        try
                        {
                            switch (Windows.Graphics.Display.DisplayProperties.currentOrientation)
                            {
                                case Windows.Graphics.Display.DisplayOrientations.landscape:
                                    orientation = 270;
                                    break;
                                case Windows.Graphics.Display.DisplayOrientations.landscapeFlipped:
                                    orientation = 90;
                                    break;
                                case Windows.Graphics.Display.DisplayOrientations.portraitFlipped:
                                    orientation = 180;
                                    break;
                                case Windows.Graphics.Display.DisplayOrientations.portrait:
                                    orientation = 0;
                                    break;
                                default:
                                    orientation = -1;
                                    break
                            }
                            this._sendMessageToAllAdContainers(this._MSG_TYPE_UPDATEORIENTATION + ":" + JSON.stringify({orientation: orientation}))
                        }
                        catch(err)
                        {
                            control._reportError(control._MSG_TYPE_UPDATEORIENTATION, "Unable to communicate with orientation sensor.")
                        }
                    }, _startOrientationMonitoring: function()
                    {
                        try
                        {
                            if (typeof(this._orientationChangedHandler) !== "function")
                            {
                                var self = this;
                                this._orientationChangedHandler = function(evt)
                                {
                                    self._updateOrienation()
                                };
                                Windows.Graphics.Display.DisplayProperties.addEventListener("orientationchanged", this._orientationChangedHandler)
                            }
                        }
                        catch(err)
                        {
                            control._reportError(control._MSG_TYPE_UPDATEORIENTATION, "Unable to communicate with orientation sensor.")
                        }
                    }, _stopOrientationMonitoring: function()
                    {
                        try
                        {
                            if (typeof(this._orientationChangedHandler) === "function")
                            {
                                Windows.Graphics.Display.DisplayProperties.removeEventListener("orientationchanged", this._orientationChangedHandler);
                                this._orientationChangedHandler = null
                            }
                        }
                        catch(err)
                        {
                            control._reportError(control._MSG_TYPE_UPDATEORIENTATION, "Unable to communicate with orientation sensor.")
                        }
                    }, _scheduleRefresh: function()
                    {
                        if (this._isAutoRefreshEnabled && this._refreshTimerId === null)
                        {
                            var self = this;
                            this._refreshTimerId = setTimeout(function()
                            {
                                self._refreshTimerId = null;
                                self._refreshInternal()
                            }, this._refreshPeriodSeconds * 1000)
                        }
                    }, _unscheduleRefresh: function()
                    {
                        if (this._refreshTimerId !== null)
                        {
                            clearTimeout(this._refreshTimerId);
                            this._refreshTimerId = null
                        }
                    }, _request: function(data)
                    {
                        if (this._getNetworkState() === this._ORMMA_NETWORK_OFFLINE)
                        {
                            this._reportError(this._MSG_TYPE_REQUEST, "http request error, network offline");
                            return
                        }
                        try
                        {
                            var self = this;
                            var req = new XMLHttpRequest;
                            if (data.display.toLowerCase() !== this._ORMMA_RESPONSE_IGNORE)
                            {
                                req.onreadystatechange = function()
                                {
                                    if (this.readyState === XMLHttpRequest.DONE)
                                    {
                                        if (this.status === 200)
                                        {
                                            var responseJSON = {
                                                    url: escape(data.url), response: escape(this.responseText)
                                                };
                                            self._sendMessageToAdContainer(self._adIFrame, "ormmaResponse:" + JSON.stringify(responseJSON))
                                        }
                                        else
                                        {
                                            self._reportError(self._MSG_TYPE_REQUEST, "error on request to url: " + data.url + ": code " + req.status)
                                        }
                                    }
                                }
                            }
                            req.open("GET", data.url, true);
                            req.setRequestHeader(this._HTTP_HEADER_CACHE_CONTROL, this._HTTP_HEADER_VALUE_CACHE_CONTROL_NO_CACHE);
                            req.timeout = 10000;
                            req.send(null)
                        }
                        catch(e)
                        {
                            this._reportError(this._MSG_TYPE_REQUEST, "http request error: " + e.message)
                        }
                    }, _validateParameters: function()
                    {
                        if (this._applicationId === null || this._applicationId === "" || this._adUnitId === null || this._adUnitId === "")
                        {
                            this._fireErrorOccurred("ad control requires applicationId and adUnitId properties to be set", this._ERROR_ENUM.ClientConfiguration);
                            return false
                        }
                        if (typeof(this.latitude) !== "undefined" && !this._validateNumber("latitude", this.latitude))
                        {
                            return false
                        }
                        if (typeof(this.longitude) !== "undefined" && !this._validateNumber("longitude", this.longitude))
                        {
                            return false
                        }
                        return true
                    }, _validateNumber: function(fieldName, value)
                    {
                        if (typeof(value) === "number")
                        {
                            if (isNaN(value))
                            {
                                this._fireErrorOccurred(fieldName + " value is not a valid number (NaN)", this._ERROR_ENUM.ClientConfiguration);
                                return false
                            }
                        }
                        else
                        {
                            this._fireErrorOccurred(fieldName + " value is not a valid type: " + typeof(value), this._ERROR_ENUM.ClientConfiguration);
                            return false
                        }
                        return true
                    }, _getUri: function(data)
                    {
                        if (data !== null && typeof(data) === "object" && typeof(data.url) === "string" && data.url.length <= this._MAX_URL_LENGTH)
                        {
                            try
                            {
                                var uri = new Windows.Foundation.Uri(data.url);
                                if (uri.schemeName === "http" || uri.schemeName === "https" || uri.schemeName === "ms-windows-store" || uri.schemeName === "skype" || uri.schemeName === "microsoftmusic" || uri.schemeName === "xboxsmartglass" || uri.schemeName === "xboxgames" || uri.schemeName === "microsoftvideo" || uri.schemeName === "bingtravel" || uri.schemeName === "bingweather" || uri.schemeName === "bingmaps" || uri.schemeName === "bingfinance" || uri.schemeName === "bingsports" || uri.schemeName === "bingnews")
                                {
                                    return uri
                                }
                            }
                            catch(err) {}
                        }
                        return null
                    }, _getNetworkState: function()
                    {
                        var wifiThreshold = 1024000;
                        try
                        {
                            var connProfile = this._networkInfo.getInternetConnectionProfile();
                            if (!connProfile || connProfile.getNetworkConnectivityLevel() === Windows.Networking.Connectivity.NetworkConnectivityLevel.none)
                            {
                                return this._ORMMA_NETWORK_OFFLINE
                            }
                            else
                            {
                                var interfaceType = connProfile.networkAdapter.ianaInterfaceType;
                                if (interfaceType === 6 || interfaceType === 71)
                                {
                                    return this._ORMMA_NETWORK_WIFI
                                }
                                else
                                {
                                    return this._ORMMA_NETWORK_CELL
                                }
                            }
                        }
                        catch(err)
                        {
                            this._log("error getting network state: " + (err !== null && typeof(err) === "object" ? err.message : "???"))
                        }
                        return this._ORMMA_NETWORK_UNKNOWN
                    }, _isElementAllowed: function(element)
                    {
                        if (element !== null && typeof(element) === "object" && typeof(element.tagName) === "string")
                        {
                            var tagName = element.tagName.toLowerCase();
                            if (tagName === "button" || tagName === "menu" || tagName === "ol" || tagName === "textarea" || tagName === "ul" || tagName === "canvas" || tagName === "embed" || tagName === "html" || tagName === "iframe" || tagName === "img" || tagName === "input" || tagName === "select" || tagName === "video" || tagName === "a")
                            {
                                return false
                            }
                            return true
                        }
                        return false
                    }
            })
    })
})(WinJS);
/*!
  Copyright (C) Microsoft. All rights reserved.
  This library is supported for use in Windows Store apps only.
*/
(function(WinJS)
{
    "use strict";
    var AdSettingsControl = WinJS.Class.define(function(settings)
        {
            if (!this._isNullOrUndefined(window))
            {
                if (this._isNullOrUndefined(window._msAdsAdSettingsControl) || window._msAdsAdSettingsControl.isInitialized !== true)
                {
                    if (!this._isNullOrUndefined(window._msAdsAdSettingsControl) && window._msAdsAdSettingsControl._objectName !== MicrosoftNSJS.Advertising.AdSettingsControl.OBJECT_NAME)
                    {
                        this._logError("window._msAdsAdSettingsControl already exists but is not of correct object type [{0}]. Overwriting.", MicrosoftNSJS.Advertising.AdSettingsControl.OBJECT_NAME)
                    }
                    else if (!this._isNullOrUndefined(window._msAdsAdSettingsControl) && window._msAdsAdSettingsControl.isInitialized === false)
                    {
                        this._logError("warning: window._msAdsAdSettingsControl already exists but is not initialized yet (are all promises complete?). Try again later or dispose and re-create.");
                        return window._msAdsAdSettingsControl
                    }
                    try
                    {
                        this._objectName = MicrosoftNSJS.Advertising.AdSettingsControl.OBJECT_NAME;
                        this._isInitialized = false;
                        window._msAdsAdSettingsControl = this;
                        this._initialize(settings);
                        MicrosoftAdvertising.Shared.WinRT.UserInfoProvider.initialize().then(function()
                        {
                            this._isInitialized = true;
                            this._addSettingsFlyout()
                        }.bind(this), function(err)
                        {
                            this._logError("could not initialize UserInfoProvider. Error:", err);
                            this._dispose()
                        }.bind(this))
                    }
                    catch(err)
                    {
                        this._dispose();
                        this._logError("could not initialize AdSettingsControl error: {0}", err)
                    }
                }
                return window._msAdsAdSettingsControl
            }
        }, {
            _flyoutHtmlTemplateURI: "", _resourceLoader: null, _userInfoProvider: null, _targetingOptInState: null, _eventHandlers: {
                    optToggle_Toggled: null, signInLink_Clicked: null, settingsFlyout_Activated: null
                }, isInitialized: {get: function()
                    {
                        return this._isInitialized
                    }}, dispose: function()
                {
                    try
                    {
                        this._dispose()
                    }
                    catch(err)
                    {
                        try
                        {
                            this._logError("Could not dispose, exception thrown [{0}].", err)
                        }
                        catch(err) {}
                    }
                }, _initialize: function(settings)
                {
                    if (!this._isNullOrUndefined(settings))
                    {
                        if (!this._isNullOrUndefined(settings.flyoutHtmlTemplateURI))
                        {
                            this._flyoutHtmlTemplateURI = settings.flyoutHtmlTemplateURI
                        }
                        if (!this._isNullOrUndefined(settings.resourceLoaderURI))
                        {
                            try
                            {
                                this._resourceLoader = Windows.ApplicationModel.Resources.ResourceLoader(settings.resourceLoaderURI)
                            }
                            catch(err)
                            {
                                this._logError("Could not initialize, error: [{0}].", err)
                            }
                        }
                    }
                    this._userInfoProvider = MicrosoftAdvertising.Shared.WinRT.UserInfoProvider;
                    this._targetingOptInState = MicrosoftAdvertising.Shared.WinRT.TargetingOptInState;
                    this._createSettingsFlyoutEvent()
                }, _addSettingsFlyout: function()
                {
                    WinJS.Application.addEventListener("settings", this._eventHandlers.settingsFlyout_Activated)
                }, _createSettingsFlyoutEvent: function()
                {
                    this._eventHandlers.settingsFlyout_Activated = function(e)
                    {
                        try
                        {
                            var msaAdSettings = {
                                    name: "msaAdSettings", title: this._resourceLoader.getString("AdSettings_CommandText"), href: this._flyoutHtmlTemplateURI
                                };
                            var appSettings = Windows.UI.ApplicationSettings;
                            var command = new appSettings.SettingsCommand(msaAdSettings.name, msaAdSettings.title, function()
                                {
                                    WinJS.UI.SettingsFlyout.showSettings(msaAdSettings.name, msaAdSettings.href)
                                });
                            e.detail.e.request.applicationCommands.append(command);
                            this._wirePanelScript()
                        }
                        catch(err)
                        {
                            this._logError("could not add settings flyout html in WinJS.Application.onsettings handler")
                        }
                    }.bind(this)
                }, _wirePanelScript: function()
                {
                    this._createPageEvents();
                    var page = WinJS.UI.Pages.define(this._flyoutHtmlTemplateURI, {
                            ready: function(element, options)
                            {
                                document.getElementById("optToggle").winControl.addEventListener("change", this._eventHandlers.optToggle_Toggled);
                                document.getElementById("signInLink").addEventListener("click", this._eventHandlers.signInLink_Clicked);
                                this._updateResourceStrings();
                                this._toggleProgress(true);
                                this._userInfoProvider.getGlobalTargetingOptInStateAsync().then(function(state)
                                {
                                    this._updateUI(state)
                                }.bind(this), function(err)
                                {
                                    this._showUnknownState()
                                }.bind(this))
                            }.bind(this), unload: function()
                                {
                                    document.getElementById("optToggle").winControl.removeEventListener("change", this._eventHandlers.optToggle_Toggled);
                                    document.getElementById("signInLink").removeEventListener("click", this._eventHandlers.signInLink_Clicked)
                                }.bind(this)
                        })
                }, _createPageEvents: function()
                {
                    this._eventHandlers.optToggle_Toggled = function(eventInfo)
                    {
                        try
                        {
                            this._userInfoProvider.setLocalTargetingOptInStateAsync(eventInfo.target.winControl.checked)
                        }
                        catch(err)
                        {
                            var toggle = document.getElementById("optToggle");
                            toggle.winControl.checked = !toggle.winControl.checked
                        }
                    }.bind(this);
                    this._eventHandlers.signInLink_Clicked = function(eventInfo)
                    {
                        this._userInfoProvider.requestUserSignInAsync()
                    }.bind(this)
                }, _updateResourceStrings: function()
                {
                    this._updateElementText("mainLabel", "AdSettings_Flyout_Title", this._resourceLoader);
                    this._updateElementText("heading1Label", "AdSettings_Flyout_SectionName", this._resourceLoader);
                    this._updateElementText("signInPrompt1", "AdSettings_Flyout_SignInPrompt1", this._resourceLoader);
                    this._updateElementText("signInLink", "AdSettings_Flyout_SignInPrompt_SignIn", this._resourceLoader);
                    this._updateElementText("signInPrompt2", "AdSettings_Flyout_SignInPrompt2", this._resourceLoader);
                    this._updateElementText("optedOutPrompt1", "AdSettings_Flyout_OptedOut_Message1", this._resourceLoader);
                    this._updateElementText("optOutMoreInfoLink", "AdSettings_Flyout_OptedOut_Message_Here", this._resourceLoader);
                    this._updateElementText("optedOutPrompt2", "AdSettings_Flyout_OptedOut_Message2", this._resourceLoader);
                    this._updateElementText("statusUnknownPrompt", "AdSettings_Flyout_StatusUnknown_Message", this._resourceLoader);
                    var optToggle = document.getElementById("optToggle").winControl;
                    optToggle.title = this._resourceLoader.getString("AdSettings_Flyout_OptInSwitch_Header");
                    optToggle.labelOff = this._resourceLoader.getString("AdSettings_Flyout_OptInSwitch_Off");
                    optToggle.labelOn = this._resourceLoader.getString("AdSettings_Flyout_OptInSwitch_On");
                    this._updateElementText("privacyStatementLink", "AdSettings_Flyout_Privacy", this._resourceLoader)
                }, _updateElementText: function(elementId, resId, resource)
                {
                    try
                    {
                        document.getElementById(elementId).innerText = resource.getString(resId)
                    }
                    catch(err) {}
                }, _updateUI: function(globalOptInState)
                {
                    this._toggleProgress();
                    var toggle = document.getElementById("optToggle");
                    if (globalOptInState === this._targetingOptInState.optedIn)
                    {
                        document.getElementById("optedOutPrompt").style.display = "none";
                        document.getElementById("signInPrompt").style.display = "none";
                        document.getElementById("statusUnknownPrompt").style.display = "none";
                        this._userInfoProvider.getLocalTargetingOptInStateAsync().then(function(state)
                        {
                            if (state !== this._targetingOptInState.optedOut)
                                toggle.winControl.checked = true;
                            else
                                toggle.winControl.checked = false;
                            toggle.winControl.disabled = false;
                            toggle.style.display = "block"
                        }.bind(this))
                    }
                    else if (globalOptInState === this._targetingOptInState.userNotSignedIn)
                    {
                        document.getElementById("optedOutPrompt").style.display = "none";
                        document.getElementById("signInPrompt").style.display = "block";
                        document.getElementById("statusUnknownPrompt").style.display = "none";
                        toggle.winControl.disabled = true;
                        toggle.winControl.checked = false;
                        toggle.style.display = "block"
                    }
                    else if (globalOptInState === this._targetingOptInState.optedOut)
                    {
                        document.getElementById("optedOutPrompt").style.display = "block";
                        document.getElementById("signInPrompt").style.display = "none";
                        document.getElementById("statusUnknownPrompt").style.display = "none";
                        toggle.winControl.disabled = true;
                        toggle.winControl.checked = false;
                        toggle.style.display = "block"
                    }
                    else if (globalOptInState === this._targetingOptInState.unknown)
                    {
                        this._showUnknownState()
                    }
                    else
                    {
                        this._showUnknownState()
                    }
                }, _showUnknownState: function()
                {
                    var toggle = document.getElementById("optToggle");
                    document.getElementById("optedOutPrompt").style.display = "none";
                    document.getElementById("signInPrompt").style.display = "none";
                    document.getElementById("statusUnknownPrompt").style.display = "block";
                    toggle.winControl.disabled = true;
                    toggle.winControl.checked = false;
                    toggle.style.display = "block"
                }, _toggleProgress: function(show)
                {
                    if (show)
                        document.getElementById("progressRing").style.display = "block";
                    else
                        document.getElementById("progressRing").style.display = "none"
                }, _dispose: function()
                {
                    WinJS.Application.removeEventListener("settings", this._eventHandlers.settingsFlyout_Activated);
                    this._isInitialized = false;
                    window._msAdsAdSettingsControl = null
                }, _isNullOrUndefined: function(object)
                {
                    if (typeof(object) === "undefined" || object === null)
                    {
                        return true
                    }
                    return false
                }, _logError: function(message, err){}
        }, {OBJECT_NAME: "MicrosoftNSJS.Advertising.AdSettingsControl"});
    WinJS.Namespace.define("MicrosoftNSJS.Advertising", {AdSettingsControl: AdSettingsControl})
})(WinJS);
// SIG // Begin signature block
// SIG // MIIamQYJKoZIhvcNAQcCoIIaijCCGoYCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFDkmPyeKIpRc
// SIG // wCbYpcS/fjcWTvy9oIIVgjCCBMMwggOroAMCAQICEzMA
// SIG // AAAz5SeGow5KKoAAAAAAADMwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTEzMDMyNzIw
// SIG // MDgyM1oXDTE0MDYyNzIwMDgyM1owgbMxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjpGNTI4LTM3NzctOEE3NjEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAMreyhkPH5ZWgl/YQjLUCG22ncDC7Xw4q1gzrWuB
// SIG // ULiIIQpdr5ctkFrHwy6yTNRjdFj938WJVNALzP2chBF5
// SIG // rKMhIm0z4K7eJUBFkk4NYwgrizfdTwdq3CrPEFqPV12d
// SIG // PfoXYwLGcD67Iu1bsfcyuuRxvHn/+MvpVz90e+byfXxX
// SIG // WC+s0g6o2YjZQB86IkHiCSYCoMzlJc6MZ4PfRviFTcPa
// SIG // Zh7Hc347tHYXpqWgoHRVqOVgGEFiOMdlRqsEFmZW6vmm
// SIG // y0LPXVRkL4H4zzgADxBr4YMujT5I7ElWSuyaafTLDxD7
// SIG // BzRKYmwBjW7HIITKXNFjmR6OXewPpRZIqmveIS8CAwEA
// SIG // AaOCAQkwggEFMB0GA1UdDgQWBBQAWBs+7cXxBpO+MT02
// SIG // tKwLXTLwgTAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA0GCSqGSIb3DQEBBQUAA4IBAQAC/+OMA+rv
// SIG // fji5uXyfO1KDpPojONQDuGpZtergb4gD9G9RapU6dYXo
// SIG // HNwHxU6dG6jOJEcUJE81d7GcvCd7j11P/AaLl5f5KZv3
// SIG // QB1SgY52SAN+8psXt67ZWyKRYzsyXzX7xpE8zO8OmYA+
// SIG // BpE4E3oMTL4z27/trUHGfBskfBPcCvxLiiAFHQmJkTkH
// SIG // TiFO3mx8cLur8SCO+Jh4YNyLlM9lvpaQD6CchO1ctXxB
// SIG // oGEtvUNnZRoqgtSniln3MuOj58WNsiK7kijYsIxTj2hH
// SIG // R6HYAbDxYRXEF6Et4zpsT2+vPe7eKbBEy8OSZ7oAzg+O
// SIG // Ee/RAoIxSZSYnVFIeK0d1kC2MIIE7DCCA9SgAwIBAgIT
// SIG // MwAAALARrwqL0Duf3QABAAAAsDANBgkqhkiG9w0BAQUF
// SIG // ADB5MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpN
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQTAeFw0xMzAx
// SIG // MjQyMjMzMzlaFw0xNDA0MjQyMjMzMzlaMIGDMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMR4wHAYD
// SIG // VQQDExVNaWNyb3NvZnQgQ29ycG9yYXRpb24wggEiMA0G
// SIG // CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDor1yiIA34
// SIG // KHy8BXt/re7rdqwoUz8620B9s44z5lc/pVEVNFSlz7SL
// SIG // qT+oN+EtUO01Fk7vTXrbE3aIsCzwWVyp6+HXKXXkG4Un
// SIG // m/P4LZ5BNisLQPu+O7q5XHWTFlJLyjPFN7Dz636o9UEV
// SIG // XAhlHSE38Cy6IgsQsRCddyKFhHxPuRuQsPWj/ov0DJpO
// SIG // oPXJCiHiquMBNkf9L4JqgQP1qTXclFed+0vUDoLbOI8S
// SIG // /uPWenSIZOFixCUuKq6dGB8OHrbCryS0DlC83hyTXEmm
// SIG // ebW22875cHsoAYS4KinPv6kFBeHgD3FN/a1cI4Mp68fF
// SIG // SsjoJ4TTfsZDC5UABbFPZXHFAgMBAAGjggFgMIIBXDAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUWXGm
// SIG // WjNN2pgHgP+EHr6H+XIyQfIwUQYDVR0RBEowSKRGMEQx
// SIG // DTALBgNVBAsTBE1PUFIxMzAxBgNVBAUTKjMxNTk1KzRm
// SIG // YWYwYjcxLWFkMzctNGFhMy1hNjcxLTc2YmMwNTIzNDRh
// SIG // ZDAfBgNVHSMEGDAWgBTLEejK0rQWWAHJNy4zFha5TJoK
// SIG // HzBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWND
// SIG // b2RTaWdQQ0FfMDgtMzEtMjAxMC5jcmwwWgYIKwYBBQUH
// SIG // AQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY0NvZFNpZ1BD
// SIG // QV8wOC0zMS0yMDEwLmNydDANBgkqhkiG9w0BAQUFAAOC
// SIG // AQEAMdduKhJXM4HVncbr+TrURE0Inu5e32pbt3nPApy8
// SIG // dmiekKGcC8N/oozxTbqVOfsN4OGb9F0kDxuNiBU6fNut
// SIG // zrPJbLo5LEV9JBFUJjANDf9H6gMH5eRmXSx7nR2pEPoc
// SIG // sHTyT2lrnqkkhNrtlqDfc6TvahqsS2Ke8XzAFH9IzU2y
// SIG // RPnwPJNtQtjofOYXoJtoaAko+QKX7xEDumdSrcHps3Om
// SIG // 0mPNSuI+5PNO/f+h4LsCEztdIN5VP6OukEAxOHUoXgSp
// SIG // Rm3m9Xp5QL0fzehF1a7iXT71dcfmZmNgzNWahIeNJDD3
// SIG // 7zTQYx2xQmdKDku/Og7vtpU6pzjkJZIIpohmgjCCBbww
// SIG // ggOkoAMCAQICCmEzJhoAAAAAADEwDQYJKoZIhvcNAQEF
// SIG // BQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZMBcGCgmS
// SIG // JomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UEAxMkTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // MB4XDTEwMDgzMTIyMTkzMloXDTIwMDgzMTIyMjkzMlow
// SIG // eTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWlj
// SIG // cm9zb2Z0IENvZGUgU2lnbmluZyBQQ0EwggEiMA0GCSqG
// SIG // SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCycllcGTBkvx2a
// SIG // YCAgQpl2U2w+G9ZvzMvx6mv+lxYQ4N86dIMaty+gMuz/
// SIG // 3sJCTiPVcgDbNVcKicquIEn08GisTUuNpb15S3GbRwfa
// SIG // /SXfnXWIz6pzRH/XgdvzvfI2pMlcRdyvrT3gKGiXGqel
// SIG // cnNW8ReU5P01lHKg1nZfHndFg4U4FtBzWwW6Z1KNpbJp
// SIG // L9oZC/6SdCnidi9U3RQwWfjSjWL9y8lfRjFQuScT5EAw
// SIG // z3IpECgixzdOPaAyPZDNoTgGhVxOVoIoKgUyt0vXT2Pn
// SIG // 0i1i8UU956wIAPZGoZ7RW4wmU+h6qkryRs83PDietHdc
// SIG // pReejcsRj1Y8wawJXwPTAgMBAAGjggFeMIIBWjAPBgNV
// SIG // HRMBAf8EBTADAQH/MB0GA1UdDgQWBBTLEejK0rQWWAHJ
// SIG // Ny4zFha5TJoKHzALBgNVHQ8EBAMCAYYwEgYJKwYBBAGC
// SIG // NxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQU/dExTtMm
// SIG // ipXhmGA7qDFvpjy82C0wGQYJKwYBBAGCNxQCBAweCgBT
// SIG // AHUAYgBDAEEwHwYDVR0jBBgwFoAUDqyCYEBWJ5flJRP8
// SIG // KuEKU5VZ5KQwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwDQYJKoZIhvcNAQEFBQADggIBAFk5
// SIG // Pn8mRq/rb0CxMrVq6w4vbqhJ9+tfde1MOy3XQ60L/svp
// SIG // LTGjI8x8UJiAIV2sPS9MuqKoVpzjcLu4tPh5tUly9z7q
// SIG // QX/K4QwXaculnCAt+gtQxFbNLeNK0rxw56gNogOlVuC4
// SIG // iktX8pVCnPHz7+7jhh80PLhWmvBTI4UqpIIck+KUBx3y
// SIG // 4k74jKHK6BOlkU7IG9KPcpUqcW2bGvgc8FPWZ8wi/1wd
// SIG // zaKMvSeyeWNWRKJRzfnpo1hW3ZsCRUQvX/TartSCMm78
// SIG // pJUT5Otp56miLL7IKxAOZY6Z2/Wi+hImCWU4lPF6H0q7
// SIG // 0eFW6NB4lhhcyTUWX92THUmOLb6tNEQc7hAVGgBd3TVb
// SIG // Ic6YxwnuhQ6MT20OE049fClInHLR82zKwexwo1eSV32U
// SIG // jaAbSANa98+jZwp0pTbtLS8XyOZyNxL0b7E8Z4L5UrKN
// SIG // MxZlHg6K3RDeZPRvzkbU0xfpecQEtNP7LN8fip6sCvsT
// SIG // J0Ct5PnhqX9GuwdgR2VgQE6wQuxO7bN2edgKNAltHIAx
// SIG // H+IOVN3lofvlRxCtZJj/UBYufL8FIXrilUEnacOTj5XJ
// SIG // jdibIa4NXJzwoq6GaIMMai27dmsAHZat8hZ79haDJLmI
// SIG // z2qoRzEvmtzjcT3XAH5iR9HOiMm4GPoOco3Boz2vAkBq
// SIG // /2mbluIQqBC0N1AI1sM9MIIGBzCCA++gAwIBAgIKYRZo
// SIG // NAAAAAAAHDANBgkqhkiG9w0BAQUFADBfMRMwEQYKCZIm
// SIG // iZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWlj
// SIG // cm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBD
// SIG // ZXJ0aWZpY2F0ZSBBdXRob3JpdHkwHhcNMDcwNDAzMTI1
// SIG // MzA5WhcNMjEwNDAzMTMwMzA5WjB3MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSEwHwYDVQQDExhNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQCfoWyx39tIkip8ay4Z4b3i48WZUSNQrc7d
// SIG // GE4kD+7Rp9FMrXQwIBHrB9VUlRVJlBtCkq6YXDAm2gBr
// SIG // 6Hu97IkHD/cOBJjwicwfyzMkh53y9GccLPx754gd6udO
// SIG // o6HBI1PKjfpFzwnQXq/QsEIEovmmbJNn1yjcRlOwhtDl
// SIG // KEYuJ6yGT1VSDOQDLPtqkJAwbofzWTCd+n7Wl7PoIZd+
// SIG // +NIT8wi3U21StEWQn0gASkdmEScpZqiX5NMGgUqi+YSn
// SIG // EUcUCYKfhO1VeP4Bmh1QCIUAEDBG7bfeI0a7xC1Un68e
// SIG // eEExd8yb3zuDk6FhArUdDbH895uyAc4iS1T/+QXDwiAL
// SIG // AgMBAAGjggGrMIIBpzAPBgNVHRMBAf8EBTADAQH/MB0G
// SIG // A1UdDgQWBBQjNPjZUkZwCu1A+3b7syuwwzWzDzALBgNV
// SIG // HQ8EBAMCAYYwEAYJKwYBBAGCNxUBBAMCAQAwgZgGA1Ud
// SIG // IwSBkDCBjYAUDqyCYEBWJ5flJRP8KuEKU5VZ5KShY6Rh
// SIG // MF8xEzARBgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJ
// SIG // k/IsZAEZFgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jv
// SIG // c29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eYIQ
// SIG // ea0WoUqgpa1Mc1j0BxMuZTBQBgNVHR8ESTBHMEWgQ6BB
// SIG // hj9odHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9taWNyb3NvZnRyb290Y2VydC5jcmww
// SIG // VAYIKwYBBQUHAQEESDBGMEQGCCsGAQUFBzAChjhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01p
// SIG // Y3Jvc29mdFJvb3RDZXJ0LmNydDATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDCDANBgkqhkiG9w0BAQUFAAOCAgEAEJeKw1wD
// SIG // RDbd6bStd9vOeVFNAbEudHFbbQwTq86+e4+4LtQSooxt
// SIG // YrhXAstOIBNQmd16QOJXu69YmhzhHQGGrLt48ovQ7DsB
// SIG // 7uK+jwoFyI1I4vBTFd1Pq5Lk541q1YDB5pTyBi+FA+mR
// SIG // KiQicPv2/OR4mS4N9wficLwYTp2OawpylbihOZxnLcVR
// SIG // DupiXD8WmIsgP+IHGjL5zDFKdjE9K3ILyOpwPf+FChPf
// SIG // wgphjvDXuBfrTot/xTUrXqO/67x9C0J71FNyIe4wyrt4
// SIG // ZVxbARcKFA7S2hSY9Ty5ZlizLS/n+YWGzFFW6J1wlGys
// SIG // OUzU9nm/qhh6YinvopspNAZ3GmLJPR5tH4LwC8csu89D
// SIG // s+X57H2146SodDW4TsVxIxImdgs8UoxxWkZDFLyzs7BN
// SIG // Z8ifQv+AeSGAnhUwZuhCEl4ayJ4iIdBD6Svpu/RIzCzU
// SIG // 2DKATCYqSCRfWupW76bemZ3KOm+9gSd0BhHudiG/m4LB
// SIG // J1S2sWo9iaF2YbRuoROmv6pH8BJv/YoybLL+31HIjCPJ
// SIG // Zr2dHYcSZAI9La9Zj7jkIeW1sMpjtHhUBdRBLlCslLCl
// SIG // eKuzoJZ1GtmShxN1Ii8yqAhuoFuMJb+g74TKIdbrHk/J
// SIG // mu5J4PcBZW+JC33Iacjmbuqnl84xKf8OxVtc2E0bodj6
// SIG // L54/LlUWa8kTo/0xggSDMIIEfwIBATCBkDB5MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNyb3NvZnQg
// SIG // Q29kZSBTaWduaW5nIFBDQQITMwAAALARrwqL0Duf3QAB
// SIG // AAAAsDAJBgUrDgMCGgUAoIGcMBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBQKP8OnNUVa
// SIG // Dl1325HzXU6COhDEGzA8BgorBgEEAYI3AgEMMS4wLKAM
// SIG // gAoAYQBkAC4AagBzoRyAGmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS8gMA0GCSqGSIb3DQEBAQUABIIBAFQHxr2x
// SIG // Ev7wpNgzjwjjOD5+5nHoeNe+u2V4m1pdnYre6wdBEP/C
// SIG // fxPmBcXZDAiV0Iyr6WrDOPlyt/kgcw98W1vltB9ZAkXC
// SIG // zMOaK8aaP6l2qN8J2qdHMDYEyZHIKpYC7opWfk9Kx/wL
// SIG // 6PptfBxLzy1gMw2L0mr3f3ToID/z5Vm7TnMFQsmE4dTM
// SIG // nm7Z0+XfyZHn2V92cV0Fuvu5UWlcFTEsBr018mWQhJOB
// SIG // CzLx0S0dcIPn1nqgtoIpEDtO2qQMD/9AkqKifCG6aG05
// SIG // HClXyvaOcSgGazPpu5TP8Jl+F+oCJYgk3LKWHvkTcmH3
// SIG // fvfz7NTWw3byeHUmEOBN/4+vTdqhggIoMIICJAYJKoZI
// SIG // hvcNAQkGMYICFTCCAhECAQEwgY4wdzELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBAhMzAAAAM+UnhqMOSiqAAAAAAAAzMAkG
// SIG // BSsOAwIaBQCgXTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcN
// SIG // AQcBMBwGCSqGSIb3DQEJBTEPFw0xMzA2MjkxOTQ5NTRa
// SIG // MCMGCSqGSIb3DQEJBDEWBBRqKoVh/HNlLR4ofc5KT1hK
// SIG // 8614TjANBgkqhkiG9w0BAQUFAASCAQApwc/jbZnjObPJ
// SIG // s4bOLCWiIArRKtnzyksOB9xWW0rINVPv9QZ6eEuFuvnA
// SIG // TXax2XBIm8hQCLxPiH429/rGg1A5quGD0f2XGUxZE4Gp
// SIG // hSPWDQKOvhtSw7rvJNT7LSYOoHQltpj3jJhnSYNbaj+D
// SIG // IRGgh3pEMxQK2AQvMQrK2fAbVMq1k0hmc+6sdWm4GtFO
// SIG // JA5nBBgA7gHwV4jheAHRiybdRpu/MTAYt/V/Ec5zVl95
// SIG // 9g/TfT+WamoVMp33iAlscGbCwzjiNBEp0YN3BYAFvHqR
// SIG // JoLVWbIuVvrV7rmWOhTy+bw021JRPG8cLWWEKxnOgc+M
// SIG // SrDpe6ADroRPiGAU9WCT
// SIG // End signature block
