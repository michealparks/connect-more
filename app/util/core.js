export default {

  spliceArray(arr, index) {
    if (index < (arr.length - 1)) {
      arr[index] = arr.pop();
    } else {
      arr.pop()
    }
  },

  randomFloat(min, max) {
    return min + Math.random()*(max-min);
  }, 

  randomInt(min, max) {
    return Math.floor(min+Math.random()*(max-min+1))
  }

};
