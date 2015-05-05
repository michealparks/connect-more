export function randomInt( min, max ) {
  return Math.floor( min + Math.random() * ( max - min + 1 ) );
}

export function randomFloat( min, max ) {
  return min + Math.random() * ( max - min );
}

export function clamp( x, min, max ) {
  return ( x < min ) ? min : ( ( x > max ) ? max : x );
}

export default {
  randomInt,
  randomFloat,
  clamp
}