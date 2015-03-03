export const hasTouch = window.ontouchstart !== undefined;
export const ptrEnabled = navigator.pointerEnabled || navigator.msPointerEnabled;

export const ptrdown = ptrEnabled? 'pointerdown': hasTouch? 'touchstart': 'mousedown';
export const ptrmove = ptrEnabled? 'pointermove': hasTouch? 'touchmove': 'mousemove';
export const ptrup = ptrEnabled? 'pointerup': hasTouch? 'touchend': 'mouseup';