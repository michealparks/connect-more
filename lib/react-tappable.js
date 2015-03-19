(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tappable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

// Enable React Touch Events
React.initializeTouchEvents(true);

function getTouchProps(touch) {
  if (!touch) return {};
  return {
    pageX: touch.pageX,
    pageY: touch.pageY,
    clientX: touch.clientX,
    clientY: touch.clientY
  };
}

function isDataOrAriaProp(key) {
  return key.indexOf("data-") === 0 || key.indexOf("aria-") === 0;
}

var extend = require('react/lib/Object.assign');

/**
 * Tappable Mixin
 * ==============
 */

 var Mixin = {

  propTypes: {
    moveThreshold: React.PropTypes.number,       // pixels to move before cancelling tap
    pressDelay: React.PropTypes.number,          // ms to wait before detecting a press
    pressMoveThreshold: React.PropTypes.number,  // pixels to move before cancelling press
    preventDefault: React.PropTypes.bool,        // whether to preventDefault on all events
    stopPropagation: React.PropTypes.bool,       // whether to stopPropagation on all events

    onTap: React.PropTypes.func,                 // fires when a tap is detected
    onPress: React.PropTypes.func,               // fires when a press is detected
    onTouchStart: React.PropTypes.func,          // pass-through touch event
    onTouchMove: React.PropTypes.func,           // pass-through touch event
    onTouchEnd: React.PropTypes.func,            // pass-through touch event
    onMouseDown: React.PropTypes.func,           // pass-through mouse event
    onMouseUp: React.PropTypes.func,             // pass-through mouse event
    onMouseMove: React.PropTypes.func,           // pass-through mouse event
    onMouseOut: React.PropTypes.func             // pass-through mouse event
  },

  getDefaultProps: function() {
    return {
      moveThreshold: 100,
      pressDelay: 1000,
      pressMoveThreshold: 5
    };
  },

  getInitialState: function() {
    return {
      isActive: false,
      touchActive: false
    };
  },

  componentWillUnmount: function() {
    this.cleanupScrollDetection();
    this.cancelPressDetection();
  },

  processEvent: function(event) {
    if (this.props.preventDefault) event.preventDefault();
    if (this.props.stopPropagation) event.stopPropagation();
  },

  onTouchStart: function(event) {
    if (this.props.onTouchStart && this.props.onTouchStart(event) === false) return;
    this.processEvent(event);
    window._blockMouseEvents = true;
    this._initialTouch = this._lastTouch = getTouchProps(event.touches[0]);
    this.initScrollDetection();
    this.initPressDetection(this.endTouch);
    this.setState({
      isActive: true
    });
  },

  initScrollDetection: function() {
    this._scrollParents = [];
    this._scrollPos = { top: 0, left: 0 };
    var node = this.getDOMNode();
    while (node) {
      if (node.scrollHeight > node.offsetHeight || node.scrollWidth > node.offsetWidth) {
        this._scrollParents.push(node);
        this._scrollPos.top += node.scrollTop;
        this._scrollPos.left += node.scrollLeft;
      }
      node = node.parentNode;
    }
  },

  calculateMovement: function(touch) {
    return {
      x: Math.abs(touch.clientX - this._initialTouch.clientX),
      y: Math.abs(touch.clientY - this._initialTouch.clientY)
    };
  },

  detectScroll: function() {
    var currentScrollPos = { top: 0, left: 0 };
    for (var i = 0; i < this._scrollParents.length; i++) {
      currentScrollPos.top += this._scrollParents[i].scrollTop;
      currentScrollPos.left += this._scrollParents[i].scrollLeft;
    }
    return !(currentScrollPos.top === this._scrollPos.top && currentScrollPos.left === this._scrollPos.left);
  },

  cleanupScrollDetection: function() {
    this._scrollParents = undefined;
    this._scrollPos = undefined;
  },

  initPressDetection: function(callback) {
    if (!this.props.onPress) return;
    this._pressTimeout = setTimeout(function() {
      this.props.onPress();
      callback();
    }.bind(this), this.props.pressDelay);
  },

  cancelPressDetection: function() {
    clearTimeout(this._pressTimeout);
  },

  onTouchMove: function(event) {
    if (!this._initialTouch) return;
    this.processEvent(event);
    if (this.detectScroll()) {
      return this.endTouch(event);
    }
    this.props.onTouchMove && this.props.onTouchMove(event);
    this._lastTouch = getTouchProps(event.touches[0]);
    var movement = this.calculateMovement(this._lastTouch);
    if (movement.x > this.props.pressMoveThreshold || movement.y > this.props.pressMoveThreshold) {
      this.cancelPressDetection();
    }
    if (movement.x > this.props.moveThreshold || movement.y > this.props.moveThreshold) {
      if (this.state.isActive) {
        this.setState({
          isActive: false
        });
      }
    } else {
      if (!this.state.isActive) {
        this.setState({
          isActive: true
        });
      }
    }
  },

  onTouchEnd: function(event) {
    if (!this._initialTouch) return;
    this.processEvent(event);
    var movement = this.calculateMovement(this._lastTouch);
    if (movement.x <= this.props.moveThreshold && movement.y <= this.props.moveThreshold) {
      this.props.onTap && this.props.onTap(event);
    }
    this.endTouch(event);
  },

  endTouch: function(event) {
    this.cancelPressDetection();
    this.props.onTouchEnd && this.props.onTouchEnd(event);
    this._initialTouch = null;
    this._lastTouch = null;
    this.setState({
      isActive: false
    });
  },

  onMouseDown: function(event) {
    if (window._blockMouseEvents) {
      window._blockMouseEvents = false;
      return;
    }
    if (this.props.onMouseDown && this.props.onMouseDown(event) === false) return;
    this.processEvent(event);
    this.initPressDetection(this.endMouseEvent);
    this._mouseDown = true;
    this.setState({
      isActive: true
    });
  },

  onMouseMove: function(event) {
    if (window._blockMouseEvents || !this._mouseDown) return;
    this.processEvent(event);
    this.props.onMouseMove && this.props.onMouseMove(event);
  },

  onMouseUp: function(event) {
    if (window._blockMouseEvents || !this._mouseDown) return;
    this.processEvent(event);
    this.props.onMouseUp && this.props.onMouseUp(event);
    this.props.onTap && this.props.onTap(event);
    this.endMouseEvent();
  },

  onMouseOut: function(event) {
    if (window._blockMouseEvents || !this._mouseDown) return;
    this.processEvent(event);
    this.props.onMouseOut && this.props.onMouseOut(event);
    this.endMouseEvent();
  },

  endMouseEvent: function() {
    this.cancelPressDetection();
    this._mouseDown = false;
    this.setState({
      isActive: false
    });
  },

  touchStyles: function() {
    return {
      WebkitTapHighlightColor: 'rgba(0,0,0,0)',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      KhtmlUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
      cursor: 'pointer'
    };
  },

  handlers: function() {
    return {
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      onMouseMove: this.onMouseMove,
      onMouseOut: this.onMouseOut
    };
  }
};

/**
 * Tappable Component
 * ==================
 */

var component = React.createClass({

  displayName: 'Tappable',

  mixins: [Mixin],

  propTypes: {
    component: React.PropTypes.any,           // component to create
    className: React.PropTypes.string,        // optional className
    classBase: React.PropTypes.string,        // base for generated classNames
    style: React.PropTypes.object,            // additional style properties for the component
    disabled: React.PropTypes.bool            // only applies to buttons
  },

  getDefaultProps: function() {
    return {
      component: 'span',
      classBase: 'Tappable'
    };
  },

  render: function() {

    var className = this.props.classBase + (this.state.isActive ? '-active' : '-inactive');
    if (this.props.className) {
      className += ' ' + this.props.className;
    }

    var style = {};
    extend(style, this.touchStyles(), this.props.style);

    var newComponentProps = {
      style: style,
      className: className,
      disabled: this.props.disabled,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onMouseDown: this.onMouseDown,
      onMouseMove: this.onMouseMove,
      onMouseUp: this.onMouseUp,
      onMouseOut: this.onMouseOut
    };

    var props = this.props;
    dataOrAriaPropNames = Object.keys(props).filter(isDataOrAriaProp);
    dataOrAriaPropNames.forEach(function (propName) {
      newComponentProps[propName] = props[propName];
    });

    return React.createElement(this.props.component, newComponentProps, this.props.children);

  }
});

component.Mixin = Mixin;
module.exports = component;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"react/lib/Object.assign":2}],2:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;

},{}]},{},[1])(1)
});