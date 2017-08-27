(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.perfundo = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var vanillaTouchwipe = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  module.exports = factory();
}(commonjsGlobal, (function () { 'use strict';

/**
 * Original Comment:
 *
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 *
 * @author Nishanth Sudharsanam
 * @version 1.2 Allowed tracking of amount of swipe which is passed to the callback.
 *
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */

function ifDefined(obj, def) {
  return (typeof obj !== 'undefined') ? obj : def;
}

function touchwipe(domNode, settings) {
  settings = settings || {};

  var config = {
    min_move_x: ifDefined(settings.min_move_x, 20),
    min_move_y: ifDefined(settings.min_move_y, 20),
    wipeLeft: settings.wipeLeft || function() {},
    wipeRight: settings.wipeRight || function() {},
    wipeUp: settings.wipeUp || function() {},
    wipeDown: settings.wipeDown || function() {},
    preventDefaultEvents: ifDefined(settings.preventDefaultEvents, true)
  };

  var startX;
  var startY;
  var isMoving = false;

  function cancelTouch() {
    domNode.removeEventListener('touchmove', onTouchMove);
    startX = null;
    isMoving = false;
  }

  function onTouchMove(e) {
    if (config.preventDefaultEvents) {
      e.preventDefault();
    }
    if (isMoving) {
      var x = e.touches[0].pageX;
      var y = e.touches[0].pageY;
      var dx = startX - x;
      var dy = startY - y;
      if (Math.abs(dx) >= config.min_move_x) {
        cancelTouch();
        if (dx > 0) {
          config.wipeLeft(e);
        }
        else {
          config.wipeRight(e);
        }
      }
      else if (Math.abs(dy) >= config.min_move_y) {
        cancelTouch();
        if (dy > 0) {
          config.wipeDown(e);
        }
        else {
          config.wipeUp(e);
        }
      }
    }
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      isMoving = true;
      domNode.addEventListener('touchmove', onTouchMove);
    }
  }

  domNode.addEventListener('touchstart', onTouchStart);

  return {
    unbind: function() {
      domNode.removeEventListener('touchstart', onTouchStart);
    }
  };
}

return touchwipe;

})));
});

function configure(element, userOptions, defaultOptions) {
  return Object.keys(defaultOptions).reduce(function (options, key) {
    var initial = defaultOptions[key];
    var attrValue = element.getAttribute(("data-" + (key.toLowerCase())));

    // eslint-disable-next-line no-param-reassign
    options[key] = attrValue || userOptions[key] || initial;

    return options;
  }, {});
}

var defaultOptions = {
  disableHistory: false,
  swipe: true,
  rootAttribute: "data-perfundo",
  classNames: {
    link: "perfundo__link",
    overlay: "perfundo__overlay",
    content: "perfundo__content",
    close: "perfundo__close",
    prev: "perfundo__prev",
    next: "perfundo__next",
    untarget: "perfundo__untarget",
    active: "is-active",
  },
};

function Perfundo(dependencies, target, userOptions) {
  var this$1 = this;
  if ( userOptions === void 0 ) userOptions = {};

  var configure = dependencies.configure;
  var context = dependencies.context;
  var defaultOptions = dependencies.defaultOptions;
  var swipe = dependencies.swipe;
  var elements = typeof target === "string"
    ? context.querySelectorAll(target)
    : target;

  if (elements.length > 1) {
    return [].slice.call(elements).map(function (element) { return new Perfundo(dependencies, element, userOptions); });
  }

  this.context = context;
  this.element = elements[0] || elements;
  this.options = configure(this.element, userOptions, defaultOptions);

  this.element.setAttribute(this.options.rootAttribute, true);

  if (this.options.disableHistory) {
    this.element.addEventListener("click", function (e) {
      e.preventDefault();

      var close = e.target.classList.contains(this$1.options.classNames.close)
        || e.target.classList.contains(this$1.options.classNames.overlay);
      var open = e.target.classList.contains(this$1.options.classNames.link)
        || e.target.parentElement.classList.contains(this$1.options.classNames.link);

      if (close) { this$1.close(); }
      else if (open) { this$1.open(); }
      else if (e.target.classList.contains(this$1.options.classNames.prev)) { this$1.prev(); }
      else if (e.target.classList.contains(this$1.options.classNames.next)) { this$1.next(); }
    });
  }

  if (this.options.swipe) {
    swipe(this.element, {
      wipeLeft: function () { return this$1.next(); },
      wipeRight: function () { return this$1.prev(); },
      preventDefaultEvents: this.options.disableHistory,
    });
  }
}

Perfundo.prototype.open = function open() {
  this.element.querySelector(("." + (this.options.classNames.overlay)))
    .classList.add(this.options.classNames.active);
};

Perfundo.prototype.close = function close() {
  this.element.querySelector(("." + (this.options.classNames.overlay)))
    .classList.remove(this.options.classNames.active);
};

Perfundo.prototype.prev = function prev() {
  try {
    var prevLink = this.element.querySelector(("." + (this.options.classNames.prev)));
    var prevItem = this.context.querySelector(("" + (prevLink.getAttribute("href"))));
    var prevRoot = this.getRootElement(prevItem);

    if (prevRoot) {
      this.close();
      prevRoot.querySelector(("." + (this.options.classNames.link))).click();
    }
  } catch (e) {
    // Last item reached.
  }
};

Perfundo.prototype.next = function next() {
  try {
    var nextLink = this.element.querySelector(("." + (this.options.classNames.next)));
    var nextItem = this.context.querySelector(("" + (nextLink.getAttribute("href"))));
    var nextRoot = this.getRootElement(nextItem);

    if (nextRoot) {
      this.close();
      nextRoot.querySelector(("." + (this.options.classNames.link))).click();
    }
  } catch (e) {
    // Last item reached.
  }
};

Perfundo.prototype.getRootElement = function getRootElement(element) {
  var this$1 = this;

  var parent = element.parentElement;

  while (parent && parent !== this.context) {
    if (parent.hasAttribute(this$1.options.rootAttribute)) { return parent; }

    parent = parent.parentElement;
  }

  return null;
};

var index = function (selector, userOptions, context) {
    if ( context === void 0 ) context = document;

    return new Perfundo({ configure: configure, context: context, defaultOptions: defaultOptions, swipe: vanillaTouchwipe }, selector, userOptions);
};

return index;

})));
