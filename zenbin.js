'use strict';
let QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  let query_string = {};
  let query = window.location.search.substring(1);
  let lets = query.split("&");
  for (let i=0; i<lets.length; i++) {
    let pair = lets[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      let arr = [query_string[pair[0]],decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
    return query_string;
}();

$(document).ready(() => {
  let editor = $('#editor');
  let result = $('#results');

  const myCodeMirror = CodeMirror.fromTextArea(editor.get(0), {
    mode: 'javascript',
    theme: 'base16-dark',
    tabSize: 2,
    lineNumbers: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
  });


  //============================================================================
  // If script exists in localstorage, load it. ================================
  //============================================================================
  let uid = null;
  if (QueryString.zen) {
    let zen = QueryString.zen;
    if (localStorage.getItem(zen) !== null) {
      myCodeMirror.setValue(localStorage.getItem(zen));
      uid = zen;
    }
  } else {
    uid = guid();
    window.history.pushState(null, 'Zenbin.io', `?zen=${uid}`);
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}-${s4()}-${s4()}`;
  };

  const setValue = function() {
    localStorage.setItem(uid, myCodeMirror.getValue());
  }
  //============================================================================
  // Eval code when user stops typing. =========================================
  //============================================================================
  let typingTimer;
  const doneTypingInterval = 2000;

  $(window).on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  });

  $(window).on('keydown', function () {
    clearTimeout(typingTimer);
  });

  function doneTyping () {
    eval(myCodeMirror.getValue());
    setValue();
  }
  //============================================================================
  // Build zenscript loader. ===================================================
  //============================================================================
  for (var key in localStorage){
    if (key !== 'null') {
      $('#fileloader').append(
        `<a href="/?zen=${key}" class="file"><i class="fa fa-file"></i> ${key}</a><br />`
      )
    }
  }

  //============================================================================
  // Clone console events for reporting to results. ============================
  //============================================================================
  console._log_old = console.log;
  console.log = (msg) => {
    result.append(`<div class="line">${msg}</div>`);
    result.scrollTop = result.scrollHeight;
    console._log_old(msg);
  }
  window.onerror = (msg) => {
    setValue();
    result.append(`<div class="line error">${msg}</div>`);
    result.scrollTop = result.scrollHeight;
  }
  eval(myCodeMirror.getValue());

});
