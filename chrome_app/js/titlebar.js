function focusTitlebar(focus) {
  var bg_color = focus ? "#3a3d3d" : "#7a7c7c";
  var titlebar = document.querySelector("#titlebar");
  if (titlebar) {
    titlebar.style.backgroundColor = bg_color;
  }
}

window.onfocus = focusTitlebar.bind(null, true);
window.onblur  = focusTitlebar.bind(null, false);

window.onload = function() {
  document.querySelector("#close-window-button").onclick = function() {
    window.close();
  }

  return;

  console.log(window.innerHeight);

  var webview = document.querySelector('#webview');
  webview.style.height = (window.innerHeight - 38) + 'px';

  webview.addEventListener('resize', function() {
    webview.style.height = (window.innerHeight - 38) + 'px';
  })
}

