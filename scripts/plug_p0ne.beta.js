/*=====================*\
|* plug_p0ne.beta      *|
\*=====================*/
/*@source p0ne.head.ls */
/**
 * plug_p0ne - a modern script collection to improve plug.dj
 * adds a variety of new functions, bugfixes, tweaks and developer tools/functions
 *
 * This script collection is written in LiveScript (a CoffeeScript descendend which compiles to JavaScript). If you are reading this in JavaScript, you might want to check out the LiveScript file instead for a better documented and formatted source; just replace the .js with .ls in the URL of this file
 *
 * @author jtbrinkmann aka. Brinkie Pie
 * @license MIT License
 * @copyright (c) 2015 J.-T. Brinkmann
 *
 * further credits go to
 *     the plugCubed Team - for coining a standard for the "Custom Room Settings"
 *     Christian Petersen - for the toggle boxes in the settings menu http://codepen.io/cbp/pen/FLdjI/
 *     all the beta testers! <3
 *     plug.dj - for it's horribly broken implementation of everything.
 *               "If it wasn't THAT broken, I wouldn't have had as much fun in coding plug_p0ne"
 *                   --Brinkie Pie (2015)
 *
 * Not happy with plug_p0ne? contact me (the developer) at brinkiepie^gmail.com
 * great alternative plug.dj scripts are
 *     - TastyPlug (relatively lightweight but does a great job - https://fungustime.pw/tastyplug/ )
 *     - RCS (Radiant Community Script - https://radiant.dj/rcs )
 *     - plugCubed (does a lot of things, but breaks on plug.dj updates - https://plugcubed.net/ )
 *     - plugplug (lightweight as heck - https://bitbucket.org/mateon1/plugplug/ )
 */
var p0ne_, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
console.info("~~~~~~~~~~~~ plug_p0ne loading ~~~~~~~~~~~~");
if (typeof console.time === 'function') {
  console.time("[p0ne] completly loaded");
}
p0ne_ = window.p0ne;
window.p0ne = {
  version: '1.7.1',
  lastCompatibleVersion: '1.7.0',
  host: 'https://cdn.p0ne.com',
  SOUNDCLOUD_KEY: 'aff458e0e87cfbc1a2cde2f8aeb98759',
  YOUTUBE_KEY: 'AI39si6XYixXiaG51p_o0WahXtdRYFCpMJbgHVRKMKCph2FiJz9UCVaLdzfltg1DXtmEREQVFpkTHx_0O_dSpHR5w0PTVea4Lw',
  YOUTUBE_V3_KEY: 'AIzaSyDaWL9emnR9R_qBWlDAYl-Z_h4ZPYBDjzk',
  FIMSTATS_KEY: '4983a7f2-b253-4300-8b18-6e7c57db5e2e',
  proxy: function(url){
    return "https://cors-anywhere.herokuapp.com/" + url.replace(/^.*\/\//, '');
  },
  started: new Date(),
  autosave: {},
  autosave_num: {},
  modules: (typeof p0ne != 'undefined' && p0ne !== null ? p0ne.modules : void 8) || {},
  dependencies: {},
  reload: function(){
    return $.getScript(this.host + "/scripts/plug_p0ne.beta.js");
  },
  close: function(){
    var i$, ref$, m;
    console.groupCollapsed("[p0ne] closing");
    for (i$ in ref$ = this.modules) {
      m = ref$[i$];
      if (typeof m.settingsSave === 'function') {
        m.settingsSave();
      }
      m.disable(true);
    }
    if (typeof window.dataSave === 'function') {
      window.dataSave();
      $window.off('beforeunload', window.dataSave);
      clearInterval(window.dataSave.interval);
    }
    console.groupEnd("[p0ne] closing");
  }
};
console.info("plug_p0ne v" + p0ne.version);
try {
  if (typeof window.dataSave === 'function') {
    window.dataSave();
  }
} catch (e$) {}
/*####################################
#           COMPATIBILITY            #
####################################*/
/* check if last run p0ne version is incompatible with current and needs to be migrated */
window.compareVersions = function(a, b){
  var i$, len$, i;
  a = a.split('.');
  b = b.split('.');
  for (i$ = 0, len$ = a.length; i$ < len$; ++i$) {
    i = i$;
    if (a[i] !== b[i]) {
      return a[i] > b[i];
    }
  }
  return b.length >= a.length;
};
(function(fn_){
  var fn, v, onMigrated;
  if (window.P0NE_UPDATE) {
    window.P0NE_UPDATE = false;
    if ((p0ne_ != null ? p0ne_.version : void 8) === window.p0ne.version) {
      return;
    } else {
      if (typeof chatWarn === 'function') {
        chatWarn("automatically updated to v" + p0ne.version, 'plug_p0ne');
      }
    }
  }
  if (!console.group) {
    console.group = console.log;
    console.groupEnd = $.noop;
  }
  fn = function(){
    var that, x$, err;
    try {
      if (that = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB) {
        x$ = that.open('_localforage_spec_test', 1);
        x$.onsuccess = function(){
          return fn_();
        };
        x$.onerror = x$.onblocked = x$.onupgradeneededd = function(err){
          delete window.indexedDB, delete window.webkitIndexedDB, delete window.mozIndexedDB, delete window.OIndexedDB, delete window.msIndexedDB;
          console.error("[p0ne] indexDB doesn't work, falling back to localStorage", err);
          return fn_();
        };
        return x$;
      } else {
        return fn_();
      }
    } catch (e$) {
      err = e$;
      console.error("[p0ne] indexDB doesn't work, falling back to localStorage", err);
      delete window.indexedDB, delete window.webkitIndexedDB, delete window.mozIndexedDB, delete window.OIndexedDB, delete window.msIndexedDB;
      return fn_();
    }
  };
  if (!(v = localStorage.p0neVersion)) {
    return fn();
  }
  if (compareVersions(v, p0ne.lastCompatibleVersion)) {
    fn();
  } else {
    console.warn("[p0ne] obsolete p0ne version detected (" + v + " < " + p0ne.lastCompatibleVersion + "), loading migration script…");
    API.off('p0ne_migrated');
    API.once('p0ne_migrated', onMigrated = function(newVersion){
      if (newVersion === p0ne.lastCompatibleVersion) {
        fn();
      } else {
        API.once('p0ne_migrated', onMigrated);
      }
    });
    $.getScript(p0ne.host + "/scripts/plug_p0ne.migrate." + v.substr(0, v.indexOf('.')) + ".js?from=" + v + "&to=" + p0ne.version);
  }
})(function(){
  /* start of fn_ */
  /* if needed, this function is called once plug_p0ne successfully migrated. Otherwise it gets called right away */
  var errors, warnings, error_, warn_, p0ne, $window, $body, tmp, i$, ref$, len$, Constr, DataEmitter, $dummy, userID;
  errors = warnings = 0;
  error_ = console.error;
  console.error = function(){
    errors++;
    error_.apply(this, arguments);
  };
  warn_ = console.warn;
  console.warn = function(){
    warnings++;
    warn_.apply(this, arguments);
  };
  if (console.groupCollapsed) {
    console.groupCollapsed("[p0ne] initializing… (click on this message to expand/collapse the group)");
  } else {
    console.groupCollapsed = console.group;
    console.group("[p0ne] initializing…");
  }
  p0ne = window.p0ne;
  localStorage.p0neVersion = p0ne.version;
  /*setInterval do
      !->
          window.P0NE_UPDATE = true
          p0ne.reload!
              .then !->
                  setTimeout do
                      !-> window.P0NE_UPDATE = false
                      10_000ms
      30 * 60_000ms*/
  requirejs.define = window.define;
  window.require = window.define = window.module = false;
  /*@source lambda.js */
  
  /*
   * Lambda.js: String based lambdas for Node.js and the browser.
   * edited by JTBrinkmann to support some CoffeeScript like shorthands (e.g. :: for prototype)
   *
   * Copyright (c) 2007 Oliver Steele (steele@osteele.com)
   * Released under MIT license.
   *
   * Version: 1.0.2
   *
   */
  (function (root, factory) {
      if (typeof exports === 'object') {
          module.exports = factory();
      } else {
          root.lambda = factory();
      }
  })(this, function () {
  
      var
          split = 'ab'.split(/a*/).length > 1 ? String.prototype.split : function (separator) {
                  var result = this.split.apply(this, arguments),
                      re = RegExp(separator),
                      savedIndex = re.lastIndex,
                      match = re.exec(this);
                  if (match && match.index === 0) {
                      result.unshift('');
                  }
                  re.lastIndex = savedIndex;
                  return result;
              },
          indexOf = Array.prototype.indexOf || function (element) {
                  for (var i = 0, e; e = this[i]; i++) {
                      if (e === element) {
                          return i;
                      }
                  }
                  return -1;
              };
  
      function lambda(expression, vars) {
          if (!vars || !vars.length)
              vars = []
          expression = expression.replace(/^\s+/, '').replace(/\s+$/, '') // jtb edit
          var parameters = [],
              sections = split.call(expression, /\s*->\s*/m);
          if (sections.length > 1) {
              while (sections.length) {
                  expression = sections.pop();
                  parameters = sections.pop().replace(/^\s*(.*)\s*$/, '$1').split(/\s*,\s*|\s+/m);
                  sections.length && sections.push('(function('+parameters+'){return ('+expression+')})');
              }
          } else if (expression.match(/\b_\b/)) {
              parameters = '_';
          } else {
              var leftSection = expression.match(/^(?:[+*\/%&|\^\.=<>]|!=|::)/m),
                  rightSection = expression.match(/[+\-*\/%&|\^\.=<>!]$/m);
              if (leftSection || rightSection) {
                  if (leftSection) {
                      parameters.push('$1');
                      expression = '$1' + expression;
                  }
                  if (rightSection) {
                      parameters.push('$2');
                      if (rightSection[0] == '.')
                          expression = expression.substr(0, expression.length-1) + '[$2]' // jtb edit
                      else
                          expression = expression + '$2';
                  }
              } else {
                  var variables = expression
                      .replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|true|false|null|undefined|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '')
                      .match(/([a-z_$][a-z_$\d]*)/gi) || [];
                  for (var i = 0, v; v = variables[i++];) {
                      if (parameters.indexOf(v) == -1 && vars.indexOf(v) == -1)
                          parameters.push(v);
                  }
              }
          }
          if (vars.length)
              vars = 'var '+vars.join(',')+'; '
          else
              vars = ''
  
          try {
              return new Function(parameters, vars+'return (' + expression + ')');
          } catch(e) {
              e.message += ' in function('+parameters+'){'+vars+'return (' + expression + ')}'
              throw e
          }
      }
  
      return lambda;
  });
  
  window.l = window.l_ = function(expression) {
      var vars = [], refs = 0
      var replacedNCO = true
      expression = expression
          // :: for prototype
          .replace(/([\w$]*)\.?::(\?)?\.?([\w$])?/g, function(_, pre, nullCoalescingOp, post, i) {
              return (pre ? pre+'.' : i == 0 ? '.' : '') + 'prototype' + (nullCoalescingOp||'') + (post ? '.'+post : '')
          })
          // @ for this
          .replace(/@(\?)?\.?([\w$])?/g, function(_, nullCoalescingOp, post, i) {
              return 'this' + (nullCoalescingOp||'') + (post ? '.'+post : '')
          })
      // ?. for Null Coalescing Operator
      while (replacedNCO) {
          replacedNCO = false
          expression = expression.replace(/([\w\.\$]+)\?([\w\.\$]|\[)/, function(_, pre, post) {
              replacedNCO = true
              vars[refs++] = 'ref'+refs+'$'
              return '(ref'+refs+'$ = '+(pre[0]=='.'?'it':'')+pre+') != null && ref'+refs+'$'+(post[0]=="."||post[0]=="[" ? "" : ".")+post
          })
      }
      return lambda(expression, vars)
  }
  
  
  /*@source lz-string.js */
  
  // Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
  // This work is free. You can redistribute it and/or modify it
  // under the terms of the WTFPL, Version 2
  // For more information see LICENSE.txt or http://www.wtfpl.net/
  //
  // For more information, the home page:
  // http://pieroxy.net/blog/pages/lz-string/testing.html
  //
  // LZ-based compression algorithm, version 1.3.6
  var LZString = {
    
    
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    _f : String.fromCharCode,
    
    compressToBase64 : function (input) {
      if (input == null) return "";
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      
      input = LZString.compress(input);
      
      while (i < input.length*2) {
        
        if (i%2==0) {
          chr1 = input.charCodeAt(i/2) >> 8;
          chr2 = input.charCodeAt(i/2) & 255;
          if (i/2+1 < input.length) 
            chr3 = input.charCodeAt(i/2+1) >> 8;
          else 
            chr3 = NaN;
        } else {
          chr1 = input.charCodeAt((i-1)/2) & 255;
          if ((i+1)/2 < input.length) {
            chr2 = input.charCodeAt((i+1)/2) >> 8;
            chr3 = input.charCodeAt((i+1)/2) & 255;
          } else 
            chr2=chr3=NaN;
        }
        i+=3;
        
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        
        output = output +
          LZString._keyStr.charAt(enc1) + LZString._keyStr.charAt(enc2) +
            LZString._keyStr.charAt(enc3) + LZString._keyStr.charAt(enc4);
        
      }
      
      return output;
    },
    
    decompressFromBase64 : function (input) {
      if (input == null) return "";
      var output = "",
          ol = 0, 
          output_,
          chr1, chr2, chr3,
          enc1, enc2, enc3, enc4,
          i = 0, f=LZString._f;
      
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      
      while (i < input.length) {
        
        enc1 = LZString._keyStr.indexOf(input.charAt(i++));
        enc2 = LZString._keyStr.indexOf(input.charAt(i++));
        enc3 = LZString._keyStr.indexOf(input.charAt(i++));
        enc4 = LZString._keyStr.indexOf(input.charAt(i++));
        
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        
        if (ol%2==0) {
          output_ = chr1 << 8;
          
          if (enc3 != 64) {
            output += f(output_ | chr2);
          }
          if (enc4 != 64) {
            output_ = chr3 << 8;
          }
        } else {
          output = output + f(output_ | chr1);
          
          if (enc3 != 64) {
            output_ = chr2 << 8;
          }
          if (enc4 != 64) {
            output += f(output_ | chr3);
          }
        }
        ol+=3;
      }
      
      return LZString.decompress(output);
      
    },
  
    compressToUTF16 : function (input) {
      if (input == null) return "";
      var output = "",
          i,c,
          current,
          status = 0,
          f = LZString._f;
      
      input = LZString.compress(input);
      
      for (i=0 ; i<input.length ; i++) {
        c = input.charCodeAt(i);
        switch (status++) {
          case 0:
            output += f((c >> 1)+32);
            current = (c & 1) << 14;
            break;
          case 1:
            output += f((current + (c >> 2))+32);
            current = (c & 3) << 13;
            break;
          case 2:
            output += f((current + (c >> 3))+32);
            current = (c & 7) << 12;
            break;
          case 3:
            output += f((current + (c >> 4))+32);
            current = (c & 15) << 11;
            break;
          case 4:
            output += f((current + (c >> 5))+32);
            current = (c & 31) << 10;
            break;
          case 5:
            output += f((current + (c >> 6))+32);
            current = (c & 63) << 9;
            break;
          case 6:
            output += f((current + (c >> 7))+32);
            current = (c & 127) << 8;
            break;
          case 7:
            output += f((current + (c >> 8))+32);
            current = (c & 255) << 7;
            break;
          case 8:
            output += f((current + (c >> 9))+32);
            current = (c & 511) << 6;
            break;
          case 9:
            output += f((current + (c >> 10))+32);
            current = (c & 1023) << 5;
            break;
          case 10:
            output += f((current + (c >> 11))+32);
            current = (c & 2047) << 4;
            break;
          case 11:
            output += f((current + (c >> 12))+32);
            current = (c & 4095) << 3;
            break;
          case 12:
            output += f((current + (c >> 13))+32);
            current = (c & 8191) << 2;
            break;
          case 13:
            output += f((current + (c >> 14))+32);
            current = (c & 16383) << 1;
            break;
          case 14:
            output += f((current + (c >> 15))+32, (c & 32767)+32);
            status = 0;
            break;
        }
      }
      
      return output + f(current + 32);
    },
    
  
    decompressFromUTF16 : function (input) {
      if (input == null) return "";
      var output = "",
          current,c,
          status=0,
          i = 0,
          f = LZString._f;
      
      while (i < input.length) {
        c = input.charCodeAt(i) - 32;
        
        switch (status++) {
          case 0:
            current = c << 1;
            break;
          case 1:
            output += f(current | (c >> 14));
            current = (c&16383) << 2;
            break;
          case 2:
            output += f(current | (c >> 13));
            current = (c&8191) << 3;
            break;
          case 3:
            output += f(current | (c >> 12));
            current = (c&4095) << 4;
            break;
          case 4:
            output += f(current | (c >> 11));
            current = (c&2047) << 5;
            break;
          case 5:
            output += f(current | (c >> 10));
            current = (c&1023) << 6;
            break;
          case 6:
            output += f(current | (c >> 9));
            current = (c&511) << 7;
            break;
          case 7:
            output += f(current | (c >> 8));
            current = (c&255) << 8;
            break;
          case 8:
            output += f(current | (c >> 7));
            current = (c&127) << 9;
            break;
          case 9:
            output += f(current | (c >> 6));
            current = (c&63) << 10;
            break;
          case 10:
            output += f(current | (c >> 5));
            current = (c&31) << 11;
            break;
          case 11:
            output += f(current | (c >> 4));
            current = (c&15) << 12;
            break;
          case 12:
            output += f(current | (c >> 3));
            current = (c&7) << 13;
            break;
          case 13:
            output += f(current | (c >> 2));
            current = (c&3) << 14;
            break;
          case 14:
            output += f(current | (c >> 1));
            current = (c&1) << 15;
            break;
          case 15:
            output += f(current | c);
            status=0;
            break;
        }
        
        
        i++;
      }
      
      return LZString.decompress(output);
      //return output;
      
    },
  
  
    //compress into uint8array (UCS-2 big endian format)
    compressToUint8Array: function (uncompressed) {
  
      var compressed = LZString.compress(uncompressed);
      var buf=new Uint8Array(compressed.length*2); // 2 bytes per character
  
      for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
        var current_value = compressed.charCodeAt(i);
        buf[i*2] = current_value >>> 8;
        buf[i*2+1] = current_value % 256;
      }
      return buf;
  
    },
  
    //decompress from uint8array (UCS-2 big endian format)
    decompressFromUint8Array:function (compressed) {
  
      if (compressed===null || compressed===undefined){
          return LZString.decompress(compressed);
      } else {
  
          var buf=new Array(compressed.length/2); // 2 bytes per character
  
          for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
            buf[i]=compressed[i*2]*256+compressed[i*2+1];
          }
  
          return LZString.decompress(String.fromCharCode.apply(null, buf));
  
      }
  
    },
  
    //compress into a string that is already URI encoded
    compressToEncodedURIComponent: function (uncompressed) {
      return LZString.compressToBase64(uncompressed).replace(/=/g,"$").replace(/\//g,"-");
    },
  
    //decompress from an output of compressToEncodedURIComponent
    decompressFromEncodedURIComponent:function (compressed) {
      if (compressed) compressed = compressed.replace(/$/g,"=").replace(/-/g,"/");
      return LZString.decompressFromBase64(compressed);
    },
  
  
    compress: function (uncompressed) {
      if (uncompressed == null) return "";
      var i, value,
          context_dictionary= {},
          context_dictionaryToCreate= {},
          context_c="",
          context_wc="",
          context_w="",
          context_enlargeIn= 2, // Compensate for the first entry which should not count
          context_dictSize= 3,
          context_numBits= 2,
          context_data_string="", 
          context_data_val=0, 
          context_data_position=0,
          ii,
          f=LZString._f;
      
      for (ii = 0; ii < uncompressed.length; ii += 1) {
        context_c = uncompressed.charAt(ii);
        if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
          context_dictionary[context_c] = context_dictSize++;
          context_dictionaryToCreate[context_c] = true;
        }
        
        context_wc = context_w + context_c;
        if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
          context_w = context_wc;
        } else {
          if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
            if (context_w.charCodeAt(0)<256) {
              for (i=0 ; i<context_numBits ; i++) {
                context_data_val = (context_data_val << 1);
                if (context_data_position == 15) {
                  context_data_position = 0;
                  context_data_string += f(context_data_val);
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
              }
              value = context_w.charCodeAt(0);
              for (i=0 ; i<8 ; i++) {
                context_data_val = (context_data_val << 1) | (value&1);
                if (context_data_position == 15) {
                  context_data_position = 0;
                  context_data_string += f(context_data_val);
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            } else {
              value = 1;
              for (i=0 ; i<context_numBits ; i++) {
                context_data_val = (context_data_val << 1) | value;
                if (context_data_position == 15) {
                  context_data_position = 0;
                  context_data_string += f(context_data_val);
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = 0;
              }
              value = context_w.charCodeAt(0);
              for (i=0 ; i<16 ; i++) {
                context_data_val = (context_data_val << 1) | (value&1);
                if (context_data_position == 15) {
                  context_data_position = 0;
                  context_data_string += f(context_data_val);
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
            delete context_dictionaryToCreate[context_w];
          } else {
            value = context_dictionary[context_w];
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
            
            
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          // Add wc to the dictionary.
          context_dictionary[context_wc] = context_dictSize++;
          context_w = String(context_c);
        }
      }
      
      // Output the code for w.
      if (context_w !== "") {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += f(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += f(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
          
          
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
      }
      
      // Mark the end of the stream
      value = 2;
      for (i=0 ; i<context_numBits ; i++) {
        context_data_val = (context_data_val << 1) | (value&1);
        if (context_data_position == 15) {
          context_data_position = 0;
          context_data_string += f(context_data_val);
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        value = value >> 1;
      }
      
      // Flush the last char
      while (true) {
        context_data_val = (context_data_val << 1);
        if (context_data_position == 15) {
          context_data_string += f(context_data_val);
          break;
        }
        else context_data_position++;
      }
      return context_data_string;
    },
    
    decompress: function (compressed) {
      if (compressed == null) return "";
      if (compressed == "") return null;
      var dictionary = [],
          next,
          enlargeIn = 4,
          dictSize = 4,
          numBits = 3,
          entry = "",
          result = "",
          i,
          w,
          bits, resb, maxpower, power,
          c,
          f = LZString._f,
          data = {string:compressed, val:compressed.charCodeAt(0), position:32768, index:1};
      
      for (i = 0; i < 3; i += 1) {
        dictionary[i] = i;
      }
      
      bits = 0;
      maxpower = Math.pow(2,2);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = 32768;
          data.val = data.string.charCodeAt(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }
      
      switch (next = bits) {
        case 0: 
            bits = 0;
            maxpower = Math.pow(2,8);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = 32768;
                data.val = data.string.charCodeAt(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
          c = f(bits);
          break;
        case 1: 
            bits = 0;
            maxpower = Math.pow(2,16);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = 32768;
                data.val = data.string.charCodeAt(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
          c = f(bits);
          break;
        case 2: 
          return "";
      }
      dictionary[3] = c;
      w = result = c;
      while (true) {
        if (data.index > data.string.length) {
          return "";
        }
        
        bits = 0;
        maxpower = Math.pow(2,numBits);
        power=1;
        while (power!=maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = 32768;
            data.val = data.string.charCodeAt(data.index++);
          }
          bits |= (resb>0 ? 1 : 0) * power;
          power <<= 1;
        }
  
        switch (c = bits) {
          case 0: 
            bits = 0;
            maxpower = Math.pow(2,8);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = 32768;
                data.val = data.string.charCodeAt(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
  
            dictionary[dictSize++] = f(bits);
            c = dictSize-1;
            enlargeIn--;
            break;
          case 1: 
            bits = 0;
            maxpower = Math.pow(2,16);
            power=1;
            while (power!=maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = 32768;
                data.val = data.string.charCodeAt(data.index++);
              }
              bits |= (resb>0 ? 1 : 0) * power;
              power <<= 1;
            }
            dictionary[dictSize++] = f(bits);
            c = dictSize-1;
            enlargeIn--;
            break;
          case 2: 
            return result;
        }
        
        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
        
        if (dictionary[c]) {
          entry = dictionary[c];
        } else {
          if (c === dictSize) {
            entry = w + w.charAt(0);
          } else {
            return null;
          }
        }
        result += entry;
        
        // Add w+entry[0] to the dictionary.
        dictionary[dictSize++] = w + entry.charAt(0);
        enlargeIn--;
        
        w = entry;
        
        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
        
      }
    }
  };
  
  if( typeof module !== 'undefined' && module != null ) {
    module.exports = LZString
  }
  
  /*@source localforage.min.js */
  
  !function(){var a,b,c,d;!function(){var e={},f={};a=function(a,b,c){e[a]={deps:b,callback:c}},d=c=b=function(a){function c(b){if("."!==b.charAt(0))return b;for(var c=b.split("/"),d=a.split("/").slice(0,-1),e=0,f=c.length;f>e;e++){var g=c[e];if(".."===g)d.pop();else{if("."===g)continue;d.push(g)}}return d.join("/")}if(d._eak_seen=e,f[a])return f[a];if(f[a]={},!e[a])throw new Error("Could not find module "+a);for(var g,h=e[a],i=h.deps,j=h.callback,k=[],l=0,m=i.length;m>l;l++)k.push("exports"===i[l]?g={}:b(c(i[l])));var n=j.apply(this,k);return f[a]=g||n}}(),a("promise/all",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to all.");return new b(function(b,c){function d(a){return function(b){f(a,b)}}function f(a,c){h[a]=c,0===--i&&b(h)}var g,h=[],i=a.length;0===i&&b([]);for(var j=0;j<a.length;j++)g=a[j],g&&e(g.then)?g.then(d(j),c):f(j,g)})}var d=a.isArray,e=a.isFunction;b.all=c}),a("promise/asap",["exports"],function(a){"use strict";function b(){return function(){process.nextTick(e)}}function c(){var a=0,b=new i(e),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function d(){return function(){j.setTimeout(e,1)}}function e(){for(var a=0;a<k.length;a++){var b=k[a],c=b[0],d=b[1];c(d)}k=[]}function f(a,b){var c=k.push([a,b]);1===c&&g()}var g,h="undefined"!=typeof window?window:{},i=h.MutationObserver||h.WebKitMutationObserver,j="undefined"!=typeof global?global:void 0===this?window:this,k=[];g="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?b():i?c():d(),a.asap=f}),a("promise/config",["exports"],function(a){"use strict";function b(a,b){return 2!==arguments.length?c[a]:void(c[a]=b)}var c={instrument:!1};a.config=c,a.configure=b}),a("promise/polyfill",["./promise","./utils","exports"],function(a,b,c){"use strict";function d(){var a;a="undefined"!=typeof global?global:"undefined"!=typeof window&&window.document?window:self;var b="Promise"in a&&"resolve"in a.Promise&&"reject"in a.Promise&&"all"in a.Promise&&"race"in a.Promise&&function(){var b;return new a.Promise(function(a){b=a}),f(b)}();b||(a.Promise=e)}var e=a.Promise,f=b.isFunction;c.polyfill=d}),a("promise/promise",["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],function(a,b,c,d,e,f,g,h){"use strict";function i(a){if(!v(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof i))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],j(a,this)}function j(a,b){function c(a){o(b,a)}function d(a){q(b,a)}try{a(c,d)}catch(e){d(e)}}function k(a,b,c,d){var e,f,g,h,i=v(c);if(i)try{e=c(d),g=!0}catch(j){h=!0,f=j}else e=d,g=!0;n(b,e)||(i&&g?o(b,e):h?q(b,f):a===D?o(b,e):a===E&&q(b,e))}function l(a,b,c,d){var e=a._subscribers,f=e.length;e[f]=b,e[f+D]=c,e[f+E]=d}function m(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],k(b,c,d,f);a._subscribers=null}function n(a,b){var c,d=null;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(u(b)&&(d=b.then,v(d)))return d.call(b,function(d){return c?!0:(c=!0,void(b!==d?o(a,d):p(a,d)))},function(b){return c?!0:(c=!0,void q(a,b))}),!0}catch(e){return c?!0:(q(a,e),!0)}return!1}function o(a,b){a===b?p(a,b):n(a,b)||p(a,b)}function p(a,b){a._state===B&&(a._state=C,a._detail=b,t.async(r,a))}function q(a,b){a._state===B&&(a._state=C,a._detail=b,t.async(s,a))}function r(a){m(a,a._state=D)}function s(a){m(a,a._state=E)}var t=a.config,u=(a.configure,b.objectOrFunction),v=b.isFunction,w=(b.now,c.all),x=d.race,y=e.resolve,z=f.reject,A=g.asap;t.async=A;var B=void 0,C=0,D=1,E=2;i.prototype={constructor:i,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;t.async(function(){k(c._state,d,e[c._state-1],c._detail)})}else l(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}},i.all=w,i.race=x,i.resolve=y,i.reject=z,h.Promise=i}),a("promise/race",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to race.");return new b(function(b,c){for(var d,e=0;e<a.length;e++)d=a[e],d&&"function"==typeof d.then?d.then(b,c):b(d)})}var d=a.isArray;b.race=c}),a("promise/reject",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b,c){c(a)})}a.reject=b}),a("promise/resolve",["exports"],function(a){"use strict";function b(a){if(a&&"object"==typeof a&&a.constructor===this)return a;var b=this;return new b(function(b){b(a)})}a.resolve=b}),a("promise/utils",["exports"],function(a){"use strict";function b(a){return c(a)||"object"==typeof a&&null!==a}function c(a){return"function"==typeof a}function d(a){return"[object Array]"===Object.prototype.toString.call(a)}var e=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=b,a.isFunction=c,a.isArray=d,a.now=e}),b("promise/polyfill").polyfill()}(),function(){"use strict";function a(a){var b=this,c={db:null};if(a)for(var d in a)c[d]=a[d];return new m(function(a,d){var e=n.open(c.name,c.version);e.onerror=function(){d(e.error)},e.onupgradeneeded=function(){e.result.createObjectStore(c.storeName)},e.onsuccess=function(){c.db=e.result,b._dbInfo=c,a()}})}function b(a,b){var c=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var d=new m(function(b,d){c.ready().then(function(){var e=c._dbInfo,f=e.db.transaction(e.storeName,"readonly").objectStore(e.storeName),g=f.get(a);g.onsuccess=function(){var a=g.result;void 0===a&&(a=null),b(a)},g.onerror=function(){d(g.error)}})["catch"](d)});return k(d,b),d}function c(a,b){var c=this,d=new m(function(b,d){c.ready().then(function(){var e=c._dbInfo,f=e.db.transaction(e.storeName,"readonly").objectStore(e.storeName),g=f.openCursor();g.onsuccess=function(){var c=g.result;if(c){var d=a(c.value,c.key);void 0!==d?b(d):c["continue"]()}else b()},g.onerror=function(){d(g.error)}})["catch"](d)});return k(d,b),d}function d(a,b,c){var d=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var e=new m(function(c,e){d.ready().then(function(){var f=d._dbInfo,g=f.db.transaction(f.storeName,"readwrite").objectStore(f.storeName);null===b&&(b=void 0);var h=g.put(b,a);h.onsuccess=function(){void 0===b&&(b=null),c(b)},h.onerror=function(){e(h.error)}})["catch"](e)});return k(e,c),e}function e(a,b){var c=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var d=new m(function(b,d){c.ready().then(function(){var e=c._dbInfo,f=e.db.transaction(e.storeName,"readwrite").objectStore(e.storeName),g=f["delete"](a);g.onsuccess=function(){b()},g.onerror=function(){d(g.error)},g.onabort=function(a){var b=a.target.error;"QuotaExceededError"===b&&d(b)}})["catch"](d)});return k(d,b),d}function f(a){var b=this,c=new m(function(a,c){b.ready().then(function(){var d=b._dbInfo,e=d.db.transaction(d.storeName,"readwrite").objectStore(d.storeName),f=e.clear();f.onsuccess=function(){a()},f.onerror=function(){c(f.error)}})["catch"](c)});return k(c,a),c}function g(a){var b=this,c=new m(function(a,c){b.ready().then(function(){var d=b._dbInfo,e=d.db.transaction(d.storeName,"readonly").objectStore(d.storeName),f=e.count();f.onsuccess=function(){a(f.result)},f.onerror=function(){c(f.error)}})["catch"](c)});return j(c,a),c}function h(a,b){var c=this,d=new m(function(b,d){return 0>a?void b(null):void c.ready().then(function(){var e=c._dbInfo,f=e.db.transaction(e.storeName,"readonly").objectStore(e.storeName),g=!1,h=f.openCursor();h.onsuccess=function(){var c=h.result;return c?void(0===a?b(c.key):g?b(c.key):(g=!0,c.advance(a))):void b(null)},h.onerror=function(){d(h.error)}})["catch"](d)});return j(d,b),d}function i(a){var b=this,c=new m(function(a,c){b.ready().then(function(){var d=b._dbInfo,e=d.db.transaction(d.storeName,"readonly").objectStore(d.storeName),f=e.openCursor(),g=[];f.onsuccess=function(){var b=f.result;return b?(g.push(b.key),void b["continue"]()):void a(g)},f.onerror=function(){c(f.error)}})["catch"](c)});return j(c,a),c}function j(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}function k(a,b){b&&a.then(function(a){l(b,a)},function(a){b(a)})}function l(a,b){return a?setTimeout(function(){return a(null,b)},0):void 0}var m="undefined"!=typeof module&&module.exports?require("promise"):this.Promise,n=n||this.indexedDB||this.webkitIndexedDB||this.mozIndexedDB||this.OIndexedDB||this.msIndexedDB;if(n){var o={_driver:"asyncStorage",_initStorage:a,iterate:c,getItem:b,setItem:d,removeItem:e,clear:f,length:g,key:h,keys:i};"function"==typeof define&&define.amd?define("asyncStorage",function(){return o}):"undefined"!=typeof module&&module.exports?module.exports=o:this.asyncStorage=o}}.call(window),function(){"use strict";function a(a){var b=this,c={};if(a)for(var d in a)c[d]=a[d];return c.keyPrefix=c.name+"/",b._dbInfo=c,n.resolve()}function b(a){var b=this,c=new n(function(a,c){b.ready().then(function(){for(var c=b._dbInfo.keyPrefix,d=o.length-1;d>=0;d--){var e=o.key(d);0===e.indexOf(c)&&o.removeItem(e)}a()})["catch"](c)});return m(c,a),c}function c(a,b){var c=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var d=new n(function(b,d){c.ready().then(function(){try{var e=c._dbInfo,f=o.getItem(e.keyPrefix+a);f&&(f=i(f)),b(f)}catch(g){d(g)}})["catch"](d)});return m(d,b),d}function d(a,b){var c=this,d=new n(function(b,d){c.ready().then(function(){try{for(var e=c._dbInfo.keyPrefix,f=e.length,g=o.length,h=0;g>h;h++){var j=o.key(h),k=o.getItem(j);if(k&&(k=i(k)),k=a(k,j.substring(f)),void 0!==k)return void b(k)}b()}catch(l){d(l)}})["catch"](d)});return m(d,b),d}function e(a,b){var c=this,d=new n(function(b,d){c.ready().then(function(){var d,e=c._dbInfo;try{d=o.key(a)}catch(f){d=null}d&&(d=d.substring(e.keyPrefix.length)),b(d)})["catch"](d)});return m(d,b),d}function f(a){var b=this,c=new n(function(a,c){b.ready().then(function(){for(var c=b._dbInfo,d=o.length,e=[],f=0;d>f;f++)0===o.key(f).indexOf(c.keyPrefix)&&e.push(o.key(f).substring(c.keyPrefix.length));a(e)})["catch"](c)});return m(c,a),c}function g(a){var b=this,c=new n(function(a,c){b.keys().then(function(b){a(b.length)})["catch"](c)});return m(c,a),c}function h(a,b){var c=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var d=new n(function(b,d){c.ready().then(function(){var d=c._dbInfo;o.removeItem(d.keyPrefix+a),b()})["catch"](d)});return m(d,b),d}function i(a){if(a.substring(0,r)!==q)return JSON.parse(a);for(var b=a.substring(D),c=a.substring(r,D),d=new ArrayBuffer(2*b.length),e=new Uint16Array(d),f=b.length-1;f>=0;f--)e[f]=b.charCodeAt(f);switch(c){case s:return d;case t:return new Blob([d]);case u:return new Int8Array(d);case v:return new Uint8Array(d);case w:return new Uint8ClampedArray(d);case x:return new Int16Array(d);case z:return new Uint16Array(d);case y:return new Int32Array(d);case A:return new Uint32Array(d);case B:return new Float32Array(d);case C:return new Float64Array(d);default:throw new Error("Unkown type: "+c)}}function j(a){var b="",c=new Uint16Array(a);try{b=String.fromCharCode.apply(null,c)}catch(d){for(var e=0;e<c.length;e++)b+=String.fromCharCode(c[e])}return b}function k(a,b){var c="";if(a&&(c=a.toString()),a&&("[object ArrayBuffer]"===a.toString()||a.buffer&&"[object ArrayBuffer]"===a.buffer.toString())){var d,e=q;a instanceof ArrayBuffer?(d=a,e+=s):(d=a.buffer,"[object Int8Array]"===c?e+=u:"[object Uint8Array]"===c?e+=v:"[object Uint8ClampedArray]"===c?e+=w:"[object Int16Array]"===c?e+=x:"[object Uint16Array]"===c?e+=z:"[object Int32Array]"===c?e+=y:"[object Uint32Array]"===c?e+=A:"[object Float32Array]"===c?e+=B:"[object Float64Array]"===c?e+=C:b(new Error("Failed to get type for BinaryArray"))),b(e+j(d))}else if("[object Blob]"===c){var f=new FileReader;f.onload=function(){var a=j(this.result);b(q+t+a)},f.readAsArrayBuffer(a)}else try{b(JSON.stringify(a))}catch(g){window.console.error("Couldn't convert value into a JSON string: ",a),b(g)}}function l(a,b,c){var d=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var e=new n(function(c,e){d.ready().then(function(){void 0===b&&(b=null);var f=b;k(b,function(b,g){if(g)e(g);else{try{var h=d._dbInfo;o.setItem(h.keyPrefix+a,b)}catch(i){("QuotaExceededError"===i.name||"NS_ERROR_DOM_QUOTA_REACHED"===i.name)&&e(i)}c(f)}})})["catch"](e)});return m(e,c),e}function m(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}var n="undefined"!=typeof module&&module.exports?require("promise"):this.Promise,o=null;try{if(!(this.localStorage&&"setItem"in this.localStorage))return;o=this.localStorage}catch(p){return}var q="__lfsc__:",r=q.length,s="arbf",t="blob",u="si08",v="ui08",w="uic8",x="si16",y="si32",z="ur16",A="ui32",B="fl32",C="fl64",D=r+s.length,E={_driver:"localStorageWrapper",_initStorage:a,iterate:d,getItem:c,setItem:l,removeItem:h,clear:b,length:g,key:e,keys:f};"function"==typeof define&&define.amd?define("localStorageWrapper",function(){return E}):"undefined"!=typeof module&&module.exports?module.exports=E:this.localStorageWrapper=E}.call(window),function(){"use strict";function a(a){var b=this,c={db:null};if(a)for(var d in a)c[d]="string"!=typeof a[d]?a[d].toString():a[d];return new o(function(d,e){try{c.db=p(c.name,String(c.version),c.description,c.size)}catch(f){return b.setDriver("localStorageWrapper").then(function(){return b._initStorage(a)}).then(d)["catch"](e)}c.db.transaction(function(a){a.executeSql("CREATE TABLE IF NOT EXISTS "+c.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],function(){b._dbInfo=c,d()},function(a,b){e(b)})})})}function b(a,b){var c=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var d=new o(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){c.executeSql("SELECT * FROM "+e.storeName+" WHERE key = ? LIMIT 1",[a],function(a,c){var d=c.rows.length?c.rows.item(0).value:null;d&&(d=k(d)),b(d)},function(a,b){d(b)})})})["catch"](d)});return m(d,b),d}function c(a,b){var c=this,d=new o(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){c.executeSql("SELECT * FROM "+e.storeName,[],function(c,d){for(var e=d.rows,f=e.length,g=0;f>g;g++){var h=e.item(g),i=h.value;if(i&&(i=k(i)),i=a(i,h.key),void 0!==i)return void b(i)}b()},function(a,b){d(b)})})})["catch"](d)});return m(d,b),d}function d(a,b,c){var d=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var e=new o(function(c,e){d.ready().then(function(){void 0===b&&(b=null);var f=b;l(b,function(b,g){if(g)e(g);else{var h=d._dbInfo;h.db.transaction(function(d){d.executeSql("INSERT OR REPLACE INTO "+h.storeName+" (key, value) VALUES (?, ?)",[a,b],function(){c(f)},function(a,b){e(b)})},function(a){a.code===a.QUOTA_ERR&&e(a)})}})})["catch"](e)});return m(e,c),e}function e(a,b){var c=this;"string"!=typeof a&&(window.console.warn(a+" used as a key, but it is not a string."),a=String(a));var d=new o(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){c.executeSql("DELETE FROM "+e.storeName+" WHERE key = ?",[a],function(){b()},function(a,b){d(b)})})})["catch"](d)});return m(d,b),d}function f(a){var b=this,c=new o(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){b.executeSql("DELETE FROM "+d.storeName,[],function(){a()},function(a,b){c(b)})})})["catch"](c)});return m(c,a),c}function g(a){var b=this,c=new o(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){b.executeSql("SELECT COUNT(key) as c FROM "+d.storeName,[],function(b,c){var d=c.rows.item(0).c;a(d)},function(a,b){c(b)})})})["catch"](c)});return m(c,a),c}function h(a,b){var c=this,d=new o(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){c.executeSql("SELECT key FROM "+e.storeName+" WHERE id = ? LIMIT 1",[a+1],function(a,c){var d=c.rows.length?c.rows.item(0).key:null;b(d)},function(a,b){d(b)})})})["catch"](d)});return m(d,b),d}function i(a){var b=this,c=new o(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){b.executeSql("SELECT key FROM "+d.storeName,[],function(b,c){for(var d=[],e=0;e<c.rows.length;e++)d.push(c.rows.item(e).key);a(d)},function(a,b){c(b)})})})["catch"](c)});return m(c,a),c}function j(a){var b,c=new Uint8Array(a),d="";for(b=0;b<c.length;b+=3)d+=n[c[b]>>2],d+=n[(3&c[b])<<4|c[b+1]>>4],d+=n[(15&c[b+1])<<2|c[b+2]>>6],d+=n[63&c[b+2]];return c.length%3===2?d=d.substring(0,d.length-1)+"=":c.length%3===1&&(d=d.substring(0,d.length-2)+"=="),d}function k(a){if(a.substring(0,r)!==q)return JSON.parse(a);var b,c,d,e,f,g=a.substring(D),h=a.substring(r,D),i=.75*g.length,j=g.length,k=0;"="===g[g.length-1]&&(i--,"="===g[g.length-2]&&i--);var l=new ArrayBuffer(i),m=new Uint8Array(l);for(b=0;j>b;b+=4)c=n.indexOf(g[b]),d=n.indexOf(g[b+1]),e=n.indexOf(g[b+2]),f=n.indexOf(g[b+3]),m[k++]=c<<2|d>>4,m[k++]=(15&d)<<4|e>>2,m[k++]=(3&e)<<6|63&f;switch(h){case s:return l;case t:return new Blob([l]);case u:return new Int8Array(l);case v:return new Uint8Array(l);case w:return new Uint8ClampedArray(l);case x:return new Int16Array(l);case z:return new Uint16Array(l);case y:return new Int32Array(l);case A:return new Uint32Array(l);case B:return new Float32Array(l);case C:return new Float64Array(l);default:throw new Error("Unkown type: "+h)}}function l(a,b){var c="";if(a&&(c=a.toString()),a&&("[object ArrayBuffer]"===a.toString()||a.buffer&&"[object ArrayBuffer]"===a.buffer.toString())){var d,e=q;a instanceof ArrayBuffer?(d=a,e+=s):(d=a.buffer,"[object Int8Array]"===c?e+=u:"[object Uint8Array]"===c?e+=v:"[object Uint8ClampedArray]"===c?e+=w:"[object Int16Array]"===c?e+=x:"[object Uint16Array]"===c?e+=z:"[object Int32Array]"===c?e+=y:"[object Uint32Array]"===c?e+=A:"[object Float32Array]"===c?e+=B:"[object Float64Array]"===c?e+=C:b(new Error("Failed to get type for BinaryArray"))),b(e+j(d))}else if("[object Blob]"===c){var f=new FileReader;f.onload=function(){var a=j(this.result);b(q+t+a)},f.readAsArrayBuffer(a)}else try{b(JSON.stringify(a))}catch(g){window.console.error("Couldn't convert value into a JSON string: ",a),b(null,g)}}function m(a,b){b&&a.then(function(a){b(null,a)},function(a){b(a)})}var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",o="undefined"!=typeof module&&module.exports?require("promise"):this.Promise,p=this.openDatabase,q="__lfsc__:",r=q.length,s="arbf",t="blob",u="si08",v="ui08",w="uic8",x="si16",y="si32",z="ur16",A="ui32",B="fl32",C="fl64",D=r+s.length;if(p){var E={_driver:"webSQLStorage",_initStorage:a,iterate:c,getItem:b,setItem:d,removeItem:e,clear:f,length:g,key:h,keys:i};"function"==typeof define&&define.amd?define("webSQLStorage",function(){return E}):"undefined"!=typeof module&&module.exports?module.exports=E:this.webSQLStorage=E}}.call(window),function(){"use strict";function a(a,b){a[b]=function(){var c=arguments;return a.ready().then(function(){return a[b].apply(a,c)})}}function b(){for(var a=1;a<arguments.length;a++){var b=arguments[a];if(b)for(var c in b)b.hasOwnProperty(c)&&(arguments[0][c]=n(b[c])?b[c].slice():b[c])}return arguments[0]}function c(a){for(var b in g)if(g.hasOwnProperty(b)&&g[b]===a)return!0;return!1}function d(c){this._config=b({},k,c),this._driverSet=null,this._ready=!1,this._dbInfo=null;for(var d=0;d<i.length;d++)a(this,i[d]);this.setDriver(this._config.driver)}var e="undefined"!=typeof module&&module.exports?require("promise"):this.Promise,f={},g={INDEXEDDB:"asyncStorage",LOCALSTORAGE:"localStorageWrapper",WEBSQL:"webSQLStorage"},h=[g.INDEXEDDB,g.WEBSQL,g.LOCALSTORAGE],i=["clear","getItem","iterate","key","keys","length","removeItem","setItem"],j={DEFINE:1,EXPORT:2,WINDOW:3},k={description:"",driver:h.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1},l=j.WINDOW;"function"==typeof define&&define.amd?l=j.DEFINE:"undefined"!=typeof module&&module.exports&&(l=j.EXPORT);var m=function(a){var b=b||a.indexedDB||a.webkitIndexedDB||a.mozIndexedDB||a.OIndexedDB||a.msIndexedDB,c={};return c[g.WEBSQL]=!!a.openDatabase,c[g.INDEXEDDB]=!!function(){if("undefined"!=typeof a.openDatabase&&a.navigator&&a.navigator.userAgent&&/Safari/.test(a.navigator.userAgent)&&!/Chrome/.test(a.navigator.userAgent))return!1;try{return b&&"function"==typeof b.open&&"undefined"!=typeof a.IDBKeyRange}catch(c){return!1}}(),c[g.LOCALSTORAGE]=!!function(){try{return a.localStorage&&"setItem"in a.localStorage&&a.localStorage.setItem}catch(b){return!1}}(),c}(this),n=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)},o=this;d.prototype.INDEXEDDB=g.INDEXEDDB,d.prototype.LOCALSTORAGE=g.LOCALSTORAGE,d.prototype.WEBSQL=g.WEBSQL,d.prototype.config=function(a){if("object"==typeof a){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var b in a)"storeName"===b&&(a[b]=a[b].replace(/\W/g,"_")),this._config[b]=a[b];return"driver"in a&&a.driver&&this.setDriver(this._config.driver),!0}return"string"==typeof a?this._config[a]:this._config},d.prototype.defineDriver=function(a,b,d){var g=new e(function(b,d){try{var g=a._driver,h=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver"),j=new Error("Custom driver name already in use: "+a._driver);if(!a._driver)return void d(h);if(c(a._driver))return void d(j);for(var k=i.concat("_initStorage"),l=0;l<k.length;l++){var n=k[l];if(!n||!a[n]||"function"!=typeof a[n])return void d(h)}var o=e.resolve(!0);"_support"in a&&(o=a._support&&"function"==typeof a._support?a._support():e.resolve(!!a._support)),o.then(function(c){m[g]=c,f[g]=a,b()},d)}catch(p){d(p)}});return g.then(b,d),g},d.prototype.driver=function(){return this._driver||null},d.prototype.ready=function(a){var b=this,c=new e(function(a,c){b._driverSet.then(function(){null===b._ready&&(b._ready=b._initStorage(b._config)),b._ready.then(a,c)})["catch"](c)});return c.then(a,a),c},d.prototype.setDriver=function(a,b,d){function g(){h._config.driver=h.driver()}var h=this;return"string"==typeof a&&(a=[a]),this._driverSet=new e(function(b,d){var g=h._getFirstSupportedDriver(a),i=new Error("No available storage method found.");if(!g)return h._driverSet=e.reject(i),void d(i);if(h._dbInfo=null,h._ready=null,c(g)){if(l===j.DEFINE)return void require([g],function(a){h._extend(a),b()});if(l===j.EXPORT){var k;switch(g){case h.INDEXEDDB:k=require("./drivers/indexeddb");break;case h.LOCALSTORAGE:k=require("./drivers/localstorage");break;case h.WEBSQL:k=require("./drivers/websql")}h._extend(k)}else h._extend(o[g])}else{if(!f[g])return h._driverSet=e.reject(i),void d(i);h._extend(f[g])}b()}),this._driverSet.then(g,g),this._driverSet.then(b,d),this._driverSet},d.prototype.supports=function(a){return!!m[a]},d.prototype._extend=function(a){b(this,a)},d.prototype._getFirstSupportedDriver=function(a){if(a&&n(a))for(var b=0;b<a.length;b++){var c=a[b];if(this.supports(c))return c}return null},d.prototype.createInstance=function(a){return new d(a)};var p=new d;l===j.DEFINE?define("localforage",function(){return p}):l===j.EXPORT?module.exports=p:this.localforage=p}.call(window);
  
  /*@source p0ne.auxiliaries.ls */
  /**
   * Auxiliary-functions for plug_p0ne
   *
   * @author jtbrinkmann aka. Brinkie Pie
   * @license MIT License
   * @copyright (c) 2015 J.-T. Brinkmann
  */
  out$.$window = $window = $(window);
  out$.$body = $body = $(document.body);
  /**/
  window.require = window.requirejs;
  window.define = window.requirejs.define;
  /*/ # no RequireJS fix
  (localforage) <- require <[ localforage ]>
  /**/
  out$.localforage = localforage;
  /*####################################
  #         PROTOTYPE FUNCTIONS        #
  ####################################*/
  tmp = function(property, value){
    if (this[property] !== value) {
      Object.defineProperty(this, property, {
        enumerable: false,
        writable: true,
        configurable: true,
        value: value
      });
    }
  };
  tmp.call(Object.prototype, 'define', tmp);
  Object.prototype.define('defineGetter', function(property, get){
    if (this[property] !== get) {
      Object.defineProperty(this, property, {
        enumerable: false,
        configurable: true,
        get: get
      });
    }
  });
  Object.prototype.define('hasAttribute', function(property){
    return property in this;
  });
  Array.prototype.define('remove', function(i){
    return this.splice(i, 1);
  });
  Array.prototype.define('removeItem', function(el){
    var i;
    if (-1 !== (i = this.indexOf(el))) {
      this.splice(i, 1);
    }
    return this;
  });
  Array.prototype.define('random', function(){
    return this[~~(Math.random() * this.length)];
  });
  Array.prototype.define('unique', function(){
    var res, l, i$, len$, i, el, j$, yet$, o;
    res = [];
    l = 0;
    for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
      i = i$;
      el = this[i$];
      for (yet$ = true, j$ = 0; j$ < i; ++j$) {
        o = j$;
        yet$ = false;
        if (this[o] === el) {
          break;
        }
      } if (yet$) {
        res[l++] = el;
      }
    }
    return res;
  });
  String.prototype.define('reverse', function(){
    var res, i;
    res = "";
    i = this.length;
    while (i--) {
      res += this[i];
    }
    return res;
  });
  String.prototype.define('startsWith', function(str){
    var i, c;
    i = 0;
    while (c = str[i]) {
      if (c !== this[i++]) {
        return false;
      }
    }
    return true;
  });
  String.prototype.define('endsWith', function(str){
    return this.substr(this.length - str.length) === str;
  });
  for (i$ = 0, len$ = (ref$ = [String, Array]).length; i$ < len$; ++i$) {
    Constr = ref$[i$];
    Constr.prototype.define('has', fn$);
    Constr.prototype.define('hasAny', fn1$);
  }
  Number.prototype.defineGetter('s', function(){
    return this * 1000;
  });
  Number.prototype.defineGetter('min', function(){
    return this * 60000;
  });
  Number.prototype.defineGetter('h', function(){
    return this * 3600000;
  });
  importAll$(jQuery.fn, {
    indexOf: function(selector){
      /* selector may be a String jQuery Selector or an HTMLElement */
      var i, i$, len$, el;
      if (this.length && !(selector instanceof HTMLElement)) {
        i = [].indexOf.call(this, selector);
        if (i !== -1) {
          return i;
        }
      }
      for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
        i = i$;
        el = this[i$];
        if (jQuery(el).is(selector)) {
          return i;
        }
      }
      return -1;
    },
    concat: function(arr2){
      var l, i$, len$, i, el;
      l = this.length;
      if (!arr2 || !arr2.length) {
        return this;
      }
      if (!l) {
        return arr2;
      }
      for (i$ = 0, len$ = arr2.length; i$ < len$; ++i$) {
        i = i$;
        el = arr2[i$];
        this[i + l] = el;
      }
      this.length += arr2.length;
      return this;
    },
    fixSize: function(){
      var i$, len$, el;
      for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
        el = this[i$];
        el.style.width = el.width + "px";
        el.style.height = el.height + "px";
      }
      return this;
    },
    loadAll: function(cb){
      var remaining;
      remaining = this.length;
      if (!cb || !remaining) {
        return;
      }
      this.load(function(){
        if (--remaining === 0) {
          cb();
        }
      });
    }
  });
  importAll$($.easing, {
    easeInQuad: function(p){
      return p * p;
    },
    easeOutQuad: function(p){
      return 1 - (1 - p) * (1 - p);
    }
  });
  /*####################################
  #            DATA MANAGER            #
  ####################################*/
  if (window.chrome) {
    window.compress = LZString.compress, window.decompress = LZString.decompress;
  } else {
    window.compress = LZString.compressToUTF16, window.decompress = LZString.decompressFromUTF16;
  }
  window.dataLoad = function(name, defaultVal, callback){
    defaultVal == null && (defaultVal = {});
    if (p0ne.autosave[name]) {
      p0ne.autosave_num[name]++;
      return callback(null, p0ne.autosave[name]);
    }
    p0ne.autosave_num[name] = 0;
    localforage.getItem(name, function(err, data){
      var warning, errorCode, name_;
      if (err) {
        warning = "failed to load '" + name + "' from localforage";
        errorCode = 'localforage';
      } else if (data) {
        p0ne.autosave[name] = data;
        return callback(err, data);
        /*
        if decompress(data)
            try
                p0ne.autosave[name]=JSON.parse(that)
                return callback err, p0ne.autosave[name]
            catch err
                warning = "failed to parse '#name' as JSON"
                errorCode = \JSON
        else
            warning = "failed to decompress '#name' data"
            errorCode = \decompress
        */
      } else {
        p0ne.autosave[name] = defaultVal;
        return callback(err, defaultVal);
      }
      name_ = name + "_" + getISOTime();
      console.warn(getTime() + " [dataLoad] " + warning + ", it seems to be corrupted! making a backup to '" + name_ + "' and continuing with default value", err);
      localforage.setItem(name_, data);
      p0ne.autosave[name] = defaultVal;
      callback(new TypeError("data corrupted (" + errorCode + ")"), defaultVal);
    });
  };
  window.dataLoadAll = function(defaults, callback){
    /*defaults is to be in the format `{name: defaultVal, name2: defaultVal2, …}` where `name` is the name of the data to load */
    var remaining, name, errors, hasError, res, i$;
    remaining = 0;
    for (name in defaults) {
      remaining++;
    }
    if (remaining === 0) {
      callback(null, {});
    } else {
      errors = {};
      hasError = false;
      res = {};
      for (i$ in defaults) {
        (fn$.call(this, i$, defaults[i$]));
      }
    }
    function fn$(name, defaultVal){
      dataLoad(name, defaultVal, function(err, data){
        if (err) {
          hasError = true;
          errors[name] = err;
        }
        res[name] = data;
        if (--remaining === 0) {
          if (!hasError) {
            errors = null;
          }
          callback(errors, res);
        }
      });
    }
  };
  window.dataUnload = function(name){
    if (p0ne.autosave_num[name]) {
      p0ne.autosave_num[name]--;
    }
    if (p0ne.autosave_num[name] === 0) {
      delete p0ne.autosave[name];
    }
  };
  window.dataSave = function(){
    var err, k, ref$, v, _, e;
    err = "";
    for (k in ref$ = p0ne.autosave) {
      v = ref$[k];
      if (v) {
        for (_ in v) {
          try {
            localforage.setItem(k, v);
          } catch (e$) {
            e = e$;
            err += "failed to store '" + k + "' to localStorage\n";
          }
          break;
        }
      }
    }
    if (err) {
      alert(err);
    } else {
      console.log("[Data Manager] saved data");
    }
  };
  $window.on('beforeunload', dataSave);
  dataSave.interval = setInterval(dataSave, 15 .min);
  /*####################################
  #            DATA EMITTER            #
  ####################################*/
  DataEmitter = (function(superclass){
    var prototype = extend$((import$(DataEmitter, superclass).displayName = 'DataEmitter', DataEmitter), superclass).prototype, constructor = DataEmitter;
    function DataEmitter(_name){
      this._name = _name;
    }
    prototype._name = 'unnamed StateEmitter';
    prototype.set = function(newData){
      if (this._data !== newData) {
        this._data = newData;
        return this.trigger('data', this._data);
      }
    };
    prototype.clear = function(){
      delete this._data;
      return this._trigger('cleared');
    };
    prototype.on = function(type, fn, context){
      var e;
      superclass.prototype.on.apply(this, arguments);
      if (this._data && (type === 'data' || type === 'all')) {
        try {
          return fn.call(context || this, this._data);
        } catch (e$) {
          e = e$;
          return console.error("[" + this._name + "] Error while triggering " + type + " [" + (this._listeners[type].length - 1) + "]", this, args, e.stack);
        }
      }
    };
    prototype.data = function(fn, context){
      return this.on('data', fn, context);
    };
    prototype.cleared = function(fn, context){
      return this.on('cleared', fn, context);
    };
    return DataEmitter;
  }({
    prototype: Backbone.Events
  }));
  /*####################################
  #         GENERAL AUXILIARIES        #
  ####################################*/
  $dummy = $('<a>');
  importAll$(window, {
    YT_REGEX: /https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|embed|e)\/|.*(?:\?|&amp;)v=)|youtu\.be\/)([^"&?\/<>\s]{11})(?:&.*?|#.*?|)$/i,
    repeat: function(timeout, fn){
      return setInterval(function(){
        if (!disabled) {
          fn.apply(this, arguments);
        }
      }, timeout);
    },
    sleep: function(timeout, fn){
      return setTimeout(fn, timeout);
    },
    throttle: function(timeout, fn){
      return _.throttle(fn, timeout);
    },
    pad: function(num, digits){
      var a, b;
      if (digits) {
        if (!isFinite(num)) {
          return num + "";
        }
        a = ~~num;
        b = (num - a) + "";
        num = a + "";
        while (num.length < digits) {
          num = "0" + num;
        }
        return num + "" + b.substr(1);
      } else {
        return 0 <= num && num < 10
          ? "0" + num
          : num + "";
      }
    },
    generateID: function(){
      return (~~(Math.random() * 0xFFFFFF)).toString(16).toUpperCase();
    },
    getUser: function(user){
      var that, userList, i$, len$, u;
      if (!user) {
        return;
      }
      if (typeof user === 'object') {
        if (that = user.id && getUser(user.id)) {
          return that;
        }
        if (user.username) {
          return user;
        } else if (user.attributes && user.toJSON) {
          return user.toJSON();
        } else if (that = user.username || user.dj || user.user || user.uid) {
          return getUser(that);
        }
        return null;
      }
      userList = API.getUsers();
      if (+user) {
        if (that = typeof users != 'undefined' && users !== null ? typeof users.get === 'function' ? users.get(user) : void 8 : void 8) {
          return that.toJSON();
        } else {
          for (i$ = 0, len$ = userList.length; i$ < len$; ++i$) {
            u = userList[i$];
            if (u.id === user) {
              return u;
            }
          }
        }
      } else if (typeof user === 'string') {
        for (i$ = 0, len$ = userList.length; i$ < len$; ++i$) {
          u = userList[i$];
          if (u.username === user) {
            return u;
          }
        }
        user = user.toLowerCase();
        for (i$ = 0, len$ = userList.length; i$ < len$; ++i$) {
          u = userList[i$];
          if (u.username.toLowerCase() === user) {
            return u;
          }
        }
      } else {
        console.warn("unknown user format", user);
      }
    },
    getUserInternal: function(user){
      var that, i$, ref$, len$, u;
      if (!user || !users) {
        return;
      }
      if (typeof user === 'object') {
        if (that = user.id && getUserInternal(user.id)) {
          return that;
        }
        if (user.attributes) {
          return user;
        } else if (that = user.username || user.dj || user.user || user.id) {
          return getUserInternal(that);
        }
        return null;
      }
      if (+user) {
        return users.get(user);
      } else if (typeof user === 'string') {
        for (i$ = 0, len$ = (ref$ = users.models).length; i$ < len$; ++i$) {
          u = ref$[i$];
          if (u.get('username') === user) {
            return u;
          }
        }
        user = user.toLowerCase();
        for (i$ = 0, len$ = (ref$ = users.models).length; i$ < len$; ++i$) {
          u = ref$[i$];
          if (u.get('username').toLowerCase() === user) {
            return u;
          }
        }
      } else {
        console.warn("unknown user format", user);
      }
    },
    logger: function(loggerName, fn){
      if (typeof fn === 'function') {
        return function(){
          console.log("[" + loggerName + "]", arguments);
          return fn.apply(this, arguments);
        };
      } else {
        return function(){
          console.log("[" + loggerName + "]", arguments);
        };
      }
    },
    replace: function(context, attribute, cb){
      var key$;
      context[key$ = attribute + "_"] || (context[key$] = context[attribute]);
      context[attribute] = cb(context[attribute + "_"]);
    },
    loadScript: function(loadedEvent, data, file, callback){
      var d;
      d = $.Deferred();
      if (callback) {
        d.then(callback);
      }
      if (data) {
        d.resolve();
      } else {
        $.getScript(p0ne.host + "/" + file);
        $(window).one(loadedEvent, d.resolve);
      }
      return d.promise();
    },
    requireHelper: function(name, test, arg$){
      var ref$, id, onfail, fallback, module, res;
      ref$ = arg$ != null ? arg$ : 0, id = ref$.id, onfail = ref$.onfail, fallback = ref$.fallback;
      if ((module = window[name] || require.s.contexts._.defined[id]) && test(module)) {
        id = module.requireID;
        res = module;
      } else if ((id = requireIDs[name]) && (module = require.s.contexts._.defined[id]) && test(module)) {
        res = module;
      } else {
        for (id in ref$ = require.s.contexts._.defined) {
          module = ref$[id];
          if (module && test(module, id)) {
            console.warn("[requireHelper] module '" + name + "' updated to ID '" + id + "'");
            requireIDs[name] = id;
            res = module;
            break;
          }
        }
      }
      if (res) {
        res.requireID = id;
        if (name) {
          window[name] = res;
        }
        return res;
      } else {
        console.error("[requireHelper] could not require '" + name + "'");
        if (typeof onfail === 'function') {
          onfail();
        }
        if (name) {
          window[name] = fallback;
        }
        return fallback;
      }
    },
    requireAll: function(test){
      var id, m;
      return (function(){
        var ref$, results$ = [];
        for (id in ref$ = require.s.contexts._.defined) {
          m = ref$[id];
          if (m && test(m, id)) {
            results$.push(m);
          }
        }
        return results$;
      }());
    }
    /* callback gets called with the arguments cb(errorCode, response, event) */,
    floodAPI_counter: 0,
    ajax: function(type, url, data, cb){
      var ref$, success, error, fail, silent, options, def, delay;
      if (typeof url !== 'string') {
        ref$ = [type, url, data], url = ref$[0], data = ref$[1], cb = ref$[2];
        type = (data != null ? data.type : void 8) || 'POST';
      }
      if (typeof data === 'function') {
        success = data;
        data = null;
      } else if (typeof cb === 'function') {
        success = cb;
      } else if (data && (data.success || data.error)) {
        success = data.success, error = data.error;
        delete data.success;
        delete data.error;
      } else if (typeof cb === 'object') {
        if (cb) {
          success = cb.success, fail = cb.fail;
        }
      }
      if (data) {
        silent = data.silent;
        delete data.type;
        delete data.silent;
      }
      options = {
        type: type,
        url: "https://plug.dj/_/" + url,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(arg$){
          var data;
          data = arg$.data;
          if (!silent) {
            console.info("[" + url + "]", data);
          }
          if (typeof success === 'function') {
            success(data);
          }
        },
        error: function(err){
          if (!silent) {
            console.error("[" + url + "]", data);
          }
          if (typeof error === 'function') {
            error(data);
          }
        }
      };
      def = $.Deferred();
      (delay = function(){
        if (window.floodAPI_counter >= 15) {
          sleep(1000, delay);
        } else {
          window.floodAPI_counter++;
          sleep(10000, function(){
            window.floodAPI_counter--;
          });
          return $.ajax(options).then(def.resolve, def.reject, def.progress);
        }
      })();
      return def;
    },
    befriend: function(userID, cb){
      ajax('POST', "friends", {
        id: userID
      }, cb);
    },
    ban: function(userID, cb){
      ajax('POST', "bans/add", {
        userID: userID,
        duration: API.BAN.HOUR,
        reason: 1
      }, cb);
    },
    banPerma: function(userID, cb){
      ajax('POST', "bans/add", {
        userID: userID,
        duration: API.BAN.PERMA,
        reason: 1
      }, cb);
    },
    unban: function(userID, cb){
      ajax('DELETE', "bans/" + userID, cb);
    },
    modMute: function(userID, cb){
      ajax('POST', "mutes/add", {
        userID: userID,
        duration: API.MUTE.SHORT,
        reason: 1
      }, cb);
    },
    modUnmute: function(userID, cb){
      ajax('DELETE', "mutes/" + userID, cb);
    },
    chatDelete: function(chatID, cb){
      ajax('DELETE', "chat/" + chatID, cb);
    },
    kick: function(userID, cb){
      var def;
      def = $.Deferred();
      ban(userID).then(function(){
        unban(userID, cb).then(def.resolve, def.reject);
      }).fail(def.reject);
    },
    addDJ: function(userID, cb){
      var i$, ref$, len$, yet$, u;
      for (yet$ = true, i$ = 0, len$ = (ref$ = API.getWaitList()).length; i$ < len$; ++i$) {
        u = ref$[i$];
        yet$ = false;
        if (u.id === userID) {
          cb('alreadyInWaitlist');
          return $.Deferred().resolve('alreadyInWaitlist');
        }
      } if (yet$) {
        return ajax('POST', "booth/add", {
          id: userID
        }, cb);
      }
    },
    moveDJ: function(userID, position, cb){
      var def;
      def = $.Deferred;
      addDJ(userID).then(function(){
        ajax('POST', "booth/move", {
          userID: userID,
          position: position
        }, cb).then(def.resolve, def.reject);
      }).fail(def.reject);
      return def.promise();
    },
    getUserData: function(user, cb){
      if (typeof user !== 'number') {
        user = getUser(user);
      }
      cb || (cb = function(data){
        console.log("[userdata]", data, data.level >= 5 ? "https://plug.dj/@/" + encodeURI(data.slug) : void 8);
      });
      return $.get("/_/users/" + user).then(function(arg){
        var data;
        data = arg.data, data = data[0];
        return data;
      }).fail(function(){
        console.warn("couldn't get slug for user with id '" + id + "'");
      });
    },
    $djButton: $('#dj-button'),
    mute: function(){
      return $('#volume .icon-volume-half, #volume .icon-volume-on').click().length;
    },
    muteonce: function(){
      mute();
      muteonce.last = API.getMedia().id;
      API.once('advance', function(){
        if (API.getMedia().id !== muteonce.last) {
          unmute();
        }
      });
    },
    unmute: function(){
      return $('#playback .snoozed .refresh, #volume .icon-volume-off, #volume .icon-volume-mute-once'.click()).length;
    },
    snooze: function(){
      return $('#playback .snooze').click().length;
    },
    isSnoozed: function(){
      $('#playback-container').children().length === 0;
    },
    refresh: function(){
      return $('#playback .refresh').click().length;
    },
    stream: function(val){
      if (!currentMedia) {
        console.error("[p0ne /stream] cannot change stream - failed to require() the module 'currentMedia'");
      } else {
        if (typeof database != 'undefined' && database !== null) {
          database.settings.streamDisabled = val !== true && (val === false || currentMedia.get('streamDisabled'));
        }
      }
    },
    join: function(){
      if ($djButton.hasClass('is-wait')) {
        $djButton.click();
        return true;
      } else {
        return false;
      }
    },
    leave: function(){
      return $('#dj-button.is-leave').click().length !== 0;
    },
    ytItags: function(){
      var resolutions, list, ytItags, i$, len$, format, j$, ref$, len1$, i, itags, startI, k$, ref1$, len2$, itag;
      resolutions = [72, 144, 240, 360, 480, 720, 1080, 1440, 2160, 2304, 3072, 4320];
      list = [
        {
          ext: 'flv',
          minRes: 240,
          itags: ['5']
        }, {
          ext: '3gp',
          minRes: 144,
          itags: ['17', '36']
        }, {
          ext: 'mp4',
          minRes: 240,
          itags: ['83', '18,82', '_', '22,84', '85']
        }, {
          ext: 'webm',
          minRes: 360,
          itags: ['43,100']
        }, {
          ext: 'ts',
          minRes: 240,
          itags: ['151', '132,92', '93', '94', '95', '96']
        }
      ];
      ytItags = {};
      for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
        format = list[i$];
        for (j$ = 0, len1$ = (ref$ = format.itags).length; j$ < len1$; ++j$) {
          i = j$;
          itags = ref$[j$];
          if (itags !== '_') {
            startI = resolutions.indexOf(format.minRes);
            for (k$ = 0, len2$ = (ref1$ = itags.split(",")).length; k$ < len2$; ++k$) {
              itag = ref1$[k$];
              if (resolutions[startI + i] === 2304) {
                console.log(itag);
              }
              ytItags[itag] = {
                itag: itag,
                ext: format.ext,
                type: format.type || 'video',
                resolution: resolutions[startI + i]
              };
            }
          }
        }
      }
      return ytItags;
    }(),
    mediaSearch: function(query){
      $('#playlist-button .icon-playlist').click();
      $('#search-input-field').val(query).trigger({
        type: 'keyup',
        which: 13
      });
    },
    mediaParse: function(media, cb){
      /* work in progress */
      var cid, ref$;
      cb || (cb = logger(typeof media === 'string'
        ? +media
          ? cb({
            format: 2,
            cid: media
          })
          : media.length === 11
            ? cb({
              format: 1,
              cid: media
            })
            : (cid = (ref$ = YT_REGEX.exec(media)) != null ? ref$[1] : void 8)
              ? cb({
                format: 1,
                cid: cid
              })
              : (ref$ = parseURL(media).hostname) === 'soundcloud.com' || ref$ === 'i1.sndcdn.com' ? $.getJSON("https://api.soundcloud.com/resolve/", {
                url: url,
                client_id: p0ne.SOUNDCLOUD_KEY.then(function(d){
                  cb({
                    format: 2,
                    cid: d.id,
                    data: d
                  });
                })
              }) : void 8
        : typeof media === 'object' && media
          ? media.toJSON
            ? cb(media.toJSON())
            : media.format ? cb(media) : void 8
          : !media ? cb(API.getMedia()) : void 8));
      cb();
    },
    mediaLookup: function(url, cb){
      var format, id, cid, success, fail, def, ref$, req;
      format = url.format, id = url.id, cid = url.cid;
      if (typeof cb === 'function') {
        success = cb;
      } else {
        if (typeof cb === 'object') {
          if (cb) {
            success = cb.success, fail = cb.fail;
          }
        }
        success || (success = function(data){
          console.info("[mediaLookup] " + ['yt', 'sc'][format - 1] + ":" + cid, data);
        });
      }
      fail || (fail = function(err){
        console.error("[mediaLookup] couldn't look up", cid, url, cb, err);
      });
      def = $.Deferred();
      def.then(success, fail);
      if (typeof url === 'string') {
        if (cid = (ref$ = YT_REGEX.exec(url)) != null ? ref$[1] : void 8) {
          format = 1;
        } else if ((ref$ = parseURL(url).hostname) === 'soundcloud.com' || ref$ === 'i1.sndcdn.com') {
          format = 2;
        }
      } else {
        cid || (cid = id);
      }
      if (window.mediaLookup.lastID === (cid || url) && window.mediaLookup.lastData) {
        success(window.mediaLookup.lastData);
      } else {
        window.mediaLookup.lastID = cid || url;
        window.mediaLookup.lastData = null;
      }
      if (format === 1) {
        /*# Youtube API v2
        $.getJSON "https://gdata.youtube.com/feeds/api/videos/#cid?v=2&alt=json"
            .fail fail
            .success (d) !->
                cid = d.entry.id.$t.substr(27)
                def.resolve do
                    window.mediaLookup.lastData =
                        format:       1
                        data:         d
                        cid:          cid
                        uploader:
                            name:     d.entry.author.0.name.$t
                            id:       d.entry.media$group.yt$uploaderId.$t
                            url:      "https://www.youtube.com/channel/#{d.entry.media$group.yt$uploaderId.$t}"
                        image:        "https://i.ytimg.com/vi/#cid/0.jpg"
                        title:        d.entry.title.$t
                        uploadDate:   d.entry.published.$t
                        url:          "https://youtube.com/watch?v=#cid"
                        description:  d.entry.media$group.media$description.$t
                        duration:     d.entry.media$group.yt$duration.seconds # in s
        
                        restriction:  if d.data.entry.media$group.media$restriction
                            blocked: that
        */
        $.getJSON("https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&maxResults=1&id=" + cid + "&key=" + p0ne.YOUTUBE_V3_KEY).fail(fail).success(function(arg$){
          var d, cid, duration, that;
          d = arg$.items[0];
          cid = d.id;
          duration = 0;
          if (that = /PT(\d+)M(\d+)S/.exec(d.contentDetails.duration)) {
            duration = that[1] * 60 + that[2];
          }
          def.resolve(window.mediaLookup.lastData = {
            format: 1,
            data: d,
            cid: cid,
            uploader: {
              name: d.snippet.channelTitle,
              id: d.snippet.channelID,
              url: "https://www.youtube.com/channel/" + d.snippet.channelID
            },
            image: "https://i.ytimg.com/vi/" + cid + "/0.jpg",
            title: d.snippet.title,
            uploadDate: d.snippet.publishedAt,
            url: "https://youtube.com/watch?v=" + cid,
            description: d.snippet.description,
            duration: duration,
            restriction: d.contentDetails.regionRestriction
          });
        });
      } else if (format === 2) {
        if (cid) {
          req = $.getJSON("https://api.soundcloud.com/tracks/" + cid + ".json", {
            client_id: p0ne.SOUNDCLOUD_KEY
          });
        } else {
          req = $.getJSON("https://api.soundcloud.com/resolve/", {
            url: url,
            client_id: p0ne.SOUNDCLOUD_KEY
          });
        }
        req.fail(fail).success(function(d){
          def.resolve(window.mediaLookup.lastData = {
            format: 2,
            data: d,
            cid: cid,
            uploader: {
              id: d.user.id,
              name: d.user.username,
              image: d.user.avatar_url,
              url: d.user.permalink_url
            },
            image: d.artwork_url,
            title: d.title,
            uploadDate: d.created_at,
            url: d.permalink_url,
            description: d.description,
            duration: d.duration / 1000,
            download: d.download_url ? d.download_url + ("?client_id=" + p0ne.SOUNDCLOUD_KEY) : false,
            downloadSize: d.original_content_size,
            downloadFormat: d.original_format
          });
        });
      } else {
        def.reject("unsupported format");
      }
      return def;
    },
    mediaDownload: function(){
      var regexNormal, regexUnblocked, i$, ref$, len$, key;
      regexNormal = {};
      regexUnblocked = {};
      for (i$ = 0, len$ = (ref$ = ['title', 'url_encoded_fmt_stream_map', 'fmt_list', 'dashmpd', 'errorcode', 'reason']).length; i$ < len$; ++i$) {
        key = ref$[i$];
        regexNormal[key] = RegExp(key + '=(.*?)(?:&|$)');
        regexUnblocked[key] = RegExp('"' + key + '":"(.*?)"');
      }
      for (i$ = 0, len$ = (ref$ = ['url', 'itag', 'type', 'fallback_host']).length; i$ < len$; ++i$) {
        key = ref$[i$];
        regexNormal[key] = RegExp(key + '=(.*?)(?:&|$)');
        regexUnblocked[key] = RegExp(key + '=(.*?)(?:\\\\u0026|$)');
      }
      return function(media, audioOnly, cb){
        /* status codes:
            = success = (resolved)
            0 - downloads found
        
            = error = (rejected)
            1 - failed to receive video info
            2 - video info loaded, but no downloads found (video likely blocked)
            3 - (for audioOnly) dash.mpd found, but no downloads (basically like 2)
        
            note: itags are Youtube's code describing the data format
                https://en.wikipedia.org/wiki/YouTube#Quality_and_formats
                (click [show] in "Comparison of YouTube media encoding options" to see the whole table)
         */
        var ref$, success, error, blocked, format, cid, id, res, url;
        if (!media || typeof media === 'boolean' || typeof media === 'function' || media.success || media.error) {
          ref$ = [false, media, cb], media = ref$[0], audioOnly = ref$[1], cb = ref$[2];
        } else if (typeof audioOnly !== 'boolean') {
          cb = audioOnly;
          audioOnly = false;
        }
        if (typeof cb === 'function') {
          success = cb;
        } else if (cb) {
          success = cb.success, error = cb.error;
        }
        if (media != null && media.attributes) {
          blocked = media.blocked;
          media = media.attributes;
        } else if (!media) {
          media = API.getMedia();
          blocked = 0;
        } else {
          blocked = media.blocked;
        }
        format = media.format, cid = media.cid, id = media.id;
        media.blocked = blocked = +blocked || 0;
        if (format === 2) {
          audioOnly = true;
        }
        res = $.Deferred();
        res.then(function(data){
          data.blocked = blocked;
          if (audioOnly) {
            return media.downloadAudio = data;
          } else {
            return media.download = data;
          }
        }).fail(function(err, status){
          if (status) {
            err = {
              status: 1,
              message: "network error or request rejected"
            };
          }
          err.blocked = blocked;
          if (audioOnly) {
            return media.downloadAudioError = err;
          } else {
            return media.downloadError = err;
          }
        }).then(success || logger('mediaDownload')).fail(error || logger('mediaDownloadError'));
        if (audioOnly) {
          if (((ref$ = media.downloadAudio) != null ? ref$.blocked : void 8) === blocked) {
            return res.resolve(media.downloadAudio);
          }
          if (media.downloadAudioError) {
            return res.reject(media.downloadAudioError);
          }
        } else {
          if (media.download) {
            return res.resolve(media.download);
          }
          if (((ref$ = media.downloadError) != null ? ref$.blocked : void 8) === blocked) {
            return res.reject(media.downloadError);
          }
        }
        cid || (cid = id);
        if (format === 1) {
          if (blocked === 2) {
            url = p0ne.proxy("http://vimow.com/watch?v=" + cid);
          } else if (blocked) {
            url = p0ne.proxy("https://www.youtube.com/watch?v=" + cid);
          } else {
            url = p0ne.proxy("https://www.youtube.com/get_video_info?video_id=" + cid);
          }
          console.info("[mediaDownload] YT lookup", url);
          $.ajax({
            url: url,
            error: res.reject,
            success: function(d){
              var file, files, bestVideo, bestVideoSize, that, title, i$, ref$, len$, src, resolution, mimeType, ref1$, key$, video, get, basename, error, reason, fmt_list_, url, fallback_host, itag, format, fmt_list, j$, len1$, e, original_url;
              out$.d = d;
              file = d;
              files = {};
              bestVideo = null;
              bestVideoSize = 0;
              if (blocked === 2) {
                if (that = d.match(/<title>(.*?) - vimow<\/title>/)) {
                  title = htmlUnescape(that[1]);
                } else {
                  title = cid;
                }
                files = {};
                for (i$ = 0, len$ = (ref$ = d.match(/<source .*?>/g) || []).length; i$ < len$; ++i$) {
                  file = ref$[i$];
                  src = /src='(.*?)'/.exec(file);
                  resolution = /src='(.*?)'/.exec(file);
                  mimeType = /src='(\w+\/(\w+))'/.exec(file);
                  if (that = src && resolution && mimeType) {
                    (ref1$ = files[key$ = that[5]] || (files[key$] = []))[ref1$.length] = video = {
                      url: src[1],
                      resolution: resolution[1],
                      mimeType: mimeType[1],
                      file: "basename." + mimeType[2]
                    };
                    if (that[2] > bestVideoSize) {
                      bestVideo = video;
                      bestVideoSize = video.resolution;
                    }
                  }
                }
                if (bestVideo) {
                  files.preferredDownload = bestVideo;
                  files.status = 0;
                  console.log("[mediaDownload] resolving", files);
                  res.resolve(files);
                } else {
                  console.warn("[mediaDownload] vimow.com loaded, but no downloads found");
                  res.reject({
                    status: 2,
                    message: 'no downloads found'
                  });
                }
                return;
              } else if (blocked) {
                get = function(key){
                  var val;
                  val = (file || d).match(regexUnblocked[key]);
                  if (key === 'url' || key === 'itag' || key === 'type' || key === 'fallback_host') {
                    return decodeURIComponent(val[1]);
                  }
                  if (val) {
                    return val[1];
                  }
                };
                basename = get('title') || cid;
              } else {
                get = function(key, unescape){
                  var val;
                  val = file.match(regexNormal[key]);
                  if (val) {
                    if (unescape) {
                      val = val[1].replace(/\++/g, ' ');
                    }
                    return decodeURIComponent(val[1]);
                  }
                };
                basename = get('title', true) || cid;
                if (error = get('errorcode')) {
                  reason = get('reason', true);
                  switch (+error) {
                  case 150:
                    console.error("[mediaDownload] video_info error 150! Embedding not allowed on some websites");
                    break;
                  default:
                    console.error("[mediaDownload] video_info error " + error + "! unkown error code", reason);
                  }
                }
              }
              if (!audioOnly) {
                /*if get \adaptive_fmts
                    for file in unescape(that.1) .split ","
                        url = unescape that.1 if file.match(/url=(.*?)(?:&|$)/)
                        if file.match(/type=(.*?)%3B/)
                            mimeType = unescape that.1
                            filename = "#basename.#{mimeType.substr 6}"
                            if file.match(/size=(.*?)(?:&|$)/)
                                resolution = unescape(that.1)
                                size = resolution.split \x
                                size = size.0 * size.1
                                (files[resolution] ||= [])[*] = video = {url, size, mimeType, filename, resolution}
                                if size > bestVideoSize
                                    bestVideo = video
                                    bestVideoSize = size*/
                fmt_list_ = get('fmt_list');
                if (that = get('url_encoded_fmt_stream_map')) {
                  for (i$ = 0, len$ = (ref$ = that.split(",")).length; i$ < len$; ++i$) {
                    file = ref$[i$];
                    url = get('url');
                    if (that = file.match(/fallback_host=(.*?)(?:\\u0026|$)/)) {
                      fallback_host = unescape(that[1]);
                    }
                    itag = get('itag');
                    if (that = ytItags[itag]) {
                      format = that;
                    } else {
                      if (!fmt_list) {
                        fmt_list = {};
                        if (fmt_list_) {
                          for (j$ = 0, len1$ = (ref1$ = fmt_list_.split(',')).length; j$ < len1$; ++j$) {
                            e = ref1$[j$];
                            e = e.split('/');
                            fmt_list[e[0]] = e[1].split('x')[1];
                          }
                        } else {
                          console.warn("[mediaDownload] no fmt_list found");
                        }
                      }
                      if (that = fmt_list[itag] && get('type')) {
                        format = {
                          itag: itag,
                          type: that[1],
                          ext: that[2],
                          resolution: fmt_list[itag]
                        };
                        console.warn("[mediaDownload] unknown itag found, found in fmt_list", itag);
                      }
                    }
                    if (format) {
                      original_url = url;
                      url = url.replace(/^.*?googlevideo\.com/, "https://" + fallback_host);
                      (ref1$ = files[key$ = format.ext] || (files[key$] = []))[ref1$.length] = video = {
                        file: basename + "." + format.ext,
                        url: url,
                        original_url: original_url,
                        fallback_host: fallback_host,
                        mimeType: format.type + "/" + format.ext,
                        resolution: format.resolution,
                        itag: format.itag
                      };
                      if (format.resolution > bestVideoSize) {
                        bestVideo = video;
                        bestVideoSize = video.resolution;
                      }
                    } else {
                      console.warn("[mediaDownload] unknown itag found, not in fmt_list", itag);
                    }
                  }
                }
                if (bestVideo) {
                  files.preferredDownload = bestVideo;
                  files.status = 0;
                  console.log("[mediaDownload] resolving", files);
                  res.resolve(files);
                } else {
                  console.warn("[mediaDownload] no downloads found");
                  res.reject({
                    status: 2,
                    message: 'no downloads found'
                  });
                }
              } else {
                if (that = blocked && d.match(/"dashmpd":"(.*?)"/)) {
                  url = p0ne.proxy(that[1].replace(/\\\//g, '/'));
                } else if (that = d.match(/dashmpd=(http.+?)(?:&|$)/)) {
                  url = p0ne.proxy(unescape(that[1]));
                }
                if (url) {
                  console.info("[mediaDownload] DASHMPD lookup", url);
                  $.get(url).then(function(dashmpd){
                    var $dash, bestVideo;
                    out$.dashmpd = dashmpd;
                    $dash = jQuery(
                    $.parseXML(
                    dashmpd));
                    bestVideo = {
                      size: 0
                    };
                    $dash.find('AdaptationSet').each(function(){
                      var $set, mimeType, type, ext, l;
                      $set = $(this);
                      mimeType = $set.attr('mimeType');
                      type = mimeType.substr(0, 5);
                      if (type !== 'audio') {
                        return;
                      }
                      if (mimeType === 'audio/mp4') {
                        ext = 'm4a';
                      } else {
                        ext = mimeType.substr(6);
                      }
                      files[mimeType] = [];
                      l = 0;
                      $set.find('BaseURL').each(function(){
                        var $baseurl, $representation, m;
                        $baseurl = $(this);
                        $representation = $baseurl.parent();
                        files[mimeType][l++] = m = {
                          file: basename + "." + ext,
                          url: httpsify($baseurl.text()),
                          mimeType: mimeType,
                          size: $baseurl.attr('yt:contentLength') / 1000000,
                          samplingRate: $representation.attr('audioSamplingRate') + "Hz"
                        };
                        if (audioOnly && ~~m.size > ~~bestVideo.size && (window.chrome || mimeType !== 'audio/webm')) {
                          bestVideo = m;
                        }
                      });
                    });
                    if (bestVideo) {
                      files.preferredDownload = bestVideo;
                      files.status = 0;
                      console.log("[mediaDownload] resolving", files);
                      res.resolve(files);
                    } else {
                      console.warn("[mediaDownload] dash.mpd found, but no downloads");
                      res.reject({
                        status: 3,
                        message: 'dash.mpd found, but no downloads'
                      });
                    }
                    /*
                    html = ""
                    for mimeType, files of res
                        html += "<h3 class=AdaptationSet>#mimeType</h3>"
                        for f in files
                            html += "<a href='#{$baseurl.text!}' download='#file' class='download"
                            html += " preferred-download" if f.preferredDownload
                            html += "'>#file</a> (#size; #{f.samplingRate || f.resolution})<br>"
                    */
                  }).fail(res.reject);
                } else {
                  console.error("[mediaDownload] no download found");
                  res.reject("no download found");
                }
              }
            }
          });
        } else if (format === 2) {
          audioOnly = true;
          mediaLookup(media).then(function(d){
            var ref$;
            if (d.download) {
              res.resolve(media.downloadAudio = (ref$ = {}, ref$[d.downloadFormat] = {
                url: d.download,
                size: d.downloadSize
              }, ref$));
            } else {
              res.reject("download disabled");
            }
          }).fail(res.reject);
        } else {
          console.error("[mediaDownload] unknown format", media);
          res.reject("unknown format");
        }
        return res.promise();
      };
    }(),
    proxify: function(url){
      if (typeof url.startsWith === 'function' && url.startsWith("http:")) {
        return p0ne.proxy(url);
      } else {
        return url;
      }
    },
    httpsify: function(url){
      if (typeof url.startsWith === 'function' && url.startsWith("http:")) {
        return "https://" + url.substr(7);
      } else {
        return url;
      }
    },
    getChatText: function(cid){
      var res;
      if (!cid) {
        return $();
      } else {
        res = $cms().find(".text.cid-" + cid);
        return res;
      }
    },
    getChat: function(cid){
      if (typeof cid === 'object') {
        return cid.$el || (cid.$el = getChat(cid.cid));
      } else {
        return getChatText(cid).parent().parent();
      }
    },
    isMention: function(msg, nameMentionOnly){
      var user, ref$, fromUser;
      user = API.getUser();
      if (nameMentionOnly) {
        return (ref$ = msg.isMentionName) != null
          ? ref$
          : msg.isMentionName = msg.message.has("@" + user.rawun);
      }
      fromUser = msg.from || (msg.from = getUser(msg) || {});
      return (ref$ = msg.isMention) != null
        ? ref$
        : msg.isMention = msg.message.has("@" + user.rawun) || fromUser.id !== userID && (fromUser.gRole || fromUser.role >= 3) && (msg.message.has("@everyone") || user.role > 1 && (msg.message.has("@staff") || user.role === 1 && msg.message.has("@rdjs") || user.role === 2 && msg.message.has("@bouncers") || user.role === 3 && msg.message.has("@managers") || user.role === 4 && msg.message.has("@hosts")) || msg.message.has("@djs") && API.getWaitListPosition() !== -1);
      /*
      // for those of you looking at the compiled Javascript, have some readable code:
      return (ref$ = msg.isMention) != null ? ref$ : msg.isMention =
          msg.message.has("@" + user.rawun)
          || fromUser.id !== userID && (fromUser.gRole || fromUser.role >= 3) && (
              msg.message.has("@everyone")
              || user.role > 1 && (
                  msg.message.has("@staff")
                  || user.role === 1 && msg.message.has("@rdjs")
                  || user.role === 2 && msg.message.has("@bouncers")
                  || user.role === 3 && msg.message.has("@managers")
                  || user.role === 4 && msg.message.has("@hosts")
              ) || msg.message.has("@djs") && API.getWaitListPosition() !== -1
          );
       */
    },
    getMentions: function(data, safeOffsets){
      var attr, that, roles, users, msgLength, checkGeneric, user, mentions, l;
      if (safeOffsets) {
        attr = 'mentionsWithOffsets';
      } else {
        attr = 'mentions';
      }
      if (that = data[attr]) {
        return that;
      }
      roles = {
        everyone: 0,
        djs: 0,
        rdjs: 1,
        staff: 2,
        bouncers: 2,
        managers: 3,
        hosts: 4
      };
      users = API.getUsers();
      msgLength = data.message.length;
      checkGeneric || (checkGeneric = getUser(data));
      checkGeneric && (checkGeneric = checkGeneric.role >= 3 || checkGeneric.gRole);
      mentions = [];
      l = 0;
      data.message.replace(/@/g, function(_, offset){
        var possibleMatches, i, str, k, ref$, v, genericMatch, possibleMatches2, l2, i$, len$, m, res;
        offset++;
        possibleMatches = users;
        i = 0;
        if (checkGeneric) {
          str = data.message.substr(offset, 8);
          for (k in ref$ = roles) {
            v = ref$[k];
            if (str.startsWith(k)) {
              genericMatch = {
                rawun: k,
                username: k,
                role: v,
                id: 0
              };
              break;
            }
          }
        }
        while (possibleMatches.length && i < msgLength) {
          possibleMatches2 = [];
          l2 = 0;
          for (i$ = 0, len$ = possibleMatches.length; i$ < len$; ++i$) {
            m = possibleMatches[i$];
            if (m.rawun[i] === data.message[offset + i]) {
              if (m.rawun.length === i + 1) {
                res = m;
              } else {
                possibleMatches2[l2++] = m;
              }
            }
          }
          possibleMatches = possibleMatches2;
          i++;
        }
        if (res || (res = genericMatch)) {
          if (safeOffsets) {
            mentions[l++] = (ref$ = clone$(res), ref$.offset = offset - 1, ref$);
          } else if (!mentions.has(res)) {
            mentions[l++] = res;
          }
        }
      });
      if (!mentions.length && !safeOffsets) {
        mentions = [getUser(data)];
      }
      mentions.toString = function(){
        var res, res$, i$, len$, user;
        res$ = [];
        for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
          user = this[i$];
          res$.push("@" + user.rawun);
        }
        res = res$;
        return humanList(res);
      };
      data[attr] = mentions;
      return mentions;
    },
    htmlEscapeMap: {
      sp: 32,
      blank: 32,
      excl: 33,
      quot: 34,
      num: 35,
      dollar: 36,
      percnt: 37,
      amp: 38,
      apos: 39,
      lpar: 40,
      rpar: 41,
      ast: 42,
      plus: 43,
      comma: 44,
      hyphen: 45,
      dash: 45,
      period: 46,
      sol: 47,
      colon: 58,
      semi: 59,
      lt: 60,
      equals: 61,
      gt: 62,
      quest: 63,
      commat: 64,
      lsqb: 91,
      bsol: 92,
      rsqb: 93,
      caret: 94,
      lowbar: 95,
      lcub: 123,
      verbar: 124,
      rcub: 125,
      tilde: 126,
      sim: 126,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brkbar: 166,
      sect: 167,
      uml: 168,
      die: 168,
      copy: 169,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      reg: 174,
      hibar: 175,
      deg: 176,
      plusmn: 177,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      sup1: 185,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      half: 189,
      frac34: 190,
      iquest: 191
    },
    htmlEscape: function(str){
      return $dummy.text(str).html();
      /*
      if not window.htmlEscapeRegexp
          window.htmlEscapeRegexp = []; l=0; window.htmlEscapeMap_reversed = {}
          for k,v of htmlEscapeMap when v != 32 #spaces
              window.htmlEscapeMap_reversed[v] = k
              v .= toString 16
              if v.length <= 2
                  v = "0#v"
              window.htmlEscapeRegexp[l++] = "\\u0#v"
      return str.replace //#{window.htmlEscapeRegexp .join "|"}//g, (c) !-> return "&#{window.htmlEscapeMap_reversed[c.charCodeAt 0]};"
      */
    },
    htmlUnescape: function(html){
      return html.replace(/&(\w+);|&#(\d+);|&#x([a-fA-F0-9]+);/g, function(_, a, b, c){
        return String.fromCharCode(+b || htmlEscapeMap[a] || parseInt(c, 16)) || _;
      });
    },
    stripHTML: function(msg){
      return msg.replace(/<.*?>/g, '');
    },
    unemojify: function(str){
      var map, ref$;
      map = (ref$ = window.emoticons) != null ? ref$.map : void 8;
      if (!map) {
        return str;
      }
      return str.replace(/(?:<span class="emoji-glow">)?<span class="emoji emoji-(\w+)"><\/span>(?:<\/span>)?/g, function(_, emoteID){
        var that;
        if (that = emoticons.reversedMap[emoteID]) {
          return ":" + that + ":";
        } else {
          return _;
        }
      });
    },
    resolveRTL: function(str, dontJoin){
      var a, b, isRTLoverridden;
      a = b = "";
      isRTLoverridden = false;
      (str + "\u202d").replace(/(.*?)(\u202e|\u202d)/g, function(_, pre, c){
        if (isRTLoverridden) {
          b += pre.reverse();
        } else {
          a += pre;
        }
        isRTLoverridden = c === '\u202e';
        return _;
      });
      if (dontJoin) {
        return [a, b];
      } else {
        return a + b;
      }
    },
    collapseWhitespace: function(str){
      return str.replace(/\s+/g, ' ');
    },
    cleanMessage: function(str){
      return collapseWhitespace(
      resolveRTL(
      htmlUnescape(
      stripHTML(
      unemojify(
      str)))));
    },
    formatPlainText: function(text){
      var lvl;
      lvl = 0;
      text = text.replace(/([\s\S]*?)($|(?:https?:|www\.)(?:\([^\s\]\)]*\)|\[[^\s\)\]]*\]|[^\s\)\]]+))+([\.\?\!\,])?/g, function(arg$, pre, url, post){
        pre = pre.replace(/(\s)(".*?")(\s)/g, "$1<i class='song-description-string'>$2</i>$3").replace(/(\s)(\*\w+\*)(\s)/g, "$1<b>$2</b>$3").replace(/(lyrics|download|original|re-?upload)/gi, "<b>$1</b>").replace(/(\s)((?:0x|#)[0-9a-fA-F]+|\d+)(\w*|%|\+)?(\s)/g, "$1<b class='song-description-number'>$2</b><i class='song-description-comment'>$3</i>$4").replace(/^={5,}$/mg, "<hr class='song-description-hr-double' />").replace(/^[\-~_]{5,}$/mg, "<hr class='song-description-hr' />").replace(/^[\[\-=~_]+.*?[\-=~_\]]+$/mg, "<b class='song-description-heading'>$&</b>").replace(/(.?)([\(\)])(.?)/g, function(x, a, b, c){
          if ("=^".indexOf(x) === -1 || a === ":") {
            return x;
          } else if (b === '(') {
            lvl++;
            if (lvl === 1) {
              return a + "<i class='song-description-comment'>(" + c;
            }
          } else if (lvl) {
            lvl--;
            if (lvl === 0) {
              return a + ")</i>" + c;
            }
          }
          return x;
        });
        if (!url) {
          return pre;
        }
        return pre + "<a href='" + url + "' target=_blank>" + url + "</a>" + (post || '');
      });
      if (lvl) {
        text += "</i>";
      }
      return text.replace(/\n/g, '<br>');
    }
    /*colorKeywords: do !->
        <[ %undefined% black silver gray white maroon red purple fuchsia green lime olive yellow navy blue teal aqua orange aliceblue antiquewhite aquamarine azure beige bisque blanchedalmond blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen gainsboro ghostwhite gold goldenrod greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow limegreen linen mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite oldlace olivedrab orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna skyblue slateblue slategray slategrey snow springgreen steelblue tan thistle tomato turquoise violet wheat whitesmoke yellowgreen rebeccapurple ]>
            ..0 = void
            return ..
    isColor: (str) !->
        str = (~~str).toString(16) if typeof str == \number
        return false if typeof str != \string
        str .= trim!
        tmp = /^(?:#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})|(?:rgb|hsl)a?\([\d,]+\)|currentColor|(\w+))$/.exec(str)
        if tmp and tmp.1 in window.colorKeywords
            return str
        else
            return false*/,
    isColor: function(str){
      $dummy[0].style.color = "";
      $dummy[0].style.color = str;
      return $dummy[0].style.color !== "";
    },
    isURL: function(str){
      if (typeof str !== 'string') {
        return false;
      }
      str = str.trim().replace(/\\\//g, '/');
      if (parseURL(str).host !== location.host) {
        return str;
      } else {
        return false;
      }
    },
    mention: function(list){
      var i, ref$;
      if (!(list != null && list.length)) {
        return "";
      } else if (list[0].username) {
        return humanList((function(){
          var i$, len$, results$ = [];
          for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
            i = i$;
            results$.push("@" + list[i].username);
          }
          return results$;
        }()));
      } else if ((ref$ = list[0].attributes) != null && ref$.username) {
        return humanList((function(){
          var i$, len$, results$ = [];
          for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
            i = i$;
            results$.push("@" + list[i].get('username'));
          }
          return results$;
        }()));
      } else {
        return humanList((function(){
          var i$, len$, results$ = [];
          for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
            i = i$;
            results$.push("@" + list[i]);
          }
          return results$;
        }()));
      }
    },
    humanList: function(arr){
      if (!arr.length) {
        return "";
      }
      arr = importAll$([], arr);
      if (arr.length > 1) {
        arr[arr.length - 2] += " and\xa0" + arr.pop();
      }
      return arr.join(", ");
    },
    plural: function(num, singular, plural){
      plural == null && (plural = singular + "s");
      if (num === 1) {
        return num + "\xa0" + singular;
      } else {
        return num + "\xa0" + plural;
      }
    },
    xth: function(i){
      var ld;
      ld = i % 10;
      switch (true) {
      case i % 100 - ld === 10:
        i + "th";
        break;
      case ld === 1:
        return i + "st";
      case ld === 2:
        return i + "nd";
      case ld === 3:
        return i + "rd";
      }
      return i + "th";
    }
    /*fromCodePoints: (str) !->
        res = ""
        for codePoint in str.split \-
            res += String.fromCodePoints(parseInt(codePoint, 16))
        return res
    */,
    emojifyUnicode: function(str){
      if (typeof str !== 'string') {
        return str;
      } else {
        return str.replace(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g, function(emoji, all){
          emoji = emoji.codePointAt(0).toString(16);
          if (emoticons.reversedMap[emoji]) {
            return emojifyUnicodeOne(emoji, true);
          } else {
            return all;
          }
        });
      }
    },
    emojifyUnicodeOne: function(key){
      return "<span class=\"emoji emoji-" + key + "\"></span>";
    },
    flag: function(language, unicode){
      /*@security HTML injection possible, if Lang.languages[language] is maliciously crafted*/
      if (language[0] === '\'' || language[1] === '\'') {
        return "";
      } else {
        return "<span class='flag flag-" + language + "' title='" + (typeof Lang != 'undefined' && Lang !== null ? Lang.languages[language] : void 8) + "'></span>";
      }
      /*
      if window.emoticons
          language .= language if typeof language == \object
          language = \gb if language == \en
          if key = emoticons.map[language]
              if unicode
                  return key
              else
                  return emojifyOne(key)
      return language*/
    },
    formatUser: function(user, showModInfo){
      var info, d;
      if (user.toJSON) {
        user = user.toJSON();
      }
      info = getRank(user);
      if (info === 'none') {
        info = "";
      } else {
        info = " " + info;
      }
      if (showModInfo) {
        info += " lvl " + (user.gRole === 5
          ? '∞'
          : user.level);
        if (Date.now() - 48 .h < (d = new Date(user.joined))) {
          info += " - created " + ago(d);
        }
      }
      return user.username + " (" + user.language + info + ")";
    },
    formatUserHTML: function(user, showModInfo, fromClass){
      /*@security no HTML injection should be possible, unless user.rawun or .id is improperly modified*/
      var rank, info, d;
      user = getUser(user);
      if (rank = getRankIcon(user)) {
        rank += " ";
      }
      if (showModInfo) {
        info = " (lvl " + (user.gRole === 5
          ? '∞'
          : user.level);
        if (Date.now() - 48 .h < (d = new Date(user.joined))) {
          info += " - created " + ago(d);
        }
        info += ")";
      }
      if (fromClass) {
        fromClass = " " + getRank(user);
      } else {
        fromClass = "";
      }
      return rank + "<span class='un" + fromClass + "' data-uid='" + user.id + "'>" + user.rawun + "</span> " + flag(user.language) + (info || '');
    },
    formatUserSimple: function(user){
      return "<span class=un data-uid='" + user.id + "'>" + user.username + "</span>";
    },
    timezoneOffset: new Date().getTimezoneOffset(),
    getTime: function(t){
      t == null && (t = Date.now());
      return new Date(t - timezoneOffset * 60000).toISOString().replace(/.+?T|\..+/g, '');
    },
    getDateTime: function(t){
      t == null && (t = Date.now());
      return new Date(t - timezoneOffset * 60000).toISOString().replace(/T|\..+/g, ' ');
    },
    getDate: function(t){
      t == null && (t = Date.now());
      return new Date(t - timezoneOffset * 60000).toISOString().replace(/T.+/g, '');
    },
    getISOTime: function(t){
      t == null && (t = new Date);
      return t.toISOString().replace(/T|\..+/g, " ");
    },
    humanTime: function(diff, shortFormat){
      var b, c;
      if (diff < 0) {
        return "-" + humanTime(-diff);
      } else if (!shortFormat && diff < 2000) {
        return "just now";
      }
      b = [60, 60, 24, 360.25];
      c = 0;
      diff /= 1000;
      while (diff > 2 * b[c]) {
        diff /= b[c++];
      }
      if (shortFormat) {
        return ~~diff + "" + ['s', 'm', 'h', 'd', 'y'][c];
      } else {
        return ~~diff + " " + ['seconds', 'minutes', 'hours', 'days', 'years'][c];
      }
    },
    mediaTime: function(dur){
      var b, c, res;
      dur = ~~dur;
      if (dur < 0) {
        return "-" + mediaTime(-dur);
      }
      b = [60, 60, 24, 360.25];
      c = 0;
      res = pad(dur % 60);
      while (dur = ~~(dur / b[c++])) {
        res = pad(dur % b[c]) + ":" + res;
      }
      if (res.length === 2) {
        return "00:" + res;
      } else {
        return res;
      }
    },
    ago: function(d){
      return humanTime(Date.now() - d) + " ago";
    },
    lssize: function(sizeWhenDecompressed){
      var size, k, ref$, v;
      size = 0;
      for (k in ref$ = localStorage) {
        v = ref$[k];
        if (k !== 'length') {
          if (sizeWhenDecompressed) {
            try {
              v = decompress(v);
            } catch (e$) {}
          }
          size += (v || '').length / 524288;
        }
      }
      return size;
    },
    formatMB: function(it){
      return it.toFixed(2) + "MB";
    },
    getRank: function(user){
      var role, that;
      user = getUser(user);
      if (!user || (role = user.role || (typeof user.get === 'function' ? user.get('role') : void 8)) === -1) {
        return 'ghost';
      } else if (that = user.gRole || (typeof user.get === 'function' ? user.get('gRole') : void 8)) {
        if (that === 5) {
          return 'admin';
        } else {
          return 'ambassador';
        }
      } else {
        return ['none', 'rdj', 'bouncer', 'manager', 'cohost', 'host'][role || 0];
      }
    },
    getRankIcon: function(user){
      var rank;
      rank = getRank(user);
      return rank !== 'none' && "<i class='icon icon-chat-" + (rank === 'rdj' ? 'dj' : rank) + " p0ne-icon-small'></i>" || '';
    },
    parseURL: function(href){
      var a;
      href || (href = "//");
      a = document.createElement('a');
      a.href = href;
      return a;
    },
    getIcon: function(){
      var $icon, fn;
      $icon = $('<i class=icon>').css({
        visibility: 'hidden'
      }).appendTo('body');
      fn = function(className){
        var res;
        $icon.addClass(className);
        res = {
          image: $icon.css('background-image'),
          position: $icon.css('background-position')
        };
        res.background = res.image + " " + res.position;
        $icon.removeClass(className);
        return res;
      };
      fn.enableCaching = function(){
        var res;
        res = _.memoize(fn);
        res.enableCaching = $.noop;
        window.getIcon = res;
      };
      return fn;
    }(),
    htmlToggle: function(checked, data){
      var k, v;
      if (data) {
        data = "";
        for (k in data) {
          v = data[k];
          data += "data-" + k + "='" + v + "' ";
        }
      } else {
        data = '';
      }
      return "<input type=checkbox class=checkbox " + data + (checked ? '' : 'checked') + " />";
    },
    disabled: false,
    user: typeof API != 'undefined' && API !== null ? API.getUser() : void 8,
    getRoomSlug: function(){
      return (typeof room != 'undefined' && room !== null ? typeof room.get === 'function' ? room.get('slug') : void 8 : void 8) || decodeURIComponent(location.pathname.substr(1));
    }
  });
  userID = typeof user != 'undefined' && user !== null ? user.id : void 8;
  user.isStaff = user && user.role > 1 || user.gRole;
  return dataLoadAll({
    p0ne_requireIDs: {},
    p0ne_disabledModules: {
      _rooms: {}
    }
  }, function(err, data){
    var res$, k, ref$, v, PlaylistItemRow, Dialog, i$, len$, context, ref1$, cb, app, friendsList, _, e, cm, rR_, onLoaded, dummyP3, ppStop, CHAT_WIDTH, MAX_IMAGE_HEIGHT, roles;
    window.requireIDs = data.p0ne_requireIDs;
    p0ne.disabledModules = data.p0ne_disabledModules;
    if (err) {
      if (err.p0ne_requireIDs) {
        console.warn(getTime() + " [p0ne] the cached requireIDs seem to be corrupted");
      }
      if (err.p0ne_disabledModules) {
        console.warn(getTime() + " [p0ne] the user's p0ne settings seem to be corrupted");
      }
    }
    console.info("[p0ne] main function body", p0ne.disabledModules.autojoin);
    /*####################################
    #          REQUIRE MODULES           #
    ####################################*/
    /* requireHelper(moduleName, testFn) */
    requireHelper('Curate', function(it){
      var ref$, ref1$;
      return (ref$ = it.prototype) != null ? (ref1$ = ref$.execute) != null ? ref1$.toString().has("/media/insert") : void 8 : void 8;
    });
    requireHelper('playlists', function(it){
      return it.activeMedia;
    });
    requireHelper('auxiliaries', function(it){
      return it.deserializeMedia;
    });
    requireHelper('database', function(it){
      return it.settings;
    });
    requireHelper('socketEvents', function(it){
      return it.ack;
    });
    requireHelper('permissions', function(it){
      return it.canModChat;
    });
    requireHelper('Playback', function(it){
      var ref$;
      return ((ref$ = it.prototype) != null ? ref$.id : void 8) === 'playback';
    });
    requireHelper('PopoutView', (function(it){
      return '$document' in it;
    }));
    requireHelper('MediaPanel', function(it){
      var ref$;
      return (ref$ = it.prototype) != null ? ref$.onPlaylistVisible : void 8;
    });
    requireHelper('PlugAjax', function(it){
      var ref$;
      return (ref$ = it.prototype) != null ? ref$.hasOwnProperty('permissionAlert') : void 8;
    });
    requireHelper('backbone', function(it){
      return it.Events;
    }, {
      id: 'backbone'
    });
    requireHelper('roomLoader', function(it){
      return it.onVideoResize;
    });
    requireHelper('Layout', function(it){
      return it.getSize;
    });
    requireHelper('popMenu', function(it){
      return it.className === 'pop-menu';
    });
    requireHelper('ActivateEvent', function(it){
      return it.ACTIVATE;
    });
    requireHelper('votes', function(it){
      var ref$;
      return (ref$ = it.attributes) != null ? ref$.grabbers : void 8;
    });
    requireHelper('chatAuxiliaries', function(it){
      return it.sendChat;
    });
    requireHelper('tracker', function(it){
      return it.identify;
    });
    requireHelper('currentMedia', function(it){
      return it.updateElapsedBind;
    });
    requireHelper('settings', function(it){
      return it.settings;
    });
    requireHelper('soundcloud', function(it){
      return it.sc;
    });
    requireHelper('searchAux', function(it){
      return it.ytSearch;
    });
    requireHelper('searchManager', function(it){
      return it._search;
    });
    requireHelper('AlertEvent', function(it){
      return it._name === 'AlertEvent';
    });
    requireHelper('userRollover', function(it){
      return it.id === 'user-rollover';
    });
    requireHelper('booth', function(it){
      var ref$;
      return (ref$ = it.attributes) != null ? ref$.hasOwnProperty('shouldCycle') : void 8;
    });
    requireHelper('currentPlaylistMedia', (function(it){
      return 'currentFilter' in it;
    }));
    requireHelper('userList', function(it){
      return it.id === 'user-lists';
    });
    requireHelper('FriendsList', function(it){
      var ref$;
      return ((ref$ = it.prototype) != null ? ref$.className : void 8) === 'friends';
    });
    requireHelper('RoomUserRow', function(it){
      var ref$;
      return (ref$ = it.prototype) != null ? ref$.vote : void 8;
    });
    requireHelper('WaitlistRow', function(it){
      var ref$;
      return (ref$ = it.prototype) != null ? ref$.onAvatar : void 8;
    });
    requireHelper('room', function(it){
      var ref$;
      return (ref$ = it.attributes) != null ? ref$.hostID : void 8;
    });
    requireHelper('RoomHistory', function(it){
      var ref$;
      return ((ref$ = it.prototype) != null ? ref$.listClass : void 8) === 'history' && it.prototype.hasOwnProperty('listClass');
    });
    if (requireHelper('emoticons', function(it){
      return it.emojify;
    })) {
      res$ = {};
      for (k in ref$ = emoticons.map) {
        v = ref$[k];
        res$[v] = k;
      }
      emoticons.reversedMap = res$;
    }
    if (requireHelper('PlaylistItemList', function(it){
      var ref$;
      return ((ref$ = it.prototype) != null ? ref$.listClass : void 8) === 'playlist-media';
    })) {
      out$.PlaylistItemRow = PlaylistItemRow = PlaylistItemList.prototype.RowClass;
    }
    if (requireHelper('DialogAlert', function(it){
      var ref$;
      return ((ref$ = it.prototype) != null ? ref$.id : void 8) === 'dialog-alert';
    })) {
      out$.Dialog = Dialog = DialogAlert.__super__;
    }
    requireHelper('_$context', function(it){
      var ref$;
      return (ref$ = it._events) != null ? ref$['chat:receive'] : void 8;
    }, {
      onfail: function(){
        console.error("[p0ne require] couldn't load '_$context'. A lot of modules will NOT load because of this");
      }
    });
    for (i$ = 0, len$ = (ref$ = [Backbone.Events, _$context, API]).length; i$ < len$; ++i$) {
      context = ref$[i$];
      if (context) {
        context.onEarly = fn$;
      }
    }
    /* `app` is like the ultimate root object on plug.dj, just about everything is somewhere in there! great for debugging :) */
    for (i$ = 0, len$ = (ref$ = (typeof room != 'undefined' && room !== null ? (ref1$ = room._events) != null ? ref1$['change:name'] : void 8 : void 8) || (typeof _$context != 'undefined' && _$context !== null ? (ref1$ = _$context._events) != null ? ref1$['show:room'] : void 8 : void 8) || (typeof Layout != 'undefined' && Layout !== null ? (ref1$ = Layout._events) != null ? ref1$['resize'] : void 8 : void 8) || []).length; i$ < len$; ++i$) {
      cb = ref$[i$];
      if (cb.ctx.room) {
        out$.app = app = cb.ctx;
        out$.friendsList = friendsList = app.room.friends;
        break;
      }
    }
    if (requireHelper('user_', function(it){
      return it.canModChat;
    })) {
      window.users = user_.collection;
      window.user = user_.toJSON();
      window.userID = user.id;
    }
    window._ = _ = require('underscore');
    window.Lang = require('lang/Lang');
    for (k in ref$ = typeof Lang != 'undefined' && Lang !== null ? Lang.languages : void 8) {
      v = ref$[k];
      if (v.has('\'')) {
        (ref1$ = Lang.languages)[k] = ref1$[k].replace(/\\?'/g, "\\'");
      }
    }
    if (app && !(window.chat = app.room.chat) && window._$context) {
      for (i$ = 0, len$ = (ref$ = _$context._events['chat:receive'] || []).length; i$ < len$; ++i$) {
        e = ref$[i$];
        if ((ref1$ = e.context) != null && ref1$.cid) {
          window.chat = e.context;
          break;
        }
      }
    }
    cm = $('#chat-messages');
    importAll$(window, {
      $cm: function(){
        var ref$;
        return (typeof PopoutView != 'undefined' && PopoutView !== null ? (ref$ = PopoutView.chat) != null ? ref$.$chatMessages : void 8 : void 8) || (typeof chat != 'undefined' && chat !== null ? chat.$chatMessages : void 8) || cm;
      },
      $cms: function(){
        var cm, that, ref$;
        cm = (typeof chat != 'undefined' && chat !== null ? chat.$chatMessages : void 8) || cm;
        if (that = typeof PopoutView != 'undefined' && PopoutView !== null ? (ref$ = PopoutView.chat) != null ? ref$.$chatMessages : void 8 : void 8) {
          return cm.add(that);
        } else {
          return cm;
        }
      },
      playChatSound: throttle(200, function(isMention){
        if (typeof chat != 'undefined' && chat !== null) {
          chat.playSound();
        }
        /*if isMention
            chat.playSound \mention
        else if $ \.icon-chat-sound-on .length > 0
            chat.playSound \chat
        */
      }),
      appendChat: function(div, wasAtBottom){
        var $div, ref$;
        wasAtBottom == null && (wasAtBottom = chatIsAtBottom());
        $div = $(div);
        $cms().append($div);
        if (wasAtBottom) {
          chatScrollDown();
        }
        chat.lastType = null;
        if (typeof PopoutView != 'undefined' && PopoutView !== null) {
          if ((ref$ = PopoutView.chat) != null) {
            ref$.lastType = null;
          }
        }
        return $div;
      },
      chatWarn: function(message, title, isHTML){
        if (!message) {
          return;
        }
        if (typeof title === 'string') {
          title = $('<span class=un>').text(title);
        } else {
          isHTML = title;
          title = null;
        }
        return appendChat($('<div class="cm p0ne-notif"><div class=badge-box><i class="icon icon-chat-system"></i></div></div>').append($('<div class=msg>').append($('<div class=from>').append(title).append(getTimestamp())).append($('<div class=text>')[isHTML ? 'html' : 'text'](message))));
      },
      chatIsAtBottom: function(){
        var cm;
        cm = $cm();
        return cm.scrollTop() > cm[0].scrollHeight - cm.height() - 20;
      },
      chatScrollDown: function(){
        var cm;
        cm = $cm();
        cm.scrollTop(cm[0].scrollHeight);
      },
      chatInput: function(msg, append){
        var $input, that;
        $input = (typeof chat != 'undefined' && chat !== null ? chat.$chatInputField : void 8) || $('#chat-input-field');
        if (that = append && $input.text()) {
          msg = that + " " + msg;
        }
        $input.val(msg).trigger('input').focus();
      },
      getTimestamp: function(d){
        d == null && (d = new Date);
        if (typeof auxiliaries != 'undefined' && auxiliaries !== null) {
          return "<time class='timestamp' datetime='" + d.toISOString() + "'>" + auxiliaries.getChatTimestamp((typeof database != 'undefined' && database !== null ? database.settings.chatTimestamps : void 8) === 24) + "</time>";
        } else {
          return "<time class='timestamp' datetime='" + d.toISOString() + "'>" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + "</time>";
        }
      }
    });
    /*####################################
    #          extend Deferreds          #
    ####################################*/
    replace(jQuery, 'Deferred', function(Deferred_){
      return function(){
        var timeStarted, res, promise_;
        res = Deferred_.apply(this, arguments);
        res.timeout = timeout;
        promise_ = res.promise;
        res.promise = function(){
          var res;
          res = promise_.apply(this, arguments);
          res.timeout = timeout;
          res.timeStarted = timeStarted;
          return res;
        };
        return res;
        function timeout(time, callback){
          var now, timeStarted, this$ = this;
          now = Date.now();
          timeStarted || (timeStarted = Date.now());
          if (this.state() !== 'pending') {
            return;
          }
          if (timeStarted + time <= now) {
            return callback.call(this, this);
          } else {
            return sleep(timeStarted + time - now, function(){
              if (this$.state() === 'pending') {
                callback.call(this$, this$);
              }
            });
          }
        }
      };
    });
    /*####################################
    #     Listener for other Scripts     #
    ####################################*/
    onLoaded = function(){
      var rR_, waiting;
      console.info("[p0ne] plugCubed detected");
      rR_ = Math.randomRange;
      requestAnimationFrame(waiting = function(){
        if (window.plugCubed && !window.plugCubed.plug_p0ne) {
          API.trigger('plugCubedLoaded', window.plugCubed);
          $body.addClass('plugCubed');
          replace(plugCubed, 'close', function(close_){
            return function(){
              $body.removeClass('plugCubed');
              close_.apply(this, arguments);
              if (Math.randomRange !== rR_) {
                onLoaded();
              } else {
                window.plugCubed = dummyP3;
              }
            };
          });
        } else {
          requestAnimationFrame(waiting);
        }
      });
    };
    dummyP3 = {
      close: onLoaded,
      plug_p0ne: true
    };
    if (window.plugCubed && !window.plugCubed.plug_p0ne) {
      onLoaded();
    } else {
      window.plugCubed = dummyP3;
    }
    onLoaded = function(){
      console.info("[p0ne] plugplug detected");
      API.trigger('plugplugLoaded', window.plugplug);
      sleep(5000, function(){
        var ppStop;
        ppStop = onLoaded;
      });
    };
    if (window.ppSaved) {
      onLoaded();
    } else {
      out$.ppStop = ppStop = onLoaded;
    }
    /*####################################
    #          GET PLUG³ VERSION         #
    ####################################*/
    window.getPlugCubedVersion = function(){
      var v, that, i$, ref$, len$, i, k;
      if (!((typeof plugCubed != 'undefined' && plugCubed !== null) && plugCubed.init)) {
        return null;
      } else if (plugCubed.version) {
        return plugCubed.version;
      } else if (v = requireHelper('plugCubedVersion', {
        test: function(it){
          return it.major;
        }
      })) {
        return v;
      } else {
        if (!(v = $('#p3-settings .version').text())) {
          $('plugcubed').click();
          v = $('#p3-settings').stop().css({
            left: -500
          }).find('.version').text();
        }
        if (that = v.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\w+))?(_min)? \(Build (\d+)\)$/)) {
          v = {
            toString: function(){
              return this.major + "." + this.minor + "." + this.patch + (this.prerelease && '-' + this.prerelease) + (this.minified && '_min' || '') + " (Build " + this.build + ")";
            }
          };
          for (i$ = 0, len$ = (ref$ = ['major', 'minor', 'patch', 'prerelease', 'minified', 'build']).length; i$ < len$; ++i$) {
            i = i$;
            k = ref$[i$];
            v[k] = that[i + 1];
          }
        }
      }
      return plugCubed.version = v;
    };
    console.logImg = function(src, customWidth, customHeight){
      var def, drawImage, x$;
      def = $.Deferred();
      drawImage = function(w, h){
        if (window.chrome) {
          console.log("%c\u200B", "color: transparent;font-size: " + h * 0.854 + "px !important;background: url(" + src + ");display:block;border-right: " + w + "px solid transparent");
        } else {
          console.log("%c", "background: url(" + src + ") no-repeat; display: block;width: " + w + "px; height: " + h + "px;");
        }
        def.resolve();
      };
      if (isFinite(customWidth) && isFinite(customHeight)) {
        drawImage(+customWidth, +customHeight);
      } else {
        x$ = new Image;
        x$.onload = function(){
          drawImage(this.width, this.height);
        };
        x$.onerror = function(){
          console.log("[couldn't load image %s]", src);
          def.reject();
        };
        x$.src = src;
      }
      return def.promise();
    };
    /*@source p0ne.module.ls */
    /**
     * Module script for loading disable-able chunks of code
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    window.module = function(name, data){
      var setup, require, optional, update, persistent, disable, disableLate, module, settings, displayName, disabled, _settings, settingsPerCommunity, moderator, fn, cbs, arrEqual, objEqual, helperFNs, module_, i$, ref$, len$, k, err, dependenciesLoading, failedRequirements, l, r, ref1$, ref2$, that, optionalRequirements, res$, roomSlug, disabledModules, settingsKey, def, e;
      try {
        if (typeof name === 'string') {
          data.name = name;
        } else {
          data = name;
          if (data) {
            name = data.name;
          }
        }
        if (typeof data === 'function') {
          setup = data;
        } else {
          require = data.require, optional = data.optional, setup = data.setup, update = data.update, persistent = data.persistent, disable = data.disable, disableLate = data.disableLate, module = data.module, settings = data.settings, displayName = data.displayName, disabled = data.disabled, _settings = data._settings, settingsPerCommunity = data.settingsPerCommunity, moderator = data.moderator;
        }
        if (module) {
          if (typeof module === 'function') {
            fn = module;
            module = function(){
              return fn.apply(module, arguments);
            };
            importAll$(module, data);
          } else if (typeof module === 'object') {
            importAll$(module, data);
          } else {
            console.warn(getTime() + " [" + name + "] TypeError when initializing. `module` needs to be either an Object or a Function but is " + typeof module);
            module = data;
          }
        } else {
          module = data;
        }
        module.displayName = displayName || name;
        cbs = module._cbs = {};
        arrEqual = function(a, b){
          var i$, len$, i;
          if (!a || !b || a.length !== b.length) {
            return false;
          }
          for (i$ = 0, len$ = a.length; i$ < len$; ++i$) {
            i = i$;
            if (a[i] !== b[i]) {
              return false;
            }
          }
          return true;
        };
        objEqual = function(a, b){
          var k;
          if (a === b) {
            return true;
          }
          if (!a || !b) {
            return false;
          }
          for (k in a) {
            if (a[k] !== b[k]) {
              return false;
            }
          }
          return true;
        };
        helperFNs = {
          addListener: function(target){
            var args, ref$, that;
            args = slice$.call(arguments, 1);
            if (target === 'early') {
              ref$ = args, target = ref$[0], args = slice$.call(ref$, 1);
              if (target.onEarly) {
                target.onEarly.apply(target, args);
              } else {
                console.warn(getTime() + " [" + name + "] cannot use .onEarly on", target);
              }
            } else if (target === 'once' || target === 'one') {
              ref$ = args, target = ref$[0], args = slice$.call(ref$, 1);
              if (that = target.once || target.one) {
                that.apply(target, args);
              } else {
                console.warn(getTime() + " [" + name + "] cannot use .once / .one on", target);
              }
            } else {
              target.on.apply(target, args);
            }
            (ref$ = cbs.listeners || (cbs.listeners = []))[ref$.length] = {
              target: target,
              args: args
            };
            return args[args.length - 1];
          },
          replace: function(target, attr, repl){
            var orig, replacement, ref$;
            if (attr in target) {
              orig = target[attr];
              if (!(attr + "_" in target)) {
                target[attr + "_"] = orig;
              }
            } else {
              target[attr + "_"] = null;
            }
            target[attr] = replacement = repl(target[attr]);
            (ref$ = cbs.replacements || (cbs.replacements = []))[ref$.length] = [target, attr, replacement, orig];
            return replacement;
          },
          revert: function(target_, attr_){
            var didReplace, i$, ref$, len$, ref1$, target, attr, replacement, orig;
            if (!cbs.replacements) {
              return false;
            }
            didReplace = false;
            if (attr_) {
              for (i$ = 0, len$ = (ref$ = cbs.replacements).length; i$ < len$; ++i$) {
                ref1$ = ref$[i$], target = ref1$[0], attr = ref1$[1], replacement = ref1$[2], orig = ref1$[3];
                if (target === target_ && attr_ === attr && target[attr] === replacement) {
                  target[attr] = orig;
                  cbs.replacements;
                  return true;
                }
              }
            } else if (target_) {
              for (i$ = 0, len$ = (ref$ = cbs.replacements).length; i$ < len$; ++i$) {
                ref1$ = ref$[i$], target = ref1$[0], attr = ref1$[1], replacement = ref1$[2], orig = ref1$[3];
                if (target === target_ && target[attr] === replacement) {
                  target[attr] = orig;
                  didReplace = true;
                }
              }
            } else {
              for (i$ = 0, len$ = (ref$ = cbs.replacements).length; i$ < len$; ++i$) {
                ref1$ = ref$[i$], target = ref1$[0], attr = ref1$[1], replacement = ref1$[2], orig = ref1$[3];
                if (target === target_) {
                  target[attr] = orig;
                  didReplace = true;
                }
              }
            }
            return didReplace;
          },
          replaceListener: function(emitter, event, ctx, callback){
            var evts, ref$, i$, len$, e;
            if (!(evts = emitter != null ? (ref$ = emitter._events) != null ? ref$[event] : void 8 : void 8)) {
              console.error(getTime() + " [ERROR] unable to replace listener of type '" + event + "' (no such event for event emitter specified)", emitter, ctx);
              return false;
            }
            if (callback) {
              for (i$ = 0, len$ = evts.length; i$ < len$; ++i$) {
                e = evts[i$];
                if (e.ctx instanceof ctx) {
                  return this.replace(e, 'callback', callback);
                }
              }
            } else {
              callback = ctx;
              for (i$ = 0, len$ = evts.length; i$ < len$; ++i$) {
                e = evts[i$];
                if (e.ctx.cid) {
                  return this.replace(e, 'callback', callback);
                }
              }
            }
            console.error(getTime() + " [ERROR] unable to replace listener of type '" + event + "' (no appropriate callback found)", emitter, ctx);
            return false;
          },
          replace_$Listener: function(event, constructor, callback){
            if (typeof _$context == 'undefined' || _$context === null) {
              console.error(getTime() + " [ERROR] unable to replace listener in _$context._events['" + event + "'] (no _$context)");
              return false;
            }
            helperFNs.replaceListener(_$context, event, constructor, callback);
          },
          add: function(target, callback, options){
            var d, ref$;
            d = [target, callback, options];
            if (options != null && options.bound) {
              callback = callback.bind(module);
            }
            d.index = target.length;
            target[d.index] = callback;
            (ref$ = cbs.adds || (cbs.adds = []))[ref$.length] = d;
          },
          $create: function(html){
            var ref$;
            return (ref$ = cbs.$elements || (cbs.$elements = []))[ref$.length] = $(html);
          },
          $createPersistent: function(html){
            var ref$;
            return (ref$ = cbs.$elementsPersistent || (cbs.$elementsPersistent = []))[ref$.length] = $(html);
          },
          css: function(name, str){
            p0neCSS.css(name, str);
            (cbs.css || (cbs.css = {}))[name] = str;
          },
          loadStyle: function(url){
            p0neCSS.loadStyle(url);
            (cbs.loadedStyles || (cbs.loadedStyles = {}))[url] = true;
          },
          toggle: function(){
            if (this.disabled) {
              this.enable();
              return true;
            } else {
              this.disable();
              return false;
            }
          },
          enable: function(){
            var err;
            if (!this.disabled) {
              return;
            }
            this.disabled = false;
            if (!module.modDisabled) {
              disabledModules[name] = false;
            }
            try {
              setup.call(module, helperFNs, module, data, module);
              API.trigger('p0ne:moduleEnabled', module);
              console.info(getTime() + " [" + name + "] enabled", setup !== null);
            } catch (e$) {
              err = e$;
              console.error(getTime() + " [" + name + "] error while re-enabling", err.stack);
            }
            return this;
          },
          disable: function(temp){
            var newModule, i$, ref$, len$, ref1$, target, args, attr, replacement, orig, d, style, url, $el, m, err;
            if (module.disabled) {
              return;
            }
            if (temp && temp !== true) {
              newModule = temp;
            }
            try {
              module.disabled = true;
              if (typeof disable === 'function') {
                disable.call(module, helperFNs, newModule, data);
              }
              for (i$ = 0, len$ = (ref$ = cbs.listeners || []).length; i$ < len$; ++i$) {
                ref1$ = ref$[i$], target = ref1$.target, args = ref1$.args;
                target.off.apply(target, args);
              }
              for (i$ = 0, len$ = (ref$ = cbs.replacements || []).length; i$ < len$; ++i$) {
                ref1$ = ref$[i$], target = ref1$[0], attr = ref1$[1], replacement = ref1$[2], orig = ref1$[3];
                if (target[attr] === replacement) {
                  target[attr] = orig;
                }
              }
              for (i$ = 0, len$ = (ref$ = cbs.adds || []).length; i$ < len$; ++i$) {
                d = ref$[i$], target = d[0];
                target.remove(d.index);
                d.index = -1;
              }
              for (style in cbs.css) {
                p0neCSS.css(style, "/* disabled */");
              }
              for (url in cbs.loadedStyles) {
                p0neCSS.unloadStyle(url);
              }
              for (i$ = 0, len$ = (ref$ = cbs.$elements || []).length; i$ < len$; ++i$) {
                $el = ref$[i$];
                $el.remove();
              }
              for (i$ = 0, len$ = (ref$ = p0ne.dependencies[name] || []).length; i$ < len$; ++i$) {
                m = ref$[i$];
                m.disable();
              }
              if (!module.modDisabled && !temp) {
                disabledModules[name] = true;
              }
              if (!newModule) {
                for (i$ = 0, len$ = (ref$ = cbs.$elementsPersistent || []).length; i$ < len$; ++i$) {
                  $el = ref$[i$];
                  $el.remove();
                }
                API.trigger('p0ne:moduleDisabled', module);
                console.info(getTime() + " [" + name + "] disabled");
                dataUnload("p0ne/" + name);
              }
              delete cbs.listeners, delete cbs.replacements, delete cbs.adds, delete cbs.css, delete cbs.loadedStyles, delete cbs.$elements;
              if (typeof disableLate === 'function') {
                disableLate.call(module, helperFNs, newModule, data);
              }
            } catch (e$) {
              err = e$;
              console.error(getTime() + " [module] failed to disable '" + name + "' cleanly", err.stack);
              delete window[name];
            }
            delete p0ne.dependencies[name];
            return this;
          }
        };
        module.trigger = function(target){
          var args, i$, ref$, len$, listener, isMatch, l, j$, ref1$, len1$, i, arg, fn;
          args = slice$.call(arguments, 1);
          for (i$ = 0, len$ = (ref$ = cbs.listeners || []).length; i$ < len$; ++i$) {
            listener = ref$[i$];
            if (listener.target === target) {
              isMatch = true;
              l = listener.args.length - 1;
              for (j$ = 0, len1$ = (ref1$ = listener.args).length; j$ < len1$; ++j$) {
                i = j$;
                arg = ref1$[j$];
                if (arg !== args[i] && !(typeof arg === 'string' && arg.split(/\s+/).has(args[i]))) {
                  if (i + 1 < args.length && i !== l) {
                    isMatch = false;
                  }
                  break;
                }
              }
              if (isMatch) {
                fn = (ref1$ = listener.args)[ref1$.length - 1];
                if (typeof fn === 'function') {
                  fn(args.slice(i));
                }
              }
            }
          }
        };
        module.disable = helperFNs.disable;
        module.enable = helperFNs.enable;
        if (module_ = window[name]) {
          for (i$ = 0, len$ = (ref$ = persistent || []).length; i$ < len$; ++i$) {
            k = ref$[i$];
            module[k] = module_[k];
          }
          if (!module_.disabled) {
            try {
              if (typeof module_.disable === 'function') {
                module_.disable(module);
              }
            } catch (e$) {
              err = e$;
              console.error(getTime() + " [module] failed to disable '" + name + "' cleanly", err.stack);
            }
          }
        }
        dependenciesLoading = 1;
        failedRequirements = [];
        l = 0;
        for (i$ = 0, len$ = (ref$ = require || []).length; i$ < len$; ++i$) {
          r = ref$[i$];
          if (!r) {
            failedRequirements[l++] = r;
          } else if (typeof r === 'string' && !window[r]) {
            (ref1$ = (ref2$ = p0ne.dependencies)[r] || (ref2$[r] = []))[ref1$.length] = this;
            failedRequirements[l++] = r;
          } else if (that = l === 0 && r.loading || typeof r === 'string' && ((ref1$ = window[r]) != null ? ref1$.loading : void 8)) {
            dependenciesLoading++;
            that.done(loadingDone).fail(loadingFailed);
          }
        }
        if (l) {
          console.error(getTime() + " [" + name + "] didn't initialize (" + humanList(failedRequirements) + " " + (failedRequirements.length > 1 ? 'are' : 'is') + " required)");
          return module;
        }
        res$ = [];
        for (i$ = 0, len$ = (ref$ = optional || []).length; i$ < len$; ++i$) {
          r = ref$[i$];
          if (!r || (typeof r === 'string' && !window[r])) {
            res$.push(r);
          }
        }
        optionalRequirements = res$;
        if (optionalRequirements.length) {
          console.warn(getTime() + " [" + name + "] couldn't load optional requirement" + (optionalRequirements.length > 1 && 's' || '') + ": " + humanList(optionalRequirements) + ". This module may only run with limited functionality");
        }
        if (module.help != null) {
          module.help = module.help.replace(/\n/g, "<br>\n");
        }
        if (settingsPerCommunity) {
          roomSlug = getRoomSlug();
          disabledModules = p0ne.disabledModules._rooms[roomSlug];
        } else {
          disabledModules = p0ne.disabledModules;
        }
        if (name in disabledModules) {
          module.disabled = disabledModules[name];
        } else {
          module.disabled = disabledModules[name] = !!disabled;
        }
        if (moderator && !user.isStaff && !module.disabled) {
          module.modDisabled = module.disabled = true;
        }
        if (module_ != null && module_._settings) {
          module._settings = module_._settings;
        } else if (_settings) {
          if (settingsPerCommunity) {
            settingsKey = "p0ne__" + roomSlug + "_" + name;
          } else {
            settingsKey = "p0ne_" + name;
          }
          dependenciesLoading++;
          dataLoad(settingsKey, _settings, function(err, _settings){
            module._settings = _settings;
            if (err) {
              console.warn("[p0ne] error loading settings for " + name, err);
            }
            loadingDone();
          });
        }
        window[name] = p0ne.modules[name] = module;
        if (dependenciesLoading > 1) {
          def = $.Deferred();
          module.loading = def.promise();
        }
        loadingDone();
      } catch (e$) {
        e = e$;
        console.error(getTime() + " [p0ne module] error initializing '" + name + "':", e.stack);
      }
      return module;
      function loadingDone(){
        var time, wasDisabled, e;
        if (--dependenciesLoading === 0 && 0 === failedRequirements.length) {
          time = getTime();
          delete module.loading;
          if (module.disabled) {
            if (module.modDisabled) {
              wasDisabled = ", %cbut is for moderators only";
            } else {
              wasDisabled = ", %cbut is (still) disabled";
            }
            if (def != null) {
              def.reject(module);
            }
          } else {
            wasDisabled = "%c";
            try {
              if (setup != null) {
                setup.call(module, helperFNs, module, data, module_);
              }
              if (def != null) {
                def.resolve(module);
              }
            } catch (e$) {
              e = e$;
              console.error(time + " [" + name + "] error initializing", e.stack);
              module.disable(true);
              if (def != null) {
                def.reject(module);
              }
              delete window[name];
            }
          }
          delete module.loading;
          if (module_) {
            API.trigger('p0ne:moduleUpdated', module, module_);
            return console.info(time + " [" + name + "] updated" + wasDisabled, "color: orange");
          } else {
            API.trigger('p0ne:moduleLoaded', module);
            return console.info(time + " [" + name + "] initialized" + wasDisabled, "color: orange");
          }
        }
      }
      function loadingFailed(){
        var ref$;
        if (def != null) {
          def.reject(module);
        }
        delete module.loading;
        return ref$ = window[name], delete window[name], ref$;
      }
    };
    /*@source p0ne.auxiliary-modules.ls */
    /**
     * Auxiliary plug_p0ne modules
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #            AUXILIARIES             #
    ####################################*/
    module('getActivePlaylist', {
      require: ['playlists'],
      module: function(){
        return playlists.findWhere({
          active: true
        });
      }
    });
    module('updateUserData', {
      require: ['user_', 'users', '_$context'],
      setup: function(arg$){
        var addListener, i$, ref$, len$, user;
        addListener = arg$.addListener;
        addListener(window.user_, 'change:username', function(){
          user.username = window.user_.get('username');
        });
        for (i$ = 0, len$ = (ref$ = users.models).length; i$ < len$; ++i$) {
          user = ref$[i$];
          user.set('joinedRoom', -1);
        }
        addListener(API, 'userJoin', function(arg$){
          var id;
          id = arg$.id;
          users.get(id).set('joinedRoom', Date.now());
        });
      }
    });
    module('throttleOnFloodAPI', {
      setup: function(arg$){
        var addListener;
        addListener = arg$.addListener;
        addListener(API, 'socket:floodAPI', function(){
          /* all AJAX and Socket functions should check if the counter is AT LEAST below 20 */
          window.floodAPI_counter += 20;
          sleep(15000, function(){
            /* it is assumed, that the API counter resets every 10 seconds. 15s is to provide enough buffer */
            window.floodAPI_counter -= 20;
          });
        });
      }
    });
    module('PopoutListener', {
      require: ['PopoutView'],
      optional: ['_$context'],
      setup: function(arg$){
        var replace;
        replace = arg$.replace;
        replace(PopoutView, 'render', function(r_){
          return function(){
            r_.apply(this, arguments);
            if (typeof _$context != 'undefined' && _$context !== null) {
              _$context.trigger('popout:open', PopoutView._window, PopoutView);
            }
            API.trigger('popout:open', PopoutView._window, PopoutView);
          };
        });
        replace(PopoutView, 'clear', function(c_){
          return function(){
            c_.apply(this, arguments);
            if (typeof _$context != 'undefined' && _$context !== null) {
              _$context.trigger('popout:close', PopoutView._window, PopoutView);
            }
            API.trigger('popout:close', PopoutView._window, PopoutView);
          };
        });
      }
    });
    module('chatDomEvents', {
      require: ['backbone'],
      optional: ['PopoutView', 'PopoutListener'],
      persistent: ['_events'],
      setup: function(arg$){
        var addListener, cm, on_, off_, patchCM, this$ = this;
        addListener = arg$.addListener;
        importAll$(this, backbone.Events);
        this.one = this.once;
        cm = $cm();
        on_ = this.on;
        this.on = function(){
          on_.apply(this, arguments);
          cm.on.apply(cm, arguments);
        };
        off_ = this.off;
        this.off = function(){
          off_.apply(this, arguments);
          cm.off.apply(cm, arguments);
        };
        patchCM = function(){
          var cm, event, ref$, callbacks, i$, len$, cb;
          cm = PopoutView.chat;
          for (event in ref$ = this$._events) {
            callbacks = ref$[event];
            for (i$ = 0, len$ = callbacks.length; i$ < len$; ++i$) {
              cb = callbacks[i$];
              cm.on(event, cb.callback, cb.context);
            }
          }
        };
        addListener(API, 'popout:open', patchCM);
      }
    });
    module('grabMedia', {
      require: ['playlists', 'auxiliaries'],
      optional: ['_$context'],
      module: function(playlistIDOrName, media, appendToEnd){
        var currentPlaylist, def, i$, ref$, len$, pl, playlist;
        currentPlaylist = playlists.get(playlists.getActiveID());
        def = $.Deferred();
        if (typeof playlistIDOrName === 'string' && !playlistIDOrName.startsWith('http')) {
          for (i$ = 0, len$ = (ref$ = playlists.models).length; i$ < len$; ++i$) {
            pl = ref$[i$];
            if (playlistIDOrName === pl.get('name')) {
              playlist = pl;
              break;
            }
          }
        } else if (!(playlist = playlists.get(playlistIDOrName))) {
          playlist = currentPlaylist;
          appendToEnd = media;
          media = playlistIDOrName;
        }
        if (!playlist) {
          console.error("[grabMedia] could not find playlist", arguments);
          def.reject('playlistNotFound');
          return def.promise();
        }
        if (!media) {
          addMedia(API.getMedia());
        } else if (media.duration || media.id) {
          addMedia(media);
        } else {
          mediaLookup(media, {
            success: addMedia,
            fail: function(err){
              console.error("[grabMedia] couldn't grab", err);
              def.reject('lookupFailed', err);
            }
          });
        }
        return def.promise();
        function addMedia(media){
          console.log("[grabMedia] add '" + media.author + " - " + media.title + "' to playlist:", playlist);
          playlist.set('syncing', true);
          media.get = l("it !-> this[it]");
          return ajax('POST', "playlists/" + playlist.id + "/media/insert", {
            media: auxiliaries.serializeMediaItems([media]),
            append: !!appendToEnd
          }).then(function(arg$){
            var data, e;
            data = arg$.data, e = data[0];
            if (playlist.id !== e.id) {
              console.warn("playlist mismatch", playlist.id, e.id);
              playlist.set('syncing', false);
              playlist = playlists.get(e.id) || playlist;
            }
            playlist.set('count', e.count);
            if (playlist.id === currentPlaylist.id) {
              if (typeof _$context != 'undefined' && _$context !== null) {
                _$context.trigger('PlaylistActionEvent:load', playlist.id, playlists.getActiveID() !== playlists.getVisibleID() && playlist.toArray());
              }
            }
            playlist.set('syncing', false);
            console.info("[grabMedia] successfully added to playlist");
            def.resolve(playlist.toJSON());
          }).fail(function(err){
            console.error("[grabMedia] error adding song to the playlist");
            def.reject('ajaxError', err);
          });
        }
      }
    });
    /*####################################
    #             CUSTOM CSS             #
    ####################################*/
    module('p0neCSS', {
      optional: ['PopoutListener', 'PopoutView'],
      $popoutEl: $(),
      styles: {},
      urlMap: {},
      persistent: ['styles'],
      setup: function(arg$){
        var addListener, $create, $el, $popoutEl, styles, urlMap, throttled, loadingStyles;
        addListener = arg$.addListener, $create = arg$.$create;
        this.$el = $create('<style>').appendTo('head');
        $el = this.$el, $popoutEl = this.$popoutEl, styles = this.styles, urlMap = this.urlMap;
        addListener(API, 'popout:open', function(_window, PopoutView){
          $popoutEl = $el.clone().loadAll(PopoutView.resizeBind).appendTo(_window.document.head);
        });
        if ((typeof PopoutView != 'undefined' && PopoutView !== null) && PopoutView._window) {
          PopoutView.render();
        }
        out$.getCustomCSS = this.getCustomCSS = function(inclExternal){
          var el;
          if (inclExternal) {
            return (function(){
              var i$, ref$, len$, results$ = [];
              for (i$ = 0, len$ = (ref$ = $el).length; i$ < len$; ++i$) {
                el = ref$[i$];
                results$.push(el.outerHTML);
              }
              return results$;
            }()).join('\n');
          } else {
            return $el.first().text();
          }
        };
        throttled = false;
        out$.css = this.css = function(name, css){
          if (css == null) {
            return styles[name];
          }
          styles[name] = css;
          if (!throttled) {
            throttled = true;
            requestAnimationFrame(function(){
              var res, n, ref$, css;
              throttled = false;
              res = "";
              for (n in ref$ = styles) {
                css = ref$[n];
                res += "/* " + n + " */\n" + css + "\n\n";
              }
              $el.first().text(res);
              $popoutEl.first().text(res);
            });
          }
        };
        loadingStyles = 0;
        out$.loadStyle = this.loadStyle = function(url){
          var s;
          console.log("[loadStyle] %c" + url, "color: #009cdd");
          if (urlMap[url]) {
            return urlMap[url]++;
          } else {
            urlMap[url] = 1;
          }
          loadingStyles++;
          s = $("<link rel='stylesheet' >").attr('href', url).on('load fail', function(){
            if (--loadingStyles === 0) {
              if (typeof _$context != 'undefined' && _$context !== null) {
                _$context.trigger('p0ne:stylesLoaded');
              }
              API.trigger('p0ne:stylesLoaded');
            }
          }).appendTo(document.head);
          $el.push(s[0]);
          if (typeof Layout != 'undefined' && Layout !== null) {
            Layout.onResize();
          }
          if ((typeof PopoutView != 'undefined' && PopoutView !== null) && PopoutView._window) {
            $popoutEl.push(s.clone().load(PopoutView.resizeBind).appendTo(PopoutView._window.document.head));
          }
        };
        out$.unloadStyle = this.unloadStyle = function(url){
          var i;
          if (urlMap[url] > 0) {
            urlMap[url]--;
          }
          if (urlMap[url] === 0) {
            console.log("[loadStyle] unload %c" + url, "color: #009cdd");
            delete urlMap[url];
            if (-1 !== (i = $el.indexOf("[href='" + url + "']"))) {
              $el.eq(i).remove();
              $el.splice(i, 1);
              if (typeof Layout != 'undefined' && Layout !== null) {
                Layout.onResize();
              }
            }
            if (-1 !== (i = $popoutEl.indexOf("[href='" + url + "']"))) {
              $popoutEl.eq(i).remove();
              $popoutEl.splice(i, 1);
              if ((typeof PopoutView != 'undefined' && PopoutView !== null) && PopoutView._window) {
                PopoutView.resizeBind();
              }
            }
          }
        };
        this.disable = function(){
          $el.remove();
          $popoutEl.remove();
          if (typeof Layout != 'undefined' && Layout !== null) {
            Layout.onResize();
          }
          if ((typeof PopoutView != 'undefined' && PopoutView !== null) && PopoutView._window) {
            PopoutView.resizeBind();
          }
        };
      }
    });
    module('_$contextUpdateEvent', {
      require: ['_$context'],
      setup: function(arg$){
        var replace, i$, ref$, len$, fn;
        replace = arg$.replace;
        for (i$ = 0, len$ = (ref$ = ['on', 'off', 'onEarly']).length; i$ < len$; ++i$) {
          fn = ref$[i$];
          replace(_$context, fn, fn$);
        }
        function fn$(fn_){
          return function(type, cb, context){
            fn_.apply(this, arguments);
            _$context.trigger('context:update', type, cb, context);
          };
        }
      }
    });
    /*
    module \login, do
        persistent: <[ showLogin ]>
        module: !->
            if @showLogin
                @showLogin!
            else if not @loading
                @loading = true
                $.getScript "#{p0ne.host}/plug_p0ne.login.js"*/
    /*@source p0ne.perf.ls */
    /**
     * performance enhancements for plug.dj
     * the perfEmojify module also adds custom emoticons
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    module('jQueryPerf', {
      setup: function(arg$){
        var replace, core_rnotwhite;
        replace = arg$.replace;
        core_rnotwhite = /\S+/g;
        if ('classList' in document.body) {
          replace(jQuery.fn, 'addClass', function(){
            return function(value){
              var i$, len$, j, classes, i, elem, clazz;
              if (jQuery.isFunction(value)) {
                for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
                  j = this[i$];
                  jQuery(this).addClass(value.call(this, j, this.className));
                }
              } else if (typeof value === 'string' && value) {
                classes = value.match(core_rnotwhite) || [];
                i = 0;
                while (elem = this[i++]) {
                  if (elem.nodeType === 1) {
                    j = 0;
                    while (clazz = classes[j++]) {
                      elem.classList.add(clazz);
                    }
                  }
                }
              }
              return this;
            };
          });
          replace(jQuery.fn, 'removeClass', function(){
            return function(value){
              var i$, len$, j, i, elem, clazz, classes;
              if (jQuery.isFunction(value)) {
                for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
                  j = this[i$];
                  jQuery(this).removeClass(value.call(this, j, this.className));
                }
              } else if (value == null) {
                i = 0;
                while (elem = this[i++]) {
                  if (elem.nodeType === 1) {
                    j = elem.classList.length;
                    while (clazz = elem.classList[--j]) {
                      elem.classList.remove(clazz);
                    }
                  }
                }
              } else if (typeof value === 'string' && value) {
                classes = value.match(core_rnotwhite) || [];
                i = 0;
                while (elem = this[i++]) {
                  if (elem.nodeType === 1) {
                    j = 0;
                    while (clazz = classes[j++]) {
                      elem.classList.remove(clazz);
                    }
                  }
                }
              }
              return this;
            };
          });
          replace(jQuery.fn, 'hasClass', function(){
            return function(className){
              var i, elem;
              i = 0;
              while (elem = this[i++]) {
                if (elem.classList.contains(className)) {
                  return true;
                }
              }
              return false;
            };
          });
        }
      }
    });
    module('perfEmojify', {
      require: ['emoticons'],
      setup: function(arg$){
        var replace, escapeReg;
        replace = arg$.replace;
        escapeReg = function(e){
          return e.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
        };
        emoticons.autoEmoteMap = {
          /*NOTE: since plug_p0ne v1.6.3, emoticons are case-sensitive */
          ">:(": 'angry',
          ">XD": 'astonished',
          ":DX": 'bowtie',
          "</3": 'broken_heart',
          ":$": 'confused',
          "X$": 'confounded',
          ":~(": 'cry',
          ":[": 'disappointed',
          ":~[": 'disappointed_relieved',
          "XO": 'dizzy_face',
          ":|": 'expressionless',
          "8|": 'flushed',
          ":(": 'frowning',
          ":#": 'grimacing',
          ":D": 'grinning',
          "<3": 'heart',
          "<3)": 'heart_eyes',
          "O:)": 'innocent',
          ":~)": 'joy',
          ":*": 'kissing',
          ":<3": 'kissing_heart',
          "X<3": 'kissing_closed_eyes',
          "XD": 'laughing',
          ":O": 'open_mouth',
          "Z:|": 'sleeping',
          ":)": 'smiley',
          ":/": 'smirk',
          "T_T": 'sob',
          ":P": 'stuck_out_tongue',
          "X-P": 'stuck_out_tongue_closed_eyes',
          ";P": 'stuck_out_tongue_winking_eye',
          "B-)": 'sunglasses',
          "~:(": 'sweat',
          "~:)": 'sweat_smile',
          "XC": 'tired_face',
          ">:/": 'unamused',
          ";)": 'wink'
        };
        emoticons.update = function(){
          var k, ref$, v, h, i$, len$, i, letter, l, tmp;
          this.reverseMap = {};
          this.trie = {};
          for (k in ref$ = this.map) {
            v = ref$[k];
            if (this.reverseMap[v]) {
              continue;
            }
            this.reverseMap[v] = k;
            h = this.trie;
            for (i$ = 0, len$ = k.length; i$ < len$; ++i$) {
              i = i$;
              letter = k[i$];
              l = h[letter];
              if (typeof h[letter] === 'string') {
                h[letter] = {
                  _list: [l]
                };
                if (l.length > i) {
                  h[letter][l[i + 1]] = l;
                }
              }
              if (l) {
                h[letter] || (h[letter] = {
                  _list: []
                });
              } else {
                h[letter] = k;
                break;
              }
              h[letter]._list = (h[letter]._list.concat(k)).sort();
              h = h[letter];
            }
          }
          for (k in ref$ = this.autoEmoteMap) {
            v = ref$[k];
            if (k !== (tmp = k.replace(/</g, "&lt;").replace(/>/g, "&gt;"))) {
              this.autoEmoteMap[tmp] = v;
              delete this.autoEmoteMap[k];
            }
          }
          this.regAutoEmote = RegExp('(^|\\s|&nbsp;)(' + Object.keys(this.autoEmoteMap).map(escapeReg).join("|") + ')(?=\\s|$)', 'g');
        };
        emoticons.update();
        replace(emoticons, 'emojify', function(){
          return function(str){
            var lastWasEmote, this$ = this;
            lastWasEmote = false;
            return str.replace(/:(.*?)(?=:)|:(.*)$/g, function(_, emote, post){
              var p, lastWasEmote_;
              if ((p = typeof post !== 'string') && !lastWasEmote && this$.map[emote]) {
                lastWasEmote = true;
                return "<span class='emoji-glow'><span class='emoji emoji-" + this$.map[emote] + "'></span></span>";
              } else {
                lastWasEmote_ = lastWasEmote;
                lastWasEmote = false;
                return (lastWasEmote_ ? '' : ':') + "" + (p ? emote : post);
              }
            }).replace(this.regAutoEmote, function(arg$, pre, emote){
              return pre + ":" + this$.autoEmoteMap[emote] + ":";
            });
          };
        });
        replace(emoticons, 'lookup', function(){
          return function(str){
            var h, res, i$, len$, i, letter, j$, to$;
            h = this.trie;
            for (i$ = 0, len$ = str.length; i$ < len$; ++i$) {
              i = i$;
              letter = str[i$];
              h = h[letter];
              switch (typeof h) {
              case 'undefined':
                return [];
              case 'string':
                for (j$ = i + 1, to$ = str.length; j$ < to$; ++j$) {
                  i = j$;
                  if (str[i] !== h[i]) {
                    return [];
                  }
                }
                return [h];
              }
            }
            return h._list;
          };
        });
      }
    });
    /*@source p0ne.sjs.ls */
    /**
     * propagate Socket Events to the API Event Emitter for custom event listeners
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #          SOCKET LISTENERS          #
    ####################################*/
    module('socketListeners', {
      require: ['socketEvents'],
      optional: ['_$context', 'auxiliaries'],
      logUnmatched: false,
      lastHandshake: 0,
      setup: function(arg$, socketListeners){
        var replace, base_url, ref$, onRoomJoinQueue2, i$, len$;
        replace = arg$.replace;
        window.Socket || (window.Socket = window.SockJS || window.WebSocket);
        if (Socket === window.SockJS) {
          base_url = "https://shalamar.plug.dj:443/socket";
        } else {
          base_url = "wss://godj.plug.dj/socket";
        }
        if (((ref$ = window.socket) != null ? ref$.url : void 8) === base_url) {
          return;
        }
        onRoomJoinQueue2 = [];
        for (i$ = 0, len$ = ['send', 'dispatchEvent', 'close'].length; i$ < len$; ++i$) {
          (fn$.call(this, ['send', 'dispatchEvent', 'close'][i$]));
        }
        function onMessage(t){
          var n, r, i$, ref$, len$, e;
          if (room.get('joined')) {
            return forEach(t.data);
          } else {
            n = [];
            r = [];
            for (i$ = 0, len$ = (ref$ = t.data).length; i$ < len$; ++i$) {
              e = ref$[i$];
              if (e.s === 'dashboard') {
                n[n.length] = e;
              } else {
                r[r.length] = e;
              }
            }
            forEach(n);
            return onRoomJoinQueue2.push(r);
          }
        }
        function forEach(t){
          var i$, ref$, len$, el, err, results$ = [];
          for (i$ = 0, len$ = (ref$ = t || []).length; i$ < len$; ++i$) {
            el = ref$[i$];
            if (socketEvents[el.a]) {
              try {
                socketEvents[el.a](el.p);
              } catch (e$) {
                err = e$;
                console.error(getTime() + " [Socket] failed triggering '" + el.a + "'", err.stack);
              }
            }
            _$context.trigger("socket:" + el.a, el);
            results$.push(API.trigger("socket:" + el.a, el));
          }
          return results$;
        }
        function fn$(event){
          replace(Socket.prototype, event, function(e_){
            return function(){
              var url, err, this$ = this;
              try {
                e_.apply(this, arguments);
                url = this._base_url || this.url;
                if (window.socket !== this && url === base_url) {
                  replace(window, 'socket', function(){
                    return this$;
                  });
                  replace(this, 'onmessage', function(msg_){
                    return function(t){
                      var data, i$, len$, el, type, ref$;
                      socketListeners.lastHandshake = Date.now();
                      if (t.data === 'h') {
                        return;
                      }
                      if (typeof t.data === 'string') {
                        data = JSON.parse(t.data);
                      } else {
                        data = t.data || [];
                      }
                      for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
                        el = data[i$];
                        _$context.trigger("socket:" + el.a, el);
                      }
                      type = (ref$ = data[0]) != null ? ref$.a : void 8;
                      if (!type) {
                        console.warn("[SOCKET:WARNING] socket message format changed", t);
                      }
                      msg_.apply(this, arguments);
                      for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
                        el = data[i$];
                        API.trigger("socket:" + el.a, el);
                      }
                    };
                  });
                  _$context.on('room:joined', function(){
                    while (onRoomJoinQueue2.length) {
                      forEach(onRoomJoinQueue2.shift());
                    }
                  });
                  socket.emit = function(e, t, n){
                    socket.send(JSON.stringify({
                      a: e,
                      p: t,
                      t: typeof auxiliaries != 'undefined' && auxiliaries !== null ? auxiliaries.getServerEpoch() : void 8,
                      d: n
                    }));
                  };
                  /*socketListeners.hoofcheck = repeat 1.min, !->
                      if Date.now! > socketListeners.lastHandshake + 2.min
                          console.warn "the socket seems to have silently disconnected, trying to reconnect. last message", ago(socketListeners.lastHandshake)
                          reconnectSocket!*/
                  console.info("[Socket] socket patched (using ." + event + ")", this);
                } else if (socketListeners.logUnmatched && window.socket !== this) {
                  console.warn("socket found, but url differs '" + url + "'", this);
                }
              } catch (e$) {
                err = e$;
                out$.err = err;
                console.error("error when patching socket", this, err.stack);
              }
            };
          });
        }
      },
      disable: function(){
        clearInterval(this.hoofcheck);
      }
    });
    /*@source p0ne.fixes.ls */
    /**
     * Fixes for plug.dj bugs
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #                FIXES               #
    ####################################*/
    module('simpleFixes', {
      setup: function(arg$){
        var addListener, replace;
        addListener = arg$.addListener, replace = arg$.replace;
        this.scm = $('#twitter-menu, #facebook-menu, .shop-button').detach();
        replace($('#chat-input-field')[0], 'tabIndex', function(){
          return 1;
        });
        replace(localStorage, 'clear', function(){
          return $.noop;
        });
        addListener(API, 'socket:reconnected', function(){
          var ref$;
          if ((app != null ? (ref$ = app.dialog.dialog) != null ? ref$.options.title : void 8 : void 8) === Lang.alerts.connectionError) {
            app.dialog.$el.hide();
          }
        });
        replace(window._, 'bind', function(bind_){
          return function(func, context){
            if (func) {
              return bind_.apply(this, arguments);
            } else {
              return null;
            }
          };
        });
      },
      disable: function(){
        var ref$;
        if ((ref$ = this.scm) != null) {
          ref$.insertAfter('#playlist-panel');
        }
      }
    });
    /* NOT WORKING
    module \fixMediaReload, do
        require: <[ currentMedia ]>
        setup: ({replace}) !->
            replace currentMedia, \set, (s_) !-> return (a, b) !->
                if a.historyID and a.historyID == @get \historyID
                    console.log "avoid force-reloading current song"
                    return this
                else
                    return s_.call this, a, b
    */
    module('fixMediaThumbnails', {
      require: ['auxiliaries'],
      help: 'Plug.dj changed the Soundcloud thumbnail URL several times, but never updated the paths in their song database, so many songs have broken thumbnail images.\nThis module fixes this issue.',
      setup: function(arg$){
        var replace, $create;
        replace = arg$.replace, $create = arg$.$create;
        replace(auxiliaries, 'deserializeMedia', function(){
          return function(e){
            var ref$;
            e.author = this.h2t(e.author);
            e.title = this.h2t(e.title);
            if (e.image) {
              if (e.format === 2) {
                if ((ref$ = parseURL(e.image).host) === 'plug.dj' || ref$ === 'cdn.plug.dj') {
                  e.image = "https://i.imgur.com/41EAJBO.png";
                }
              } else {
                if (e.image.startsWith("http:") || e.image.startsWith("//")) {
                  e.image = "https:" + e.image.substr(e.image.indexOf('//'));
                }
              }
            }
          };
        });
      }
    });
    module('fixGhosting', {
      displayName: 'Fix Ghosting',
      require: ['PlugAjax'],
      optional: ['login'],
      settings: 'fixes',
      settingsMore: function(){
        return $('<toggle val=warnings>Show Warnings</toggle>');
      },
      help: 'Plug.dj sometimes considers you to be "not in any room" even though you still are. This is also called "ghosting" because you can chat in a room that technically you are not in anymore. While ghosting you can still chat, but not join the waitlist or moderate. If others want to @mention you, you don\'t show up in the autocomplete.\n\ntl;dr this module automatically rejoins the room when you are ghosting',
      _settings: {
        verbose: true
      },
      setup: function(arg$){
        var replace, addListener, _settings, rejoining, queue, rejoinRoom;
        replace = arg$.replace, addListener = arg$.addListener;
        _settings = this._settings;
        rejoining = false;
        queue = [];
        addListener(API, 'socket:userLeave', function(arg$){
          var p;
          p = arg$.p;
          if (p === userID) {
            sleep(100, function(){
              rejoinRoom('you left the room');
            });
          }
        });
        replace(PlugAjax.prototype, 'onError', function(oE_){
          return function(status, data){
            if (status === 'notInRoom') {
              queue[queue.length] = this;
              rejoinRoom("got 'notInRoom' error from plug", true);
            } else {
              oE_.apply(this, arguments);
            }
          };
        });
        out$.rejoinRoom = rejoinRoom = function(reason, throttled){
          var this$ = this;
          if (rejoining && throttled) {
            console.warn("[fixGhosting] You are still ghosting, retrying to connect.");
          } else {
            console.warn("[fixGhosting] You are ghosting!", "Reason: " + reason);
            rejoining = true;
            ajax('POST', 'rooms/join', {
              slug: getRoomSlug()
            }, {
              success: function(data){
                var ref$, i$, len$, req;
                if (((ref$ = data.responseText) != null ? ref$[0] : void 8) === "<") {
                  if (data.responseText.has("You have been permanently banned from plug.dj")) {
                    chatWarn("your account got permanently banned. RIP", "fixGhosting");
                  } else {
                    chatWarn("cannot rejoin the room. Plug is acting weird, maybe it is in maintenance mode or you got IP banned?", "fixGhosting");
                  }
                } else {
                  if (_settings.verbose) {
                    chatWarn("reconnected to the room", "fixGhosting");
                  }
                  for (i$ = 0, len$ = (ref$ = queue).length; i$ < len$; ++i$) {
                    req = ref$[i$];
                    req.execute();
                  }
                  rejoining = false;
                  if (typeof _$context != 'undefined' && _$context !== null) {
                    _$context.trigger('p0ne:reconnected');
                  }
                  API.trigger('p0ne:reconnected');
                }
              },
              error: function(data){
                var statusCode, responseJSON, status;
                statusCode = data.statusCode, responseJSON = data.responseJSON;
                status = responseJSON != null ? responseJSON.status : void 8;
                switch (status) {
                case 'ban':
                  chatWarn("you are banned from this community", "fixGhosting");
                  break;
                case 'roomCapacity':
                  chatWarn("the room capacity is reached :/", "fixGhosting");
                  break;
                case 'notAuthorized':
                  chatWarn("you got logged out", "fixGhosting");
                  if (typeof login === 'function') {
                    login();
                  }
                  break;
                default:
                  switch (statusCode) {
                  case 401:
                    chatWarn("unexpected permission error while rejoining the room.", "fixGhosting");
                    break;
                  case 503:
                    chatWarn("plug.dj is in mainenance mode. nothing we can do here", "fixGhosting");
                    break;
                  case 521:
                  case 522:
                  case 524:
                    chatWarn("plug.dj is currently completly down", "fixGhosting");
                    break;
                  default:
                    chatWarn("cannot rejoin the room, unexpected error " + statusCode + " (" + datastatus + ")", "fixGhosting");
                  }
                }
                sleep(10 .min, function(){
                  rejoining = false;
                });
              }
            });
          }
        };
      }
    });
    module('fixOthersGhosting', {
      require: ['users', 'socketEvents'],
      displayName: "Fix Other Users Ghosting",
      settings: 'fixes',
      settingsMore: function(){
        return $('<toggle val=warnings>Show Warnings</toggle>');
      },
      help: 'Sometimes plug.dj does not properly emit join notifications, so that clients don\'t know another user joined a room. Thus they appear as "ghosts", as if they were not in the room but still can chat\n\nThis module detects "ghost" users and force-adds them to the room.',
      _settings: {
        verbose: true
      },
      setup: function(arg$){
        var addListener, css, this$ = this;
        addListener = arg$.addListener, css = arg$.css;
        addListener(API, 'chat', function(d){
          if (d.uid && !users.get(d.uid)) {
            console.info("[fixOthersGhosting] seems like '" + d.un + "' (" + d.uid + ") is ghosting");
            ajax('GET', "rooms/state").then(function(data){
              var i$, ref$, len$, yet$, i, u;
              for (yet$ = true, i$ = 0, len$ = (ref$ = data[0].users).length; i$ < len$; ++i$) {
                i = i$;
                u = ref$[i$];
                yet$ = false;
                if (!users.get(u.id)) {
                  socketEvents.userJoin(u);
                  if (this$._settings.verbose) {
                    chatWarn("force-joined #" + i + " " + d.un + " (" + d.uid + ") to the room", "p0ne");
                  }
                }
              } if (yet$) {
                ajax('GET', "users/" + d.uid, fn$);
              }
              function fn$(data){
                data.role = -1;
                socketEvents.userJoin(data);
                if (this$._settings.verbose) {
                  chatWarn(d.un + " (" + d.uid + ") is ghosting", "p0ne");
                }
              }
            }).fail(function(){
              console.error("[fixOthersGhosting] cannot load room data:", status, data);
              console.error("[fixOthersGhosting] cannot load user data:", status, data);
            });
          }
        });
      }
    });
    module('fixStuckDJ', {
      require: ['socketEvents'],
      optional: ['votes'],
      displayName: "Fix Stuck Advance",
      settings: 'fixes',
      settingsMore: function(){
        return $('<toggle val=warnings>Show Warnings</toggle>');
      },
      help: 'Sometimes plug.dj does not automatically start playing the next song. Usually you would have to reload the page to fix this bug.\n\nThis module detects stuck advances and automatically force-loads the next song.',
      _settings: {
        verbose: true
      },
      setup: function(arg$){
        var replace, addListener, fixStuckDJ, this$ = this;
        replace = arg$.replace, addListener = arg$.addListener;
        fixStuckDJ = this;
        if (API.getTimeRemaining() === 0 && API.getMedia()) {
          this.timer = sleep(5000, fixStuckDJ);
        }
        addListener(API, 'advance', function(d){
          console.log(getTime() + " [API.advance]");
          clearTimeout(this$.timer);
          if (d.media) {
            this$.timer = sleep(d.media.duration * 1000 + 2000, fixStuckDJ);
          }
        });
      },
      module: function(){
        var fixStuckDJ, showWarning, m, this$ = this;
        fixStuckDJ = this;
        if (showWarning = API.getTimeRemaining() === 0) {
          console.warn("[fixNoAdvance] song seems to be stuck, trying to fix…");
        }
        m = API.getMedia() || {};
        ajax('GET', 'rooms/state', {
          error: function(data){
            console.error("[fixNoAdvance] cannot load room data:", status, data);
            this$.timer = sleep(10000, fixStuckDJ);
          },
          success: function(data){
            var ref$, uid, i, v;
            (ref$ = data[0]).playback || (ref$.playback = {});
            if (m.id === data[0].playback.media) {
              console.log("[fixNoAdvance] the same song is still playing.");
            } else {
              (ref$ = data[0]).playback || (ref$.playback = {});
              socketEvents.advance({
                c: data[0].booth.currentDJ,
                d: data[0].booth.waitingDJs,
                h: data[0].playback.historyID,
                m: data[0].playback.media,
                t: data[0].playback.startTime,
                p: data[0].playback.playlistID
              });
              if (typeof votes != 'undefined' && votes !== null) {
                for (uid in data[0].grabs) {
                  votes.grab(uid);
                }
                for (i in ref$ = data[0].votes) {
                  v = ref$[i];
                  votes.vote({
                    i: i,
                    v: v
                  });
                }
              } else {
                console.warn("[fixNoAdvance] cannot properly set votes, because optional requirement `votes` is missing");
              }
              if (this$._settings.verbose && showWarning) {
                chatWarn("fixed DJ not advancing", "p0ne");
              }
            }
          }
        });
      }
    });
    /*
    module \fixNoPlaylistCycle, do
        require: <[ _$context ActivateEvent ]>
        displayName: "Fix No Playlist Cycle"
        settings: \fixes
        settingsMore: !-> return $ '<toggle val=warnings>Show Warnings</toggle>'
        help: '''
            Sometimes after DJing, plug.dj does not move the played song to the bottom of the playlist.
    
            This module automatically detects this bug and moves the song to the bottom.
        '''
        _settings:
            verbose: true
        setup: ({addListener}) !->
            addListener API, \socket:reconnected, !->
                _$context.dispatch new LoadEvent(LoadEvent.LOAD)
                _$context.dispatch new ActivateEvent(ActivateEvent.ACTIVATE)
            / *
            # manual check
            addListener API, \advance, ({dj, lastPlay}) !~>
                #ToDo check if spelling is correctly
                #ToDo get currentPlaylist
                if dj?.id == userID and lastPlay.media.id == currentPlaylist.song.id
                    #_$context .trigger \MediaMoveEvent:move
                    ajax \PUT, "playlists/#{currentPlaylist.id}/media/move", ids: [lastPlay.media.id], beforeID: 0
                    chatWarn "fixed playlist not cycling", "p0ne" if @_settings.verbose
            * /
    */
    module('zalgoFix', {
      settings: 'fixes',
      displayName: 'Fix Zalgo Messages',
      help: 'This avoids messages\' text bleeding out of the message, as it is the case with so called "Zalgo" messages.\nEnable this if you are dealing with spammers in the chat who use Zalgo.',
      setup: function(arg$){
        var css;
        css = arg$.css;
        css('zalgoFix', '.message {overflow: hidden;}');
      }
    });
    module('fixInHistoryHighlight', {
      settings: 'fixes',
      displayName: '☢ Fix InHistory',
      help: '[WORK IN PROGRESS]\nThis fixes the bug that unless you change to another playlist, some songs don\'t show up as "in history" in your playlist (have red text)',
      require: ['app'],
      setup: function(arg$){
        var addListener, playlist;
        addListener = arg$.addListener;
        playlist = app.footer.playlist.playlist.media;
        addListener(API, 'advance', function(d){
          var ref$, id, i$, len$, i, row;
          if (d.dj && d.dj.id !== user.id) {
            if ((ref$ = playlist.list.rowHash) != null && ref$[d.media.cid]) {
              id = d.media.id;
              for (i$ = 0, len$ = (ref$ = playlist.list.rows || []).length; i$ < len$; ++i$) {
                i = i$;
                row = ref$[i$];
                if (row.model.id === id) {
                  if (!row.$el.hasClass('in-history')) {
                    console.log("[☢ Fix InHistory]", d, id, playlist.list.rowHash[d.media.cid], row);
                    sleep(5000, fn$);
                  } else {
                    chatWarn("was already fixed", '☢ fixInHistoryHighlight');
                  }
                  break;
                }
              }
            }
          }
          function fn$(){
            if (row.$el.hasClass('in-history')) {
              chatWarn("fixed itself", '☢ fixInHistoryHighlight');
            } else {
              chatWarn('fixed by plug_p0ne', '☢ fixInHistoryHighlight');
              console.info(getTime() + " [fixInHistoryHighlight] fixed", row);
              row.$el.addClass('in-history');
            }
          }
        });
      }
    });
    module('warnOnAdblockPopoutBlock', {
      require: ['PopoutListener'],
      setup: function(arg$){
        var addListener, isOpen, warningShown;
        addListener = arg$.addListener;
        isOpen = false;
        warningShown = false;
        addListener(API, 'popout:open', function(_window, PopoutView){
          isOpen = true;
          sleep(1000, function(){
            isOpen = false;
          });
        });
        addListener(API, 'popout:close', function(_window, PopoutView){
          if (isOpen && !warningShown) {
            chatWarn("Popout chat immediately closed again. This might be because of an adblocker. You'd have to make an exception for plug.dj or disable your adblocker. Specifically Adblock Plus is known for causing this problem", "p0ne");
            warningShown = true;
            sleep(15 .min(function(){
              warningShown = false;
            }));
          }
        });
      }
    });
    module('chatEmojiPolyfill', {
      require: ['users'],
      _settings: {
        verbose: true
      },
      fixedUsernames: {},
      originalNames: {},
      setup: function(arg$){
        var addListener, replace, this$ = this;
        addListener = arg$.addListener, replace = arg$.replace;
        _.defer(function(){
          /*@security HTML injection should NOT be possible */
          /* Emoji-support detection from Modernizr https://github.com/Modernizr/Modernizr/blob/master/feature-detects/emoji.js */
          var pixelRatio, offset, x$, i$, ref$, len$, u, tmp, original, userRegexp, err;
          try {
            pixelRatio = window.devicePixelRatio || 1;
            offset = 12 * pixelRatio;
            x$ = document.createElement('canvas').getContext('2d');
            x$.fillStyle = '#f00';
            x$.textBaseline = 'top';
            x$.font = '32px Arial';
            x$.fillText('\ud83d\udc28', 0, 0);
            if (!deepEq$(x$.getImageData(offset, offset, 1, 1).data[0], 0, '===')) {
              console.info("[chatPolyfixEmoji] emojicons appear to be natively supported. fix will not be applied");
              this$.disable();
            } else {
              console.info("[chatPolyfixEmoji] emojicons appear to NOT be natively supported. applying fix…");
              css('chatPolyfixEmoji', '.emoji {position: relative;display: inline-block;}');
              for (i$ = 0, len$ = (ref$ = (typeof users != 'undefined' && users !== null ? users.models : void 8) || []).length; i$ < len$; ++i$) {
                u = ref$[i$];
                if ((tmp = emojifyUnicode(u.get('rawun'))) !== (original = u.get('rawun'))) {
                  if (this$._settings.verbose) {
                    console.log("\t[chatPolyfixEmoji] fixed username from '" + original + "' to '" + unemojify(tmp) + "'");
                  }
                  u.set('rawun', this$.fixedUsernames[u.id] = tmp);
                  this$.originalNames[u.id] = original;
                }
              }
              if (this$.fixedUsernames[userID]) {
                user.rawun = this$.fixedUsernames[userID];
                userRegexp = RegExp('@' + user.rawun, 'g');
              }
              if (typeof _$context != 'undefined' && _$context !== null) {
                addListener(_$context, 'user:join', function(u){
                  var tmp, original;
                  if ((tmp = emojifyUnicode(u.get('rawun'))) !== (original = u.get('rawun'))) {
                    if (this$._settings.verbose) {
                      console.log("[chatPolyfixEmoji] fixed username '" + original + "' => '" + unemojify(tmp) + "'");
                    }
                    u.set('rawun', this$.fixedUsernames[u.id] = tmp);
                    this$.originalNames[u.id] = original;
                  }
                });
                addListener(_$context, 'user:leave', function(u){
                  delete this$.fixedUsernames[u.id];
                  delete this$.originalNames[u.id];
                });
                addListener(_$context, 'chat:plugin', function(msg){
                  var tmp, that;
                  if (msg.uid && msg.message !== (tmp = emojifyUnicode(msg.message))) {
                    if (this$._settings.verbose) {
                      console.log("\t[chatPolyfixEmoji] fixed message '" + msg.message + "' to '" + unemojify(tmp) + "'");
                    }
                    msg.message = tmp;
                    if (that = this$.fixedUsernames[msg.uid]) {
                      msg.un_ = msg.un;
                      msg.un = that;
                    }
                    if (userRegexp != null) {
                      userRegexp.lastIndex = 0;
                      if (userRegexp.test(msg.message)) {
                        console.log("\t[chatPolyfixEmoji] fix mention");
                        msg.type = 'mention';
                        if ((typeof database != 'undefined' && database !== null) && database.settings.chatSound) {
                          msg.sound = 'mention';
                        }
                        (msg.mentions || (msg.mentions = [])).push("@" + user.rawun);
                      }
                    }
                  }
                });
                addListener('early', API, 'chat', function(msg){
                  if (msg.un_) {
                    msg.un = msg.un_;
                    delete msg.un_;
                  }
                });
                addListener(_$context, 'socket:userUpdate', function(u){
                  var tmp;
                  delete this$.fixedUsernames[u.id];
                  if ((tmp = emojifyUnicode(u.rawun)) !== u.rawun) {
                    if (this$._settings.verbose) {
                      console.log("[chatPolyfixEmoji] fixed username '" + u.rawun + "' => '" + unemojify(tmp) + "'");
                    }
                    u.rawun = this$.fixedUsernames[u.id] = tmp;
                    if (u.id === userID) {
                      user.rawun = this$.fixedUsernames[userID];
                      userRegexp = RegExp('@' + user.rawun, 'g');
                    }
                  }
                });
              }
            }
          } catch (e$) {
            err = e$;
            console.error("[chatPolyfixEmoji] error", err.stack);
          }
        });
      },
      disable: function(){
        var uid, ref$, original, ref1$;
        for (uid in ref$ = this.originalNames) {
          original = ref$[uid];
          if ((ref1$ = getUserInternal(uid)) != null) {
            ref1$.set('rawun', original);
          }
        }
        if (this.originalNames[userID]) {
          user.rawun = this.originalNames[userID];
        }
      }
    });
    module('disableIntercomTracking', {
      require: ['tracker'],
      disabled: true,
      settings: 'dev',
      displayName: 'Disable Tracking',
      setup: function(arg$){
        var replace, k, ref$, v;
        replace = arg$.replace;
        for (k in ref$ = tracker) {
          v = ref$[k];
          if (typeof v === 'function') {
            replace(tracker, k, fn$);
          }
        }
        replace(tracker, 'event', function(){
          return function(){
            return this;
          };
        });
        function fn$(){
          return function(){
            return $.noop;
          };
        }
      }
    });
    /*@source p0ne.stream.ls */
    /**
     * Modules for Audio-Only stream and stream settings for plug_p0ne
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
    */
    /* This modules includes the following things:
        - audio steam
        - a stream-settings field in the playback-controls (replacing the HD-button)
        - a blocked-video-unblocker
       These are all conbined into this one module to avoid conflicts
       and due to them sharing a lot of code
    */
    module('streamSettings', {
      require: ['app', 'currentMedia', 'database', '_$context'],
      optional: ['database'],
      audioOnly: false,
      _settings: {
        audioOnly: false
      },
      setup: function(arg$, streamSettings, arg1$, m_){
        var addListener, replace, revert, replaceListener, $create, css, $playback, $playbackContainer, $el, playback, $btn, $label, $icons, disabledBtns, Player, audio, unblocker, i$, youtube, ref$, sc, noDJ, syncingPlayer, streamOff, snoozed, that, player, this$ = this;
        addListener = arg$.addListener, replace = arg$.replace, revert = arg$.revert, replaceListener = arg$.replaceListener, $create = arg$.$create, css = arg$.css;
        css('streamSettings', ".icon-stream-video {background: " + getIcon('icon-chat-sound-on').background + ";}.icon-stream-audio {background: " + getIcon('icon-chat-room').background + ";}.icon-stream-off {background: " + getIcon('icon-chat-sound-off').background + ";}");
        $playback = $('#playback');
        $playbackContainer = $('#playback-container');
        $el = $create('<div class=p0ne-stream-select>');
        playback = {};
        if (m_ != null && m_._settings) {
          this._settings.audioOnly = m_._settings.audioOnly;
        }
        $('#playback-controls').removeClass('no-hd snoozed');
        replace(Playback.prototype, 'onHDClick', function(){
          return $.noop;
        });
        $btn = $('#playback .hd').addClass('p0ne-stream-select');
        this.$btn_ = $btn.children();
        $btn.html('<div class="box"><span id=p0ne-stream-label>Stream: Video</span><div class="p0ne-stream-buttons"><i class="icon icon-stream-video enabled"></i> <i class="icon icon-stream-audio enabled"></i> <i class="icon icon-stream-off enabled"></i> <div class="p0ne-stream-fancy"></div></div></div>');
        this.$label = $label = $btn.find('#p0ne-stream-label');
        $icons = $btn.find('.icon');
        disabledBtns = {};
        function disableBtn(mode){
          var $icon;
          disabledBtns[mode] = true;
          return $icon = $btn.find(".icon-stream-" + mode).removeClass('enabled');
        }
        addListener(API, 'advance', function(d){
          var mode;
          if (d.media) {
            for (mode in disabledBtns) {
              $btn.find(".icon-stream-" + mode).addClass('enabled');
              delete disabledBtns[mode];
            }
            if (d.media.format === 2) {
              disableBtn('video');
            }
          }
        });
        $btn.find('.icon-stream-video').on('click', function(){
          if (!disabledBtns.video) {
            database.settings.streamDisabled = false;
            this$._settings.audioOnly = false;
            changeStream('video');
            refresh();
          }
        });
        $btn.find('.icon-stream-audio').on('click', function(){
          var ref$;
          if (!disabledBtns.audio) {
            database.settings.streamDisabled = false;
            if (2 !== ((ref$ = currentMedia.get('media')) != null ? ref$.get('format') : void 8)) {
              this$._settings.audioOnly = true;
            }
            changeStream('audio');
            refresh();
          }
        });
        $btn.find('.icon-stream-off').on('click', function(){
          database.settings.streamDisabled = true;
          changeStream('off');
          refresh();
        });
        Player = {
          enable: function(){
            var media;
            console.log("[StreamSettings] loading " + this.name + " stream");
            media = currentMedia.get('media');
            if (this.media === media && this === player) {
              this.start();
            } else {
              this.media = media;
              this.getURL(media);
            }
          },
          getURL: function(){
            throw Error('unimplemented');
            /*@media.src = ...
            @start!*/
          },
          start: function(){
            this.seek();
            this.src = this.media.src;
            this.load();
            this.updateVolume(currentMedia.get('volume'));
            $playbackContainer.append(this);
          },
          disable: function(){
            this.src = "";
            $playbackContainer.empty();
          },
          seek: function(){
            var startTime;
            startTime = currentMedia.get('elapsed');
            if (player !== this) {
              return;
            } else if (startTime > 4 && currentMedia.get('remaining') > 4) {
              this.seekTo(startTime);
              console.log("[StreamSettings] " + this.name + " seeking…", mediaTime(startTime));
            } else {
              this.play();
            }
          },
          seekTo: function(t){
            this.currentTime = t;
          },
          updateVolume: function(vol){
            this.volume = vol / 100;
          }
        };
        audio = (m_ != null ? m_.audio : void 8) || new Audio();
        unblocker = (m_ != null ? m_.audio : void 8) || document.createElement('video');
        $([unblocker, audio]).addClass('media');
        for (i$ in {
          audio: audio,
          unblocker: unblocker
        }) {
          (fn$.call(this, i$, {
          audio: audio,
          unblocker: unblocker
        }[i$]));
        }
        audio.name = "Audio-Only";
        audio.mode = 'audio';
        audio.getURL = function(media){
          var this$ = this;
          mediaDownload(media, true).then(function(d){
            console.log("[audioStream] found url. Buffering…", d);
            audio.media = media;
            media.src = d.preferredDownload.url;
            this$.enable();
          }).fail(function(err){
            console.error("[audioStream] couldn't get audio-only stream", err);
            chatWarn("couldn't load audio-only stream, using video instead", "audioStream", true);
            media.audioFailed = true;
            refresh();
            disableBtn('audio');
            $playback.addClass('p0ne-stream-audio-failed');
            API.once('advance', function(){
              $playback.addClass('p0ne-stream-audio-failed');
            });
          });
        };
        unblocker.name = "Youtube (unblocked)";
        unblocker.mode = 'video';
        unblocker.getURL = function(media){
          var blocked, this$ = this;
          console.log("[YT Unblocker] receiving video URL", media);
          blocked = media.get('blocked');
          mediaDownload(media).then(function(d){
            media.src = d.preferredDownload.url;
            console.log("[YT Unblocker] got video URL", media.src);
            this$.start();
          }).fail(function(){
            if (blocked === 1) {
              chatWarn("failed, trying again…", "YT Unblocker");
            } else {
              chatWarn("failed to unblock video :(", "YT Unblocker");
              disableBtn('video');
            }
            media.set('blocked', blocked++);
            refresh();
          });
        };
        youtube = (ref$ = clone$(Player), ref$.name = "Video", ref$.mode = 'video', ref$.enable = function(media){
          var startTime;
          this.media = media;
          console.log("[StreamSettings] loading Youtube stream");
          startTime = currentMedia.get('elapsed');
          playback.buffering = false;
          playback.yto = {
            id: media.get('cid'),
            volume: currentMedia.get('volume'),
            seek: startTime < 4 ? 0 : startTime,
            quality: database.hdVideo ? 'hd720' : ""
          };
          $("<iframe id=yt-frame frameborder=0 src='//plgyte.appspot.com/yt5.html'>").load(playback.ytFrameLoadedBind).appendTo(playback.$container);
        }, ref$.disable = function(){
          $playbackContainer.empty();
        }, ref$.updateVolume = function(vol){
          playback.tx("setVolume=" + vol);
        }, ref$);
        sc = (ref$ = clone$(Player), ref$.name = "SoundCloud", ref$.mode = 'audio', ref$.enable = function(media){
          var this$ = this;
          this.media = media;
          console.log("[StreamSettings] loading Soundcloud audio stream");
          if (soundcloud.r) {
            if (soundcloud.sc) {
              playback.$container.empty().append("<iframe id=yt-frame frameborder=0 src='" + playback.visualizers.random() + "'></iframe>");
              soundcloud.sc.whenStreamingReady(function(){
                var startTime;
                if (media === currentMedia.get('media')) {
                  startTime = currentMedia.get('elapsed');
                  playback.player = soundcloud.sc.stream(media.get('cid'), {
                    autoPlay: true,
                    volume: currentMedia.get('volume'),
                    position: startTime < 4
                      ? 0
                      : startTime * 1000,
                    onload: playback.scOnLoadBind,
                    whileloading: playback.scLoadingBind,
                    onfinish: playback.playbackCompleteBind,
                    ontimeout: playback.scTimeoutBind
                  });
                }
              });
            } else {
              playback.$container.append($('<img src="https://soundcloud-support.s3.amazonaws.com/images/downtime.png" height="271"/>').css({
                position: 'absolute',
                left: 46
              }));
            }
          } else {
            _$context.off('sc:ready');
            _$context.once('sc:ready', function(){
              soundcloud.updateVolume(currentMedia.get('volume'));
              if (media === currentMedia.get('media')) {
                playback.onSCReady();
              } else {
                console.warn("[StreamSettings] Soundcloud: a different song already started playing");
              }
            });
          }
        }, ref$.disable = function(){
          var ref$;
          if ((ref$ = playback.player) != null) {
            ref$.stop().destruct();
          }
          playback.buffering = false;
          $playbackContainer.empty();
        }, ref$.updateVolume = function(vol){
          playback.player.setVolume(vol);
        }, ref$);
        noDJ = (ref$ = clone$(Player), ref$.name = "No DJ", ref$.mode = 'off', ref$.enable = function(){
          playback.$noDJ.show();
          this.$controls.hide();
        }, ref$.disable = function(){
          playback.$noDJ.hide();
        }, ref$.updateVolume = $.noop, ref$);
        syncingPlayer = (ref$ = clone$(Player), ref$.name = "waiting…", ref$.mode = 'off', ref$.enable = function(){
          $playbackContainer.append("<iframe id=yt-frame frameborder=0 src='" + m.syncing + "'></iframe>");
        }, ref$.updateVolume = $.noop, ref$);
        streamOff = {
          name: "Stream OFF",
          mode: 'off'
        };
        snoozed = {
          name: "Snoozed",
          mode: 'off'
        };
        if (that = currentMedia.get('media')) {
          player = [youtube, sc][that.get('format') - 1];
          if (isSnoozed()) {
            changeStream('off', "Snoozed");
          } else {
            changeStream(player.mode, player.name);
          }
        } else {
          player = noDJ;
          changeStream('off', "No DJ");
        }
        replace(Playback.prototype, 'onVolumeChange', function(){
          return function(arg$, vol){
            player.updateVolume(vol);
          };
        });
        replace(Playback.prototype, 'onMediaChange', function(oMC_){
          return function(){
            var media, oldPlayer, this$ = this;
            this.reset();
            this.$controls.removeClass('snoozed');
            media = currentMedia.get('media');
            if (media) {
              if (database.settings.streamDisabled) {
                changeStream('off', "Stream: OFF");
                return;
              }
              this.ignoreComplete = true;
              sleep(1000, function(){
                this$.resetIgnoreComplete();
              });
              oldPlayer = player;
              if (media.get('format') === 1) {
                /*== AudioOnly Stream (YT) ==*/
                if (streamSettings._settings.audioOnly && !media.audioFailed) {
                  player = audio;
                } else if (media.blocked === 3) {
                  player = syncingPlayer;
                } else if (media.blocked) {
                  player = unblocker;
                } else {
                  player = youtube;
                }
              } else if (media.get('format') === 2) {
                disableBtn('video');
                player = sc;
              }
            } else {
              player = noDJ;
            }
            changeStream(player.mode);
            player.enable(media);
          };
        });
        replace(Playback.prototype, 'stop', function(){
          return function(){
            player.disable();
          };
        });
        replace(Playback.prototype, 'reset', function(r_){
          return function(){
            if (database.settings.streamDisabled) {
              changeStream('off', "Stream: OFF");
            }
            player.disable();
            r_.apply(this, arguments);
          };
        });
        replace(Playback.prototype, 'onYTPlayerError', function(){
          return function(e){
            console.log("[streamSettings] Youtube Playback Error", e);
            if (!database.settings.streamDisabled && !streamSettings._settings.audioOnly) {
              this.unblockYT();
            }
          };
        });
        replace(Playback.prototype, 'onPlaybackEnter', function(){
          return function(){
            if (currentMedia.get('media')) {
              this.$controls.show();
            }
          };
        });
        replace(Playback.prototype, 'onSnoozeClick', function(snooze){
          out$.snooze = bind$(this, 'snooze');
          return function(){
            if (!isSnoozed()) {
              changeStream('off', "Snoozed");
              this.reset();
            }
          };
        });
        /*replace Playback::, \onRefreshClick, !-> return !->
            if currentMedia.get(\media) and restr = currentMedia.get \restricted
                currentMedia.set do
                    media: restr
                    restricted: void
            else
                @onMediaChange!*/
        if (app != null) {
          this.playback = playback = app.room.playback;
          onGotPlayback(playback);
        } else {
          replace(Playback.prototype, 'onRemainingChange', function(oMC){
            return function(){
              this$.playback = playback = this$;
              oMC.apply(this$, arguments);
              onGotPlayback(playback);
            };
          });
        }
        if (this._settings.audioOnly) {
          refresh();
        }
        function onGotPlayback(playback){
          revert(Playback.prototype, 'onRemainingChange');
          replaceListener(_$context, 'change:streamDisabled', Playback, function(){
            return bind$(playback, 'onMediaChange');
          });
          replaceListener(currentMedia, 'change:media', Playback, function(){
            return bind$(playback, 'onMediaChange');
          });
          replaceListener(currentMedia, 'change:volume', Playback, function(){
            return bind$(playback, 'onVolumeChange');
          });
          $playback.off('mouseenter').on('mouseenter', function(){
            playback.onPlaybackEnter();
          });
          return $playback.find('.snooze').off('click').on('click', function(){
            playback.onSnoozeClick();
          });
        }
        function changeStream(mode, name){
          console.log("[streamSettings] => stream-" + mode);
          $label.text(name || player.name);
          $playback.removeClass().addClass("p0ne-stream-" + mode);
          if (typeof _$context != 'undefined' && _$context !== null) {
            _$context.trigger('p0ne:changeMode');
          }
          return API.trigger('p0ne:changeMode', mode, name);
        }
        this.unblockYT = function(){
          var ref$;
          if ((ref$ = currentMedia.get('media')) != null) {
            ref$.blocked = true;
          }
          refresh();
        };
        function fn$(k, p){
          importAll$(p, Player);
          p.addEventListener('canplay', function(){
            var diff;
            console.log("[" + k + " stream] finished buffering");
            if (currentMedia.get('media') === player.media && player === this) {
              diff = currentMedia.get('elapsed') - player.currentTime;
              if (diff > 4 && currentMedia.get('remaining') > 4) {
                this.seek();
              } else {
                player.play();
                console.log("[" + k + " stream] playing song (diff " + humanTime(diff, true) + ")");
              }
            } else {
              console.warn("[" + k + " stream] next song already started");
            }
          });
        }
      },
      disable: function(){
        var $playback, this$ = this;
        window.removeEventListener('message', this.onRestricted);
        $playback = $('#playback').removeClass();
        $('#playback .hd').removeClass('p0ne-stream-select').empty().append(this.$btn_);
        sleep(0, function(){
          if (this$._settings.audioOnly && !isSnoozed()) {
            refresh();
          }
          if (this$.Playback) {
            $playback.off('mouseenter').on('mouseenter', bind$(this$.playback, 'onPlaybackEnter'));
          }
        });
      }
    });
    /*@source p0ne.chat-commands.ls */
    /**
     * plug_p0ne ChatCommands
     * Basic chat commands are defined here. Trigger them on plug.dj by writing "/commandname" in the chat
     * e.g. "/move @Brinkie Pie 2" to move the user "Brinkie Pie" to the 2nd position in the waitlist
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #           CHAT COMMANDS            #
    ####################################*/
    module('chatCommands', {
      optional: ['currentMedia'],
      setup: function(arg$){
        var addListener, this$ = this;
        addListener = arg$.addListener;
        addListener(API, 'chatCommand', function(c){
          var ref$, key$, ref1$;
          return typeof (ref$ = this$._commands)[key$ = (ref1$ = /^\/(\w+)/.exec(c)) != null ? ref1$[1] : void 8] === 'function' ? ref$[key$](c) : void 8;
        });
        return this.updateCommands();
      },
      updateCommands: function(){
        var k, ref$, v, lresult$, i$, ref1$, len$, results$ = [];
        this._commands = {};
        for (k in ref$ = this.commands) {
          v = ref$[k];
          lresult$ = [];
          this._commands[k] = v.callback;
          for (i$ = 0, len$ = (ref1$ = v.aliases || []).length; i$ < len$; ++i$) {
            k = ref1$[i$];
            if (v.moderation) {
              lresult$.push(this._commands[k] = fn$);
            } else {
              lresult$.push(this._commands[k] = v.callback);
            }
          }
          results$.push(lresult$);
        }
        return results$;
        function fn$(c){
          if (user.isStaff) {
            return v.callback(c);
          }
        }
      },
      parseUserArg: function(str){
        var id, user;
        if (/[\s\d]+/.test(str)) {
          return (function(){
            var i$, ref$, len$, results$ = [];
            for (i$ = 0, len$ = (ref$ = str.split(/\s+/)).length; i$ < len$; ++i$) {
              id = ref$[i$];
              if (+id) {
                results$.push(+id);
              }
            }
            return results$;
          }());
        } else {
          return (function(){
            var i$, ref$, len$, results$ = [];
            for (i$ = 0, len$ = (ref$ = getMentions(str)).length; i$ < len$; ++i$) {
              user = ref$[i$];
              results$.push(user.id);
            }
            return results$;
          }());
        }
      },
      commands: {
        help: {
          aliases: ['commands'],
          description: "show this list of commands",
          callback: function(){
            var res, k, ref$, command, ref1$, aliases;
            res = "<div class='msg text'>";
            for (k in ref$ = chatCommands.commands) {
              command = ref$[k];
              if ((ref1$ = command.aliases) != null && ref1$.length) {
                aliases = "aliases: " + humanList(command.aliases);
              } else {
                aliases = '';
              }
              res += "<div class='p0ne-help-command' alt='" + aliases + "'><b>/" + k + "</b> " + (command.params || '') + " - " + command.description + "</div>";
            }
            res += "</div>";
            return appendChat($("<div class='cm update p0ne-help'>").html(res));
          }
        },
        woot: {
          aliases: ['+1'],
          description: "<b>woot</b> the current song",
          callback: woot
        },
        meh: {
          aliases: ['-1'],
          description: "<b>meh</b> the current song",
          callback: meh
        },
        grab: {
          aliases: ['curate'],
          parameters: " (playlist)",
          description: "<b>grab</b> the current song into a playlist (default is current playlist)",
          callback: function(c){
            var that;
            if (that = c.replace(/^\/\w+\s+/, '')) {
              return grabMedia(that);
            } else {
              return grabMedia();
            }
          }
        }
        /*away:
            aliases: <[ afk ]>
            description: "change your status to <b>away</b>"
            callback: ->
                API.setStatus 1
        busy:
            aliases: <[ work working ]>
            description: "change your status to <b>busy</b>"
            callback:  ->
                API.setStatus 2
        gaming:
            aliases: <[ game ingame ]>
            description: "change your status to <b>gaming</b>"
            callback:  ->
                API.setStatus 3*/,
        join: {
          description: "join the waitlist",
          callback: join
        },
        leave: {
          description: "leave the waitlist",
          callback: leave
        },
        stream: {
          parameters: " [on|off]",
          description: "enable/disable the stream (just '/stream' toggles it)",
          callback: function(){
            if (typeof currentMedia != 'undefined' && currentMedia !== null) {
              return stream(c.has('on' || !(c.has('off') || 'toggle')));
            } else {
              return chatWarn("couldn't load required module for enabling/disabling the stream.");
            }
          }
        },
        snooze: {
          description: "snoozes the current song",
          callback: snooze
        },
        mute: {
          description: "mutes the audio",
          callback: mute
        },
        unmute: {
          description: "unmutes the audio",
          callback: unmute
        },
        muteonce: {
          aliases: ['muteonce'],
          description: "mutes the current song",
          callback: muteonce
        },
        automute: {
          parameters: " [add|remove]",
          description: "adds/removes this song from the automute list",
          callback: function(){
            if (API.getVolume() !== 0) {
              muteonce();
            }
            if (typeof automute != 'undefined' && automute !== null) {
              return automute(c.hasAny('add' || !c.hasAny('remove' || 'toggle')));
            } else {
              return chatWarn("automute is not yet implemented");
            }
          }
        },
        popout: {
          aliases: ['popup'],
          description: "opens/closes the chat in the popout window",
          callback: function(){
            if (typeof PopoutView != 'undefined' && PopoutView !== null) {
              if (PopoutView._window) {
                return PopoutView.close();
              } else {
                return PopoutView.show();
              }
            } else {
              return chatWarn("sorry, the command currently doesn't work");
            }
          }
        },
        reconnect: {
          aliases: ['reconnectSocket'],
          description: "forces the socket to reconnect. This might solve chat issues",
          callback: function(){
            if (typeof _$context != 'undefined' && _$context !== null) {
              _$context.once('sjs:reconnected', function(){
                return chatWarn("socket reconnected");
              });
            }
            return reconnectSocket();
          }
        },
        rejoin: {
          aliases: ['rejoinRoom'],
          description: "forces a rejoin to the room. This might solve some issues, but it might also kick you from the waitlist",
          callback: function(){
            if (typeof _$context != 'undefined' && _$context !== null) {
              _$context.once('room:joined', function(){
                return chatWarn("room rejoined");
              });
            }
            return rejoinRoom();
          }
        },
        ban: {
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(user){
            var i$, ref$, len$, id, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(user.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              results$.push(API.modBan(id, 's', 1));
            }
            return results$;
          }
        },
        unban: {
          aliases: ['pardon', 'revive'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(user){
            var i$, ref$, len$, id, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(user.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              results$.push(API.moderateUnbanUser(id));
            }
            return results$;
          }
        },
        move: {
          parameters: " @username position",
          description: "",
          moderation: true,
          callback: function(c){
            var wl, pos, users, id, error;
            wl = API.getWaitList();
            c = c.replace(/(\d+)\s*$/, function(arg$, d){
              pos = +d;
              return '';
            });
            if (0 < pos && pos < 51) {
              if (users = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))) {
                if (!(id = users[0]) || !getUser(id)) {
                  chatWarn("The user doesn't seem to be in the room");
                } else {
                  moveDJ(id, pos);
                }
                return;
              } else {
                error = "requires you to specify a user to be moved";
              }
            } else {
              error = "requires a position to move the user to";
            }
            return chatWarn(error + "<br>e.g. /move @" + API.getUsers().random().rawun + " " + (~~(Math.random() * wl.length) + 1), '/move', true);
          }
        },
        moveTop: {
          aliases: ['push'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var users, i$, i, results$ = [];
            users = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''));
            for (i$ = users.length - 1; i$ <= 0; ++i$) {
              i = i$;
              results$.push(moveDJ(i, 1));
            }
            return results$;
          }
        }
        /*moveUp:
            aliases: <[  ]>
            parameters: " @username(s) (how much)"
            description: ""
            moderation: true
            callback: (user) ->
                res = []; djsToAdd = []; l=0
                wl = API.getWaitList!
                # iterating over the loop in reverse, so that the first name will be the first, second will be second, …
                for id in chatCommands.parseUserArg user.replace(/^\/\w+\s+/, '')
                    for u, pos in wl when u.id == id
                        if pos == 0
                            skipFirst = true
                        else
                            res[pos - 1] = u.id
                        break
                    else
                        djsToAdd[l++] = id
                console.log "[/move] starting to move…", res, djsToAdd
                pos = -1; l = res.length
                do helper = ->
                    id = res[++pos]
                    if id
                        if not skipFirst
                            console.log "[/move]\tmoving #id to #{pos + 1}/#{wl.length}"
                            moveDJ id, pos
                                .then helper
                                .fail ->
                                    chatWarn "couldn't /moveup #{if getUser(id) then that.username else id}"
                                    helper!
                        else
                            helper!
                    else if pos < l
                        skipFirst := false
                        helper!
                    else
                        for id in djsToAdd
                            addDJ id
                        console.log "[/move] done"
        moveDown:
            aliases: <[  ]>
            parameters: " @username(s) (how much)"
            description: ""
            moderation: true
            callback: ->
                ...
        */,
        addDJ: {
          aliases: ['add'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var users, i, helper;
            users = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''));
            i = 0;
            return (helper = function(){
              if (users[i]) {
                return addDJ(users[i], helper);
              }
            })();
          }
        },
        removeDJ: {
          aliases: ['remove'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              results$.push(API.moderateRemoveDJ(id));
            }
            return results$;
          }
        },
        skip: {
          aliases: ['forceSkip', 's'],
          description: "",
          moderation: true,
          callback: API.moderateForceSkip
        },
        promote: {
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, that, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              if (that = getUser(id)) {
                results$.push(API.moderateSetRole(id, that.role + 1));
              }
            }
            return results$;
          }
        },
        demote: {
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, user.role - 1));
              }
            }
            return results$;
          }
        },
        destaff: {
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, 0));
              }
            }
            return results$;
          }
        },
        rdj: {
          aliases: ['resident', 'residentDJ', 'dj'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, 1));
              }
            }
            return results$;
          }
        },
        bouncer: {
          aliases: ['helper', 'temp', 'staff'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, 2));
              }
            }
            return results$;
          }
        },
        manager: {
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, 3));
              }
            }
            return results$;
          }
        },
        cohost: {
          aliases: ['co-host', 'co'],
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, 4));
              }
            }
            return results$;
          }
        },
        host: {
          parameters: " @username(s)",
          description: "",
          moderation: true,
          callback: function(c){
            var i$, ref$, len$, id, user, results$ = [];
            for (i$ = 0, len$ = (ref$ = chatCommands.parseUserArg(c.replace(/^\/\w+\s+/, ''))).length; i$ < len$; ++i$) {
              id = ref$[i$];
              user = getUser(id);
              if ((user != null ? user.role : void 8) > 0) {
                results$.push(API.moderateSetRole(id, 5));
              }
            }
            return results$;
          }
        }
      }
    });
    /*@source p0ne.base.ls */
    /**
     * Base plug_p0ne modules
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #           DISABLE/STATUS           #
    ####################################*/
    module('disableCommand', {
      setup: function(arg$){
        var addListener, this$ = this;
        addListener = arg$.addListener;
        return addListener(API, 'chat', function(msg){
          var enabledModules, disabledModules, i$, ref$, m, response;
          if (msg.message.has("!disable") && API.hasPermission(msg.uid, API.ROLE.BOUNCER) && isMention(msg)) {
            console.warn("[DISABLE] '" + status + "'");
            enabledModules = [];
            disabledModules = [];
            for (i$ in ref$ = p0ne.modules) {
              m = ref$[i$];
              if (m.disableCommand) {
                if (!m.disabled) {
                  enabledModules[enabledModules.length] = m.displayName || m.name;
                  m.disable();
                } else {
                  disabledModules[disabledModules.length] = m.displayName || m.name;
                }
              }
            }
            response = "@" + msg.un + " ";
            if (enabledModules.length) {
              response += "disabled " + humanList(enabledModules) + ".";
            }
            if (disabledModules.length) {
              response += " " + humanList(disabledModules) + " " + (disabledModules.length === 1 ? 'was' : 'were') + " already disabled.";
            }
            return API.sendChat(response);
          }
        });
      }
    });
    module('getStatus', {
      module: function(){
        var status, that, modules, res$, i$, ref$, len$, m;
        status = "Running plug_p0ne v" + p0ne.version;
        if (window.p0ne_chat) {
          status += " (incl. chat script)";
        }
        if (that = getPlugCubedVersion()) {
          status += "\tand plug³ v" + that;
        }
        if (window.ppSaved) {
          status += "\tand plugplug " + window.getVersionShort();
        }
        status += ".\tStarted " + ago(p0ne.started);
        res$ = [];
        for (i$ = 0, len$ = (ref$ = disableCommand.modules).length; i$ < len$; ++i$) {
          m = ref$[i$];
          if (window[m] && !window[m].disabled) {
            res$.push(m);
          }
        }
        modules = res$;
        if (modules.length) {
          return status += ".\t" + humanList(modules) + " are enabled";
        }
      }
    });
    module('statusCommand', {
      timeout: false,
      setup: function(arg$){
        var addListener, this$ = this;
        addListener = arg$.addListener;
        return addListener(API, 'chat', function(data){
          var status;
          if (!this$.timeout) {
            if (data.message.has('!status') && data.message.has("@" + user.username) && API.hasPermission(data.uid, API.ROLE.BOUNCER)) {
              this$.timeout = true;
              status = getStatus() + "";
              console.info("[AUTORESPOND] status: '" + status + "'", data.uid, data.un);
              API.sendChat(status, data);
              return sleep(30 * 60000, function(){
                this.timeout = false;
                return console.info("[status] timeout reset");
              });
            }
          }
        });
      }
    });
    /*####################################
    #             AUTOJOIN               #
    ####################################*/
    module('autojoin', {
      displayName: "Autojoin",
      help: 'Automatically join the waitlist again after you DJ\'d or if the waitlist gets unlocked.\nIt will not automatically join if you got removed from the waitlist by a moderator.',
      settings: 'base',
      settingsVip: true,
      disabled: true,
      disableCommand: true,
      optional: ['_$context', 'booth'],
      setup: function(arg$){
        var addListener, wlPos, ref$, $djButton, wasLocked, this$ = this;
        addListener = arg$.addListener;
        wlPos = API.getWaitListPosition();
        if (wlPos === -1) {
          this.autojoin();
        } else if (((ref$ = API.getDJ()) != null ? ref$.id : void 8) === userID) {
          API.once('advance', this.autojoin, this);
        }
        addListener(API, 'advance', function(){
          var ref$;
          if (((ref$ = API.getDJ()) != null ? ref$.id : void 8) === userID) {
            return API.once('advance', this$.autojoin, this$);
          }
        });
        addListener(API, 'p0ne:reconnected', function(){
          if (wlPos !== -1) {
            return this$.autojoin();
          }
        });
        $djButton = $('#dj-button');
        if (typeof _$context != 'undefined' && _$context !== null) {
          addListener(_$context, 'room:joined', this.autojoin, this);
          wasLocked = $djButton.hasClass('is-locked');
          addListener(_$context, 'djButton:update', function(){
            var isLocked;
            isLocked = $djButton.hasClass('is-locked');
            if (wasLocked && !isLocked) {
              this$.autojoin();
            }
            return wasLocked = isLocked;
          });
        }
        return addListener(API, 'advance', function(d){
          wlPos = API.getWaitListPosition();
          if (d && d.id !== userID && wlPos === -1) {
            return sleep(5000, function(){
              if (API.getDJ().id !== userID && API.getWaitListPosition() === -1) {
                return chatWarn("old algorithm would have autojoined now. Please report about this in the beta tester Skype chat", "plug_p0ne autojoin");
              }
            });
          }
        });
      },
      autojoin: function(){
        if (API.getWaitListPosition() === -1) {
          if (join()) {
            return console.log(getTime() + " [autojoin] joined waitlist");
          } else {
            console.error(getTime() + " [autojoin] failed to join waitlist");
            return API.once('advance', this.autojoin, this);
          }
        }
      },
      disable: function(){
        return API.off('advance', this.autojoin);
      }
    });
    /*####################################
    #             AUTOWOOT               #
    ####################################*/
    module('autowoot', {
      displayName: 'Autowoot',
      help: 'automatically woot all songs (you can still manually meh)',
      settings: 'base',
      settingsVip: true,
      disabled: true,
      disableCommand: true,
      optional: ['chatDomEvents'],
      _settings: {
        warnOnMehs: true
      },
      setup: function(arg$){
        var addListener, timer, lastScore, hasMehWarning;
        addListener = arg$.addListener;
        lastScore = API.getHistory()[1].score;
        hasMehWarning = false;
        addListener(API, 'advance', function(d){
          var lastScore;
          if (d.media) {
            lastScore = d.lastPlay.score;
            clearTimeout(timer);
            timer = sleep(1 .s + 3 .s * Math.random(), function(){
              if (!API.getUser().vote) {
                return woot();
              }
            });
          }
          if (hasMehWarning) {
            $cms().find('.p0ne-autowoot-meh-btn').remove();
            return hasMehWarning = false;
          }
        });
        addListener(API, 'voteUpdate', function(d){
          var score;
          score = API.getScore();
          if (score.negative > 2 * score.positive && score.negative > (lastScore.positive + lastScore.negative) / 4 && score.negative >= 5 && !hasMehWarning) {
            chatWarn("Many users meh'd this song, you may be stopping a voteskip. <span class=p0ne-autowoot-meh-btn>Click here to meh</span>", "Autowoot", true);
            playChatSound();
            return hasMehWarning = true;
          }
        });
        if (chatDomEvents) {
          return addListener(chatDomEvents, 'click', '.p0ne-autowoot-meh-btn', function(){
            meh();
            return $(this).closest('.cm').remove();
          });
        }
      }
    });
    /*####################################
    #              AUTOMUTE              #
    ####################################*/
    module('automute', {
      optional: ['streamSettings'],
      _settings: {
        songlist: {}
      },
      module: function(media, isAdd){
        var $msg, ref$;
        if (typeof media === 'boolean') {
          isAdd = media;
          media = false;
        }
        if (media) {
          if (media.toJSON) {
            media = media.toJSON();
          }
          if (!media.cid || !'author' in media) {
            throw new TypeError("invalid arguments for automute(media, isAdd=)");
          }
        } else {
          media = API.getMedia();
        }
        if (isAdd === 'toggle' || isAdd == null) {
          isAdd = !this.songlist[media.cid];
        }
        $msg = $("<div class='p0ne-automute-notif'>");
        if (isAdd) {
          this.songlist[media.cid] = media;
          $msg.text("+ automute " + media.author + " - " + media.title).addClass('p0ne-automute-added');
        } else {
          delete this.songlist[media.cid];
          $msg.text("- automute " + media.author + " - " + media.title + "'").addClass('p0ne-automute-removed');
        }
        $msg.append(getTimestamp());
        appendChat($msg);
        if (media.cid === ((ref$ = API.getMedia()) != null ? ref$.cid : void 8)) {
          return this.updateBtn();
        }
      },
      setup: function(arg$, automute){
        var addListener, media, $snoozeBtn, $box, streamOff, onModeChange, this$ = this;
        addListener = arg$.addListener;
        this.songlist = this._settings.songlist;
        media = API.getMedia();
        addListener(API, 'advance', function(d){
          media = d.media;
          if (media && this$.songlist[media.cid]) {
            return snooze();
          }
        });
        $snoozeBtn = $('#playback .snooze');
        this.$box_ = $snoozeBtn.children();
        $box = $("<div class='box'></div>");
        streamOff = isSnoozed();
        addListener(API, 'p0ne:changeMode', onModeChange = function(mode){
          var newStreamOff;
          newStreamOff = mode === 'off';
          return requestAnimationFrame(function(){
            if (newStreamOff) {
              if (!streamOff) {
                $snoozeBtn.empty().append($box);
              }
              if (!media) {
                console.warn("[automute] uw0tm8?");
              } else if (this$.songlist[media.cid]) {
                console.log("[automute] change automute-btn to REMOVE");
                $snoozeBtn.addClass('p0ne-automute p0ne-automute-remove');
                $box.html("remove from<br>automute");
              } else {
                console.log("[automute] change automute-btn to ADD");
                $snoozeBtn.addClass('p0ne-automute p0ne-automute-add');
                $box.html("add to<br>automute");
              }
            } else if (streamOff) {
              console.log("[automute] change automute-btn to SNOOZE");
              $snoozeBtn.empty().append(this$.$box_).removeClass('p0ne-automute p0ne-automute-remove p0ne-automute-add');
            }
            return streamOff = newStreamOff;
          });
        });
        this.updateBtn = function(mode){
          return onModeChange(streamOff && 'off');
        };
        return addListener($snoozeBtn, 'click', function(e){
          if (streamOff) {
            console.info("[automute] snoozy", media.cid, this$.songlist[media.cid], streamOff);
            return automute();
          }
        });
      },
      disable: function(){
        return $('#playback .snooze').empty().append(this.$box_);
      }
    });
    /*####################################
    #          AFK AUTORESPOND           #
    ####################################*/
    module('afkAutorespond', {
      displayName: 'AFK Autorespond',
      settings: 'base',
      settingsVip: true,
      _settings: {
        message: "I'm AFK at the moment",
        timeout: 1 .min
      },
      disabled: true,
      disableCommand: true,
      DEFAULT_MSG: "I'm AFK at the moment",
      setup: function(arg$){
        var addListener, $create, timeout, this$ = this;
        addListener = arg$.addListener, $create = arg$.$create;
        addListener(API, 'chat', function(msg){
          if (msg.uid && msg.uid !== userID && isMention(msg, true) && !timeout && !msg.message.has('!disable')) {
            API.sendChat("[AFK] " + (this$._settings.message || this$.DEFAULT_MSG));
            timeout = true;
            return sleep(this$._settings.timeout, function(){
              return timeout = false;
            });
          }
        });
        return $create('<div class=p0ne-afk-button>').text("Disable " + this.displayName).click(function(){
          return this$.disable();
        }).appendTo('#footer-user');
      },
      settingsExtra: function($el){
        var $input, this$ = this;
        return $input = $("<input class=p0ne-settings-input placeholder=\"" + this.DEFAULT_MSG + "\">").val(this._settings.message).on('input', function(){
          return this$._settings.message = $input.val();
        }).appendTo($el);
      }
    });
    /*####################################
    #      JOIN/LEAVE NOTIFICATION       #
    ####################################*/
    module('joinLeaveNotif', {
      optional: ['chatDomEvents', 'chat', 'auxiliaries', 'database'],
      settings: 'base',
      settingsVip: true,
      displayName: 'Join/Leave Notifications',
      help: 'Shows notifications for when users join/leave the room in the chat.\nNote: the country flags indicate the user\'s plug.dj language settings, they don\'t necessarily have to match where they are from.\n\nIcons explained:\n+ user joined\n- user left\n\u21ba user reconnected (left and joined again)\n\u21c4 user joined and left again',
      _settings: {
        mergeSameUser: true
      },
      setup: function(arg$, joinLeaveNotif, arg1$, update){
        var addListener, css, lastMsg, $lastNotif, CHAT_TYPE, lastUsers, cssClasses, i$, len$;
        addListener = arg$.addListener, css = arg$.css;
        if (update) {
          lastMsg = $cm().children().last();
          if (lastMsg.hasClass('p0ne-notif-joinleave')) {
            $lastNotif = lastMsg;
          }
        }
        CHAT_TYPE = 'p0ne-notif-joinleave';
        lastUsers = {};
        cssClasses = {
          userJoin: 'join',
          userLeave: 'leave',
          refresh: 'refresh',
          instaLeave: 'instaleave'
        };
        for (i$ = 0, len$ = ['userJoin', 'userLeave'].length; i$ < len$; ++i$) {
          (fn$.call(this, ['userJoin', 'userLeave'][i$]));
        }
        return addListener(API, 'popout:open popout:close', function(){
          var $lastNotif;
          return $lastNotif = $cm().find('.p0ne-notif-joinleave:last');
        });
        function fn$(event_){
          addListener(API, event_, function(u){
            var event, reuseNotif, title, $msg, isAtBottom;
            event = event_;
            if (!(reuseNotif = (typeof chat != 'undefined' && chat !== null ? chat.lastType : void 8) === CHAT_TYPE && $lastNotif)) {
              lastUsers = {};
            }
            title = '';
            if (reuseNotif && lastUsers[u.id] && joinLeaveNotif._settings.mergeSameUser) {
              if (event === 'userJoin' && 'userJoin' !== lastUsers[u.id].event) {
                event = 'refresh';
                title = "title='reconnected'";
              } else if (event === 'userLeave' && 'userLeave' !== lastUsers[u.id].event) {
                event = 'instaLeave';
                title = "title='joined and left again'";
              }
            }
            $msg = $("<div class=p0ne-notif-" + cssClasses[event] + " data-uid=" + u.id + " " + title + ">" + formatUserHTML(u, user.isStaff, false) + "" + getTimestamp() + "</div>");
            if (event === event_) {
              lastUsers[u.id] = {
                event: event,
                $el: $msg
              };
            }
            if (reuseNotif) {
              isAtBottom = chatIsAtBottom();
              if (event !== event_) {
                lastUsers[u.id].$el.replaceWith($msg);
                delete lastUsers[u.id];
              } else {
                $lastNotif.append($msg);
              }
              if (isAtBottom) {
                return chatScrollDown();
              }
            } else {
              $lastNotif = $("<div class='cm update p0ne-notif p0ne-notif-joinleave'>").append($msg);
              appendChat($lastNotif);
              if (typeof chat != 'undefined' && chat !== null) {
                return chat.lastType = CHAT_TYPE;
              }
            }
          });
        }
      }
    });
    /*####################################
    #     CURRENT SONG TITLE TOOLTIP     #
    ####################################*/
    module('titleCurrentSong', {
      disable: function(){
        return $('#now-playing-media').prop('title', "");
      },
      setup: function(arg$){
        var addListener;
        addListener = arg$.addListener;
        return addListener(API, 'advance', function(d){
          if (d.media) {
            return $('#now-playing-media').prop('title', d.media.author + " - " + d.media.title);
          } else {
            return $('#now-playing-media').prop('title', null);
          }
        });
      }
    });
    /*####################################
    #       MORE ICON IN USERLIST        #
    ####################################*/
    module('userlistIcons', {
      require: ['users', 'RoomUserRow'],
      _settings: {
        forceMehIcon: false
      },
      setup: function(arg$){
        var replace, settings;
        replace = arg$.replace;
        settings = this._settings;
        replace(RoomUserRow.prototype, 'vote', function(){
          return function(){
            var ref$, vote, that;
            if (this.model.id === ((ref$ = API.getDJ()) != null ? ref$.id : void 8)) {
              /* fixed in Febuary 2015 http://tech.plug.dj/2015/02/18/version-1-2-7-6478/
              if vote # stupid haxxy edge-cases… well to be fair, I don't see many other people but me abuse that >3>
                  if not @$djIcon
                      @$djIcon = $ '<i class="icon icon-current-dj" style="right: 35px">'
                          .appendTo @$el
                      API.once \advance, ~>
                          @$djIcon .remove!
                          delete @$djIcon
              else*/
              vote = 'dj';
            } else if (this.model.get('grab')) {
              vote = 'grab';
            } else {
              vote = this.model.get('vote');
              if (vote === -1 && !user.isStaff && !settings.forceMehIcon) {
                vote = 0;
              }
            }
            if (vote !== 0) {
              if (this.$icon) {
                this.$icon.removeClass();
              } else {
                this.$icon = $('<i>').appendTo(this.$el);
              }
              this.$icon.addClass('icon');
              if (vote === -1) {
                this.$icon.addClass('icon-meh');
              } else if (vote === 'grab') {
                this.$icon.addClass('icon-grab');
              } else if (vote === 'dj') {
                this.$icon.addClass('icon-current-dj');
              } else {
                this.$icon.addClass('icon-woot');
              }
            } else if (this.$icon) {
              this.$icon.remove();
              delete this.$icon;
            }
            if (that = typeof chatPolyfixEmoji != 'undefined' && chatPolyfixEmoji !== null ? chatPolyfixEmoji.fixedUsernames[this.model.id] : void 8) {
              return this.$el.find('.name').html(that);
            }
          };
        });
        return this.updateEvents();
      },
      updateEvents: function(){
        var i$, ref$, len$, u, lresult$, j$, ref1$, len1$, event, results$ = [];
        for (i$ = 0, len$ = (ref$ = users.models).length; i$ < len$; ++i$) {
          u = ref$[i$];
          lresult$ = [];
          if (u._events) {
            for (j$ = 0, len1$ = (ref1$ = u._events['change:vote'] || []).length; j$ < len1$; ++j$) {
              event = ref1$[j$];
              if (event.ctx instanceof RoomUserRow) {
                event.callback = RoomUserRow.prototype.vote;
              }
            }
            for (j$ = 0, len1$ = (ref1$ = u._events['change:grab'] || []).length; j$ < len1$; ++j$) {
              event = ref1$[j$];
              if (event.ctx instanceof RoomUserRow) {
                lresult$.push(event.callback = RoomUserRow.prototype.vote);
              }
            }
          }
          results$.push(lresult$);
        }
        return results$;
      },
      disableLate: function(){
        return this.updateEvents();
      }
    });
    /*####################################
    #        DBLCLICK to @MENTION        #
    ####################################*/
    /*note: this is also makes usernames clickable in many other parts of plug.dj & other plug_p0ne modules */
    module('chatDblclick2Mention', {
      require: ['chat', 'simpleFixes'],
      settings: 'chat',
      displayName: 'DblClick username to Mention',
      setup: function(arg$, chatDblclick2Mention){
        var replace, addListener, newFromClick, i$, ref$, len$, ref1$, ctx, $el, attr, boundAttr;
        replace = arg$.replace, addListener = arg$.addListener;
        newFromClick = function(e){
          var this$ = this;
          e.stopPropagation();
          e.preventDefault();
          if (!chatDblclick2Mention.timer) {
            return chatDblclick2Mention.timer = sleep(200, function(){
              var $this, r, i, pos, err;
              if (chatDblclick2Mention.timer) {
                try {
                  chatDblclick2Mention.timer = 0;
                  $this = $(this$);
                  if (r = $this.closest('.cm').children('.badge-box').data('uid') || $this.data('uid') || (i = getUserInternal($this.text())).id) {
                    pos = {
                      x: chat.getPosX(),
                      y: $this.offset().top
                    };
                    if (i || (i = getUserInternal(r))) {
                      return chat.onShowChatUser(i, pos);
                    } else {
                      return chat.getExternalUser(r, pos, chat.showChatUserBind);
                    }
                  } else {
                    return console.warn("[dblclick2Mention] couldn't get userID", this$);
                  }
                } catch (e$) {
                  err = e$;
                  return console.error("[dblclick2Mention] error showing user rollover", err.stack);
                }
              }
            });
          } else {
            clearTimeout(chatDblclick2Mention.timer);
            chatDblclick2Mention.timer = 0;
            return ((typeof PopoutView != 'undefined' && PopoutView !== null ? PopoutView.chat : void 8) || chat).onInputMention(e.target.textContent);
          }
        };
        for (i$ = 0, len$ = (ref$ = [[chat, $cms(), 'onFromClick', 'fromClickBind'], [WaitlistRow.prototype, $('#waitlist'), 'onDJClick', 'clickBind'], [RoomUserRow.prototype, $('#user-lists'), 'onClick', 'clickBind']]).length; i$ < len$; ++i$) {
          ref1$ = ref$[i$], ctx = ref1$[0], $el = ref1$[1], attr = ref1$[2], boundAttr = ref1$[3];
          replace(ctx, attr, noop);
          if (ctx[boundAttr]) {
            replace(ctx, boundAttr, fn$);
          }
          $el.off('click', ctx[boundAttr]);
        }
        addListener(chatDomEvents, 'click', '.un', newFromClick);
        addListener($('.app-right'), 'click', '.name', newFromClick);
        function noop(){
          return null;
        }
        return noop;
        function fn$(){
          return noop;
        }
      },
      disableLate: function(){
        var cm, attr, ref$, ref1$, ctx, $el, results$ = [];
        cm = $cms();
        for (attr in ref$ = {
          fromClickBind: [chat, cm],
          onDJClick: [WaitlistRow.prototype, $('#waitlist')],
          onClick: [RoomUserRow.prototype, $('#user-lists')]
        }) {
          ref1$ = ref$[attr], ctx = ref1$[0], $el = ref1$[1];
          results$.push($el.find('.mention .un, .message .un, .name').off('click', ctx[attr]).on('click', ctx[attr]));
        }
        return results$;
      }
    });
    /*####################################
    #             ETA  TIMER             #
    ####################################*/
    module('etaTimer', {
      displayName: 'ETA Timer',
      settings: 'base',
      setup: function(arg$){
        var css, addListener, $create, sum, lastSongDur, $nextMediaLabel, $eta, $etaText, $etaTime, hist, l, tinyhist, i$, i, this$ = this;
        css = arg$.css, addListener = arg$.addListener, $create = arg$.$create;
        css('etaTimer', '#your-next-media>span {width: auto !important;right: 50px;}');
        sum = lastSongDur = 0;
        $nextMediaLabel = $('#your-next-media > span');
        $eta = $create('<div class=p0ne-eta>').append($etaText = $('<span class=p0ne-eta-text>ETA: </span>')).append($etaTime = $('<span class=p0ne-eta-time></span>')).mouseover(function(){
          var avg, p, rem;
          avg = Math.round(
          (sum * p / l) / 60);
          p = API.getWaitListPosition();
          if (p === -1) {
            p = API.getWaitList().length;
          }
          rem = API.getTimeRemaining();
          if (p) {
            return $eta.attr('title', mediaTime(rem) + " remaining + " + p + " × " + mediaTime(avg) + " ø song duration");
          } else if (rem) {
            return $eta.attr('title', mediaTime(rem) + " remaining, the waitlist is empty");
          } else {
            return $eta.attr('title', "Nobody is playing and the waitlist is empty");
          }
        }).mouseout(function(){
          return $eta.attr('title', null);
        }).appendTo('#footer');
        addListener(API, 'waitListUpdate', updateETA);
        addListener(API, 'advance', function(d){
          if (d.media) {
            sum -= lastSongDur;
            sum += d.media.duration;
            return lastSongDur = API.getHistory()[l - 1].media.duration;
          }
        });
        hist = API.getHistory();
        l = hist.length;
        if (l < 50) {
          (tinyhist = function(){
            return addListener('once', API, 'advance', function(d){
              if (d.media) {
                lastSongDur = 0;
                l++;
              }
              if (l < 51) {
                return tinyhist();
              }
            });
          })();
        } else {
          l = 50;
          lastSongDur = hist[l - 1].media.duration;
        }
        for (i$ = 0; i$ < l; ++i$) {
          i = i$;
          sum += hist[i].media.duration;
        }
        updateETA();
        API.once('p0ne:stylesLoaded', function(){
          return $nextMediaLabel.css({
            right: $eta.width() - 50
          });
        });
        function updateETA(){
          var p, ref$, avg_, avg;
          p = API.getWaitListPosition();
          if (p === 0) {
            $etaText.text("you are next DJ!");
            $etaTime.text('');
            return;
          } else if (p === -1) {
            if (((ref$ = API.getDJ()) != null ? ref$.id : void 8) === userID) {
              $etaText.text("you are DJ!");
              $etaTime.text('');
              return;
            } else {
              if (0 === (p = API.getWaitList().length)) {
                $etaText.text('Join now to ');
                $etaTime.text("DJ instantly");
                return;
              }
            }
          }
          avg_ = API.getTimeRemaining() + sum * p / l;
          avg = Math.round(
          avg_ / 60);
          $etaText.text("ETA ca. ");
          if (avg > 60) {
            $etaTime.text(~~(avg / 60) + "h " + avg % 60 + "min");
          } else {
            $etaTime.text(avg + " min");
          }
          $nextMediaLabel.css({
            right: $eta.width() - 50
          });
          clearTimeout(this$.timer);
          return this$.timer = sleep((avg_ % 60 + 31).s, updateETA);
        }
        return updateETA;
      },
      disable: function(){
        return clearTimeout(this.timer);
      }
    });
    /*####################################
    #              VOTELIST              #
    ####################################*/
    module('votelist', {
      settings: 'base',
      displayName: 'Votelist',
      disabled: true,
      help: 'Moving your mouse above the woot/grab/meh icon shows a list of users who have wooted, grabbed or meh\'d respectively.',
      setup: function(arg$){
        var addListener, $create, $tooltip, currentFilter, $vote, $vl;
        addListener = arg$.addListener, $create = arg$.$create;
        $tooltip = $('#tooltip');
        currentFilter = false;
        $vote = $('#vote');
        $vl = $create('<div class=p0ne-votelist>').hide().appendTo($vote);
        addListener($('#woot'), 'mouseenter', changeFilter('left: 0', function(userlist){
          var i$, ref$, len$, u;
          for (i$ = 0, len$ = (ref$ = API.getAudience()).length; i$ < len$; ++i$) {
            u = ref$[i$];
            if (u.vote === +1) {
              userlist += "<div>" + formatUserHTML(u, false, true) + "</div>";
            }
          }
          return userlist;
        }));
        addListener($('#grab'), 'mouseenter', changeFilter('left: 50%; transform: translateX(-50%)', function(userlist){
          var i$, ref$, len$, u;
          for (i$ = 0, len$ = (ref$ = API.getAudience()).length; i$ < len$; ++i$) {
            u = ref$[i$];
            if (u.grab) {
              userlist += "<div>" + formatUserHTML(u, false, true) + "</div>";
            }
          }
          return userlist;
        }));
        addListener($('#meh'), 'mouseenter', changeFilter('right: 0', function(userlist){
          var i$, ref$, len$, u;
          if (user.isStaff) {
            for (i$ = 0, len$ = (ref$ = API.getAudience()).length; i$ < len$; ++i$) {
              u = ref$[i$];
              if (u.vote === -1) {
                userlist += "<div>" + formatUserHTML(u, false, true) + "</div>";
              }
            }
            return userlist;
          }
        }));
        addListener($vote, 'mouseleave', function(){
          currentFilter = false;
          $vl.hide();
          return $tooltip.show();
        });
        addListener(API, 'voteUpdate', updateVoteList);
        function changeFilter(styles, filter){
          return function(){
            currentFilter = filter;
            css('votelist', ".p0ne-votelist { " + styles + " }");
            return updateVoteList();
          };
        }
        function updateVoteList(){
          var userlist;
          if (currentFilter) {
            userlist = currentFilter('');
            if (userlist) {
              $vl.html(userlist).show();
              if (!$tooltip.length) {
                $tooltip = $('#tooltip');
              }
              return $tooltip.hide();
            } else {
              $vl.hide();
              return $tooltip.show();
            }
          }
        }
        return updateVoteList;
      }
    });
    /*####################################
    #             USER POPUP             #
    ####################################*/
    module('friendslistUserPopup', {
      require: ['friendsList', 'FriendsList', 'chat'],
      setup: function(arg$){
        var addListener;
        addListener = arg$.addListener;
        return addListener($('.friends'), 'click', '.name, .image', function(e){
          var id, ref$, user, data;
          id = (ref$ = friendsList.rows[$(this.closest('.row')).index()]) != null ? ref$.model.id : void 8;
          if (id) {
            user = users.get(id);
          }
          data = {
            x: $body.width() - 353,
            y: e.screenY - 90
          };
          if (user) {
            return chat.onShowChatUser(user, data);
          } else if (id) {
            return chat.getExternalUser(id, data, function(user){
              return chat.onShowChatUser(user, data);
            });
          }
        });
      }
    });
    module('waitlistUserPopup', {
      require: ['WaitlistRow'],
      setup: function(arg$){
        var replace;
        replace = arg$.replace;
        return replace(WaitlistRow.prototype, "render", function(r_){
          return function(){
            r_.apply(this, arguments);
            return this.$('.name, .image').click(this.clickBind);
          };
        });
      }
    });
    /*####################################
    #         AVOID HISTORY PLAY         #
    ####################################*/
    module('avoidHistoryPlay', {
      settings: 'base',
      displayName: '☢ Avoid History Plays',
      help: '[WORK IN PROGRESS]\n\nThis avoid playing songs that are already in history',
      require: ['app'],
      setup: function(arg$){
        var addListener, playlist;
        addListener = arg$.addListener;
        playlist = app.footer.playlist.playlist.media;
        addListener(API, 'advance', function(d){
          var ref$, ref1$;
          if (((ref$ = d.dj) != null ? ref$.id : void 8) !== userID) {
            if (((ref$ = playlist.list) != null ? (ref1$ = ref$.rows) != null ? (ref$ = ref1$[0]) != null ? ref$.model.cid : void 8 : void 8 : void 8) === d.media.cid && (typeof getActivePlaylist != 'undefined' && getActivePlaylist !== null)) {
              chatWarn('moved down', '☢ Avoid History Plays');
              return ajax('PUT', "playlists/" + getActivePlaylist().id + "/media/move", {
                beforeID: -1,
                ids: [id]
              });
            }
          } else {
            return API.once('advance', checkOnNextAdv);
          }
        });
        function checkOnNextAdv(d){
          var ref$, ref1$, nextSong, i$, len$, s, results$ = [];
          console.info("[Avoid History Plays]", (ref$ = playlist.list) != null ? (ref1$ = ref$.rows) != null ? (ref$ = ref1$[0]) != null ? ref$.model : void 8 : void 8 : void 8, (ref$ = playlist.list) != null ? (ref1$ = ref$.rows) != null ? (ref$ = ref1$[1]) != null ? ref$.model : void 8 : void 8 : void 8);
          if (!(nextSong = (ref$ = playlist.list) != null ? (ref1$ = ref$.rows) != null ? (ref$ = ref1$[1]) != null ? ref$.nextSong : void 8 : void 8 : void 8) || (typeof getActivePlaylist == 'undefined' || getActivePlaylist === null)) {
            return;
          }
          for (i$ = 0, len$ = (ref$ = API.getHistory()).length; i$ < len$; ++i$) {
            s = ref$[i$];
            if (s.media.cid === nextSong.cid) {
              chatWarn('moved down', '☢ Avoid History Plays');
              results$.push(ajax('PUT', "playlists/" + getActivePlaylist().id + "/media/move", {
                beforeID: -1,
                ids: [nextSong.id]
              }));
            }
          }
          return results$;
        }
        return (this.checkOnNextAdv = checkOnNextAdv)();
      }
    });
    /*@source p0ne.chat.ls */
    /**
     * chat-related plug_p0ne modules
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /* ToDo:
     * add missing chat inline image plugins:
     * Derpibooru
     * imgur.com/a/
     * tumblr
     * deviantart
     * gfycat.com
     * cloud-4.steampowered.com … .resizedimage
     */
    CHAT_WIDTH = 328;
    MAX_IMAGE_HEIGHT = 300;
    roles = ['none', 'dj', 'bouncer', 'manager', 'cohost', 'host', 'ambassador', 'ambassador', 'ambassador', 'admin'];
    /*####################################
    #         BETTER CHAT INPUT          #
    ####################################*/
    module('betterChatInput', {
      require: ['chat', 'user'],
      optional: ['user_', '_$context', 'PopoutListener', 'Lang'],
      displayName: "Better Chat Input",
      settings: 'chat',
      help: 'Replaces the default chat input field with a multiline textfield.\nThis allows you to more accurately see how your message will actually look when send',
      setup: function(arg$){
        var addListener, replace, revert, css, $create, $autoresize_helper, oldHeight, chat, focused, init, $onpage_autoresize_helper, chatHidden, wasEmote, this$ = this;
        addListener = arg$.addListener, replace = arg$.replace, revert = arg$.revert, css = arg$.css, $create = arg$.$create;
        css('p0ne_chat_input', '#chat-input {bottom: 7px;height: auto;background: transparent !important;min-height: 30px;}#chat-input-field {position: static;resize: none;height: 16px;overflow: hidden;margin-left: 8px;color: #eee;background: rgba(0, 24, 33, .7);box-shadow: inset 0 0 0 1px transparent;transition: box-shadow .2s ease-out;}.popout #chat-input-field {box-sizing: content-box;}#chat-input-field:focus {box-shadow: inset 0 0 0 1px #009cdd !important;}.autoresize-helper {display: none;white-space: pre-wrap;word-wrap: break-word;}#chat-input-field, .autoresize-helper {width: 295px;padding: 8px 10px 5px 10px;min-height: 16px;font-weight: 400;font-size: 12px;font-family: Roboto,sans-serif;}/* emote */.p0ne-better-chat-emote {font-style: italic;}/*fix chat-messages size*/#chat-messages {height: auto !important;bottom: 45px;}');
        chat = window.chat;
        this.cIF_ = chat.$chatInputField[0];
        this.$form = chat.$chatInputField.parent();
        focused = chat.$chatInputField.hasClass('focused');
        chat.$chatInput.removeClass('focused');
        init = addListener(API, 'popout:open', function(arg$, PopoutView){
          var val, focused;
          chat = PopoutView.chat;
          this$.popoutcIF_ = chat.$chatInputField[0];
          this$.$popoutForm = chat.$chatInputField.parent();
          val = window.chat.$chatInputField.val();
          focused = window.chat.$chatInputField.is(':focus');
          chat.$chatInputField.detach();
          return chat.$chatInputField[0] = chat.chatInput = $create("<textarea id='chat-input-field' maxlength=256>").attr('tabIndex', 1).val(val).focus().attr('placeholder', (typeof Lang != 'undefined' && Lang !== null ? Lang.chat.placeholder : void 8) || "Chat").on('keydown', function(e){
            return chat.onKeyDown(e);
          }).on('keyup', function(e){
            return chat.onKeyUp(e);
          }).on('input', onInput).on('keydown', checkForMsgSend).appendTo(this$.$popoutForm).after($autoresize_helper = $create('<div>').addClass('autoresize-helper'))[0];
        });
        init(null, {
          chat: window.chat
        });
        $onpage_autoresize_helper = $autoresize_helper;
        if (PopoutView._window) {
          init(null, PopoutView);
        }
        addListener(API, 'popout:close', function(){
          window.chat.$chatInputField.val(chat.$chatInputField.val());
          chat = window.chat;
          return $autoresize_helper = $onpage_autoresize_helper;
        });
        chatHidden = $cm().parent().css('display') === 'none';
        wasEmote = false;
        function onInput(){
          var content, newHeight, scrollTop;
          content = chat.$chatInputField.val();
          if (content !== (content = content.replace(/\n/g, ""))) {
            chat.$chatInputField.val(content);
          }
          if (content[0] === '/' && content[1] === 'm' && content[2] === 'e') {
            if (!wasEmote) {
              wasEmote = true;
              chat.$chatInputField.addClass('p0ne-better-chat-emote');
              $autoresize_helper.addClass('p0ne-better-chat-emote');
            }
          } else if (wasEmote) {
            wasEmote = false;
            chat.$chatInputField.removeClass('p0ne-better-chat-emote');
            $autoresize_helper.removeClass('p0ne-better-chat-emote');
          }
          $autoresize_helper.text(content);
          newHeight = $autoresize_helper.height();
          if (oldHeight === newHeight) {
            return;
          }
          scrollTop = chat.$chatMessages.scrollTop();
          chat.$chatInputField.css({
            height: newHeight
          });
          chat.$chatMessages.css({
            bottom: newHeight + 30
          }).scrollTop(scrollTop + newHeight - oldHeight);
          return oldHeight = newHeight;
        }
        function checkForMsgSend(e){
          if ((e && (e.which || e.keyCode)) === 13) {
            return requestAnimationFrame(onInput);
          }
        }
        return checkForMsgSend;
      },
      disable: function(){
        if (this.cIF_) {
          chat.$chatInputField = $(chat.chatInput = this.cIF_).val(chat.$chatInputField.val()).appendTo(this.$form);
        } else {
          console.warn(getTime() + " [betterChatInput] ~~~~ disabling ~~~~", this.cIF_, this.$form);
        }
        if (PopoutView._window && this.popoutcIF_) {
          return PopoutView.chat.$chatInputField = $(PopoutView.chat.chatInput = this.popoutcIF_).val(PopoutView.chat.$chatInputField.val()).appendTo(this.$popoutForm);
        }
      }
    });
    /*####################################
    #            CHAT PLUGIN             #
    ####################################*/
    module('chatPlugin', {
      require: ['_$context'],
      setup: function(arg$){
        var addListener, onerror;
        addListener = arg$.addListener;
        p0ne.chatLinkPlugins || (p0ne.chatLinkPlugins = []);
        onerror = 'onerror="chatPlugin.imgError(this)"';
        addListener('early', _$context, 'chat:receive', function(msg){
          var onload;
          msg.wasAtBottom == null && (msg.wasAtBottom = chatIsAtBottom());
          msg.classes = {};
          msg.addClass = addClass;
          msg.removeClass = removeClass;
          _$context.trigger('chat:plugin', msg);
          API.trigger('chat:plugin', msg);
          if (msg.wasAtBottom) {
            onload = 'onload="chatScrollDown()"';
          } else {
            onload = '';
          }
          return msg.message = msg.message.replace(/<a (.+?)>((https?:\/\/)(?:www\.)?(([^\/]+).+?))<\/a>/gi, function(all, pre, completeURL, protocol, url, domain, offset){
            var i$, ref$, len$, ctx, j$, ref1$, len1$, plugin, that, err;
            domain = domain.toLowerCase();
            for (i$ = 0, len$ = (ref$ = [_$context, API]).length; i$ < len$; ++i$) {
              ctx = ref$[i$];
              if (ctx._events['chat:image']) {
                for (j$ = 0, len1$ = (ref1$ = ctx._events['chat:image']).length; j$ < len1$; ++j$) {
                  plugin = ref1$[j$];
                  try {
                    if (that = plugin.callback.call(plugin.ctx, {
                      all: all,
                      pre: pre,
                      completeURL: completeURL,
                      protocol: protocol,
                      domain: domain,
                      url: url,
                      offset: offset,
                      onload: onload,
                      onerror: onerror,
                      msg: msg
                    })) {
                      return that;
                    }
                  } catch (e$) {
                    err = e$;
                    console.error("[p0ne] error while processing chat link plugin", plugin, err.stack);
                  }
                }
              }
            }
            return all;
          });
        });
        addListener(_$context, 'chat:receive', function(e){
          return getChat(e).addClass(Object.keys(e.classes || {}).join(' '));
        });
        function addClass(classes){
          var i$, ref$, len$, className, results$ = [];
          if (typeof classes === 'string') {
            for (i$ = 0, len$ = (ref$ = classes.split(/\s+/g)).length; i$ < len$; ++i$) {
              className = ref$[i$];
              if (className) {
                results$.push(this.classes[className] = true);
              }
            }
            return results$;
          }
        }
        function removeClass(classes){
          var i$, ref$, len$, className, ref1$, ref2$, results$ = [];
          if (typeof classes === 'string') {
            for (i$ = 0, len$ = (ref$ = classes.split(/\s+/g)).length; i$ < len$; ++i$) {
              className = ref$[i$];
              results$.push((ref2$ = (ref1$ = this.classes)[className], delete ref1$[className], ref2$));
            }
            return results$;
          }
        }
        return removeClass;
      },
      imgError: function(elem){
        var x$;
        console.warn("[inline-img] converting image back to link", elem.alt, elem, elem.outerHTML);
        x$ = $(elem).parent();
        x$.text(x$.attr('href'));
        x$.addClass('p0ne-img-failed');
        return x$;
      }
    });
    /*####################################
    #           MESSAGE CLASSES          #
    ####################################*/
    module('chatMessageClasses', {
      optional: ['users'],
      require: ['chatPlugin'],
      setup: function(arg$){
        var addListener, err;
        addListener = arg$.addListener;
        try {
          $cm().children().each(function(){
            var uid, $this, fromUser, role, fromRole, i$, ref$, len$, yet$, r;
            if (uid = this.dataset.cid) {
              uid = uid.substr(0, 7);
              if (!uid) {
                return;
              }
              $this = $(this);
              if (fromUser = users.get(uid)) {
                role = getRank(fromUser);
                if (role !== 'ghost') {
                  fromRole = "from-" + role;
                  if (role !== 'none') {
                    fromRole += " from-staff";
                  }
                  /*else # stupid p3. who would abuse the class `from` instead of using something sensible instead?!
                      fromRole += " from"
                  */
                }
              }
              if (!fromRole) {
                for (yet$ = true, i$ = 0, len$ = (ref$ = ($this.find('.icon').prop('className') || "").split(" ")).length; i$ < len$; ++i$) {
                  r = ref$[i$];
                  yet$ = false;
                  if (r.startsWith('icon-chat-')) {
                    fromRole = "from-" + r.substr(10);
                  }
                } if (yet$) {
                  fromRole = 'from-none';
                }
              }
              return $this.addClass("fromID-" + uid + " " + fromRole);
            }
          });
        } catch (e$) {
          err = e$;
          console.error("[chatMessageClasses] couldn't convert old messages", err.stack);
        }
        return addListener(window._$context || API, 'chat:plugin', function(message){
          var type, uid, user;
          type = message.type, uid = message.uid;
          if (uid) {
            message.user = user = getUser(uid);
            message.addClass("fromID-" + uid);
            message.addClass("from-" + getRank(user));
            if (user && (user.role > 1 || user.gRole)) {
              return message.addClass('from-staff');
            }
          }
        });
      }
    });
    /*####################################
    #      UNREAD CHAT NOTIFICAITON      #
    ####################################*/
    module('unreadChatNotif', {
      require: ['_$context', 'chatDomEvents', 'chatPlugin'],
      bottomMsg: $(),
      settings: 'chat',
      displayName: 'Mark Unread Chat',
      setup: function(arg$){
        var addListener, unreadCount, $chatButton, $unreadCount, this$ = this;
        addListener = arg$.addListener;
        unreadCount = 0;
        $chatButton = $('#chat-button').append($unreadCount = $('<div class=p0ne-toolbar-count>'));
        this.bottomMsg = $cm().children().last();
        addListener(_$context, 'chat:plugin', function(message){
          message.wasAtBottom == null && (message.wasAtBottom = chatIsAtBottom());
          if (!$chatButton.hasClass('selected') && (typeof PopoutView != 'undefined' && PopoutView !== null ? PopoutView.chat : void 8) == null) {
            $chatButton.addClass('p0ne-toolbar-highlight');
            $unreadCount.text(unreadCount + 1);
          } else if (message.wasAtBottom) {
            this.bottomMsg = message.cid;
            return;
          }
          delete this.bottomMsg;
          $cm().addClass('has-unread');
          message.unread = true;
          message.addClass('unread');
          return unreadCount++;
        });
        this.throttled = false;
        addListener(chatDomEvents, 'scroll', updateUnread);
        addListener($chatButton, 'click', updateUnread);
        addListener('early', _$context, 'chat:delete', function(cid){
          var $msg;
          $msg = getChat(cid);
          if ($msg.length && $msg.hasClass('unread')) {
            $msg.removeClass('unread');
            return unreadCount--;
          }
        });
        function updateUnread(){
          if (this$.throttled) {
            return;
          }
          this$.throttled = true;
          return sleep(200, function(){
            var cm, cmHeight, lastMsg, msg, $readMsgs, l, unread;
            try {
              cm = $cm();
              cmHeight = cm.height();
              lastMsg = msg = this$.bottomMsg;
              $readMsgs = $();
              l = 0;
              while ((msg = msg.next()).length) {
                if (msg.position().top > cmHeight) {
                  this$.bottomMsg = lastMsg;
                  break;
                } else if (msg.hasClass('unread')) {
                  $readMsgs[l++] = msg[0];
                }
                lastMsg = msg;
              }
              if (l) {
                unread = cm.find('.unread');
                sleep(1500, function(){
                  $readMsgs.removeClass('unread');
                  if ((unread = unread.filter('.unread')).length) {
                    return this$.bottomMsg = unread.removeClass('unread').last();
                  }
                });
              }
              if (!msg.length) {
                cm.removeClass('has-unread');
                $chatButton.removeClass('p0ne-toolbar-highlight');
                unreadCount = 0;
              }
            } catch (e$) {}
            return this$.throttled = false;
          });
        }
        return updateUnread;
      },
      fix: function(){
        var cm;
        this.throttled = false;
        cm = $cm();
        cm.removeClass('has-unread').find('.unread').removeClass('unread');
        return this.bottomMsg = cm.children().last();
      },
      disable: function(){
        return $cm().removeClass('has-unread').find('.unread').removeClass('unread');
      }
    });
    /*####################################
    #          OTHERS' @MENTIONS         #
    ####################################*/
    module('chatOthersMentions', {
      optional: ['users'],
      require: ['chatPlugin'],
      settings: 'chat',
      displayName: 'Highlight @mentions for others',
      setup: function(arg$){
        /*sleep 0, ->
            $cm! .children! .each ->*/
        var addListener;
        addListener = arg$.addListener;
        return addListener(_$context, 'chat:plugin', function(message){
          var type, uid, res, lastI, i$, ref$, len$, yet$, mention;
          type = message.type, uid = message.uid;
          if (uid) {
            res = "";
            lastI = 0;
            for (yet$ = true, i$ = 0, len$ = (ref$ = getMentions(message, true)).length; i$ < len$; ++i$) {
              mention = ref$[i$];
              yet$ = false;
              if (mention.id !== userID || type === 'emote') {
                res += "" + message.message.substring(lastI, mention.offset) + "<span class='mention-other mentionID-" + mention.id + " mention-" + getRank(mention) + " " + (!(mention.role || mention.gRole) ? '' : 'mention-staff') + "'>@" + mention.rawun + "</span>";
                lastI = mention.offset + 1 + mention.rawun.length;
              }
            } if (yet$) {
              return;
            }
            return message.message = res + message.message.substr(lastI);
          }
        });
      }
    });
    /*####################################
    #           INLINE  IMAGES           #
    ####################################*/
    CHAT_WIDTH = 500;
    module('chatInlineImages', {
      require: ['chatPlugin'],
      settings: 'chat',
      settingsVip: true,
      displayName: 'Inline Images',
      help: 'Converts image links to images in the chat, so you can see a preview.\n\nWhen enabled, you can enter tags to filter images which should not be shown inline. These tags are case-insensitive and space-seperated.\n\n☢ The taglist is subject to improvement',
      _settings: {
        filterTags: ['nsfw', 'suggestive', 'gore', 'spoiler', 'no-inline', 'noinline']
      },
      setup: function(arg$){
        var addListener, regDirect, this$ = this;
        addListener = arg$.addListener;
        regDirect = /^[^\#\?]+(?:\.(?:jpg|jpeg|gif|png|webp|apng)|image\.php)(?:@\dx)?(?:\/revision\/\w+)?(?:\?.*|\#.*)?$/i;
        return addListener(API, 'chat:image', function(arg$){
          var all, pre, completeURL, protocol, domain, url, onload, onerror, msg, offset, that, rgx, repl, forceProtocol, img;
          all = arg$.all, pre = arg$.pre, completeURL = arg$.completeURL, protocol = arg$.protocol, domain = arg$.domain, url = arg$.url, onload = arg$.onload, onerror = arg$.onerror, msg = arg$.msg, offset = arg$.offset;
          if (msg.message.toLowerCase().hasAny(this$._settings.filterTags) || msg.message[offset + all.length] === ";" || domain === 'plug.dj') {
            return;
          }
          if (that = this$.plugins[domain] || this$.plugins[domain.substr(1 + domain.indexOf('.'))]) {
            rgx = that[0], repl = that[1], forceProtocol = that[2];
            img = url.replace(rgx, repl);
            if (img !== url) {
              console.log("[inline-img]", completeURL + " ==> " + protocol + img);
              return "<a " + pre + "><img src='" + (forceProtocol || protocol) + img + "' class=p0ne-img " + onload + " " + onerror + "></a>";
            }
          }
          if (regDirect.test(url)) {
            if (in$(domain, this$.forceHTTPSDomains)) {
              completeURL = completeURL.replace('http://', 'https://');
            }
            console.log("[inline-img]", "[direct] " + completeURL);
            return "<a " + pre + "><img src='" + completeURL + "' class=p0ne-img " + onload + " " + onerror + "></a>";
          }
          return false;
        });
      },
      settingsExtra: function($el){
        var $input, this$ = this;
        $('<span class=p0ne-settings-input-label>').text("filter tags:").appendTo($el);
        return $input = $('<input class="p0ne-settings-input">').val(this._settings.filterTags.join(" ")).on('input', function(){
          var tag;
          return this$._settings.filterTags = (function(){
            var i$, ref$, len$, results$ = [];
            for (i$ = 0, len$ = (ref$ = $input.val().split(" ")).length; i$ < len$; ++i$) {
              tag = ref$[i$];
              results$.push($.trim(tag));
            }
            return results$;
          }());
        }).appendTo($el);
      },
      forceHTTPSDomains: ['i.imgur.com', 'deviantart.com'],
      plugins: {
        'imgur.com': [/^(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)*(?!gallery)(?!removalrequest)(?!random)(?!memegen)([\w]{5,7}(?:[&,][\w]{5,7})*)(?:#\d+)?[sbtmlh]?(?:\.(?:jpe?g|gif|png|gifv))?$/, "i.imgur.com/$1.gif"],
        'prntscrn.com': [/^(prntscr.com\/\w+)(?:\/direct\/)?/, "$1/direct"],
        'gyazo.com': [/^gyazo.com\/\w+/, "$&/raw"],
        'dropbox.com': [/^dropbox.com(\/s\/[a-z0-9]*?\/[^\/\?#]*\.(?:jpg|jpeg|gif|png|webp|apng))/, "dl.dropboxusercontent.com$1"],
        'pbs.twitter.com': [/^(pbs.twimg.com\/media\/\w+\.(?:jpg|jpeg|gif|png|webp|apng))(?:\:large|\:small)?/, "$1:small"],
        'googleimg.com': [
          /^google\.com\/imgres\?imgurl=(.+?)(?:&|$)/, function(arg$, src){
            return decodeURIComponent(url);
          }
        ],
        'imageshack.com': [
          /^imageshack\.com\/[fi]\/(\w\w)(\w+?)(\w)(?:\W|$)/, function(){
            return chatInlineImages.imageshackPlugin.apply(this, arguments);
          }
        ],
        'imageshack.us': [
          /^imageshack\.us\/[fi]\/(\w\w)(\w+?)(\w)(?:\W|$)/, function(){
            return chatInlineImages.imageshackPlugin.apply(this, arguments);
          }
        ]
        /* meme-plugins based on http://userscripts.org/scripts/show/154915.html (mirror: http://userscripts-mirror.org/scripts/show/154915.html ) */,
        'quickmeme.com': [/^(?:m\.)?quickmeme\.com\/meme\/(\w+)/, "i.qkme.me/$1.jpg"],
        'qkme.me': [/^(?:m\.)?qkme\.me\/(\w+)/, "i.qkme.me/$1.jpg"],
        'memegenerator.net': [/^memegenerator\.net\/instance\/(\d+)/, "http://cdn.memegenerator.net/instances/" + CHAT_WIDTH + "x/$1.jpg"],
        'imageflip.com': [/^imgflip.com\/i\/(.+)/, "i.imgflip.com/$1.jpg"],
        'livememe.com': [/^livememe.com\/(\w+)/, "i.lvme.me/$1.jpg"],
        'memedad.com': [/^memedad.com\/meme\/(\d+)/, "memedad.com/memes/$1.jpg"],
        'makeameme.org': [/^makeameme.org\/meme\/(.+)/, "makeameme.org/media/created/$1.jpg"]
      },
      imageshackPlugin: function(arg$, host, img, ext){
        ext = {
          j: 'jpg',
          p: 'png',
          g: 'gif',
          b: 'bmp',
          t: 'tiff'
        }[ext];
        return "https://imagizer.imageshack.us/a/img" + parseInt(host, 36) + "/1337/" + img + "." + ext;
      },
      pluginsAsync: ['deviantart.com', 'fav.me', 'sta.sh'],
      deviantartPlugin: function(replaceLink, url){
        return $.getJSON("http://backend.deviantart.com/oembed?format=json&url=" + url, function(d){
          if (d.height <= MAX_IMAGE_HEIGHT) {
            return replaceLink(d.url);
          } else {
            return replaceLink(d.thumbnail_url);
          }
        });
      }
    });
    module('imageLightbox', {
      require: ['chatInlineImages', 'chatDomEvents'],
      setup: function(arg$){
        var addListener, $createPersistent, $img, PADDING, $container, lastSrc, $el, dialog;
        addListener = arg$.addListener, $createPersistent = arg$.$createPersistent;
        PADDING = 10;
        $container = $('#dialog-container');
        this.$el = $el = $createPersistent('<img class=p0ne-img-large>').css({
          position: 'absolute',
          zIndex: 6,
          cursor: 'pointer',
          boxShadow: '0 0 35px black, 0 0 5px black'
        }).hide().load(function(){
          return _$context.trigger('ShowDialogEvent:show', {
            dialog: dialog
          }, true);
        }).appendTo($body);
        addListener($container, 'click', '.p0ne-img-large', function(){
          dialog.close();
          return false;
        });
        this.dialog = dialog = {
          on: function(arg$, arg1$, container){
            this.container = container;
          },
          off: $.noop,
          containerOnClose: $.noop,
          destroy: $.noop,
          $el: $el,
          render: function(){
            /*
            $elImg .css do
                width: \auto
                height: \auto
            <- requestAnimationFrame
            appW = $app.width!
            appH = $app.height!
            ratio = 1   <?   (appW - 345px - PADDING) / w   <?   (appH - PADDING) / h
            w *= ratio
            h *= ratio
            */
            var contW, contH, imgW, imgH, offset;
            contW = $container.width();
            contH = $container.height();
            imgW = $img.width();
            imgH = $img.height();
            offset = $img.offset();
            console.log("[lightbox] rendering");
            $el.css({
              left: (offset.left + imgW / 2 - PADDING) * 100 / contW + "%",
              top: (offset.top + imgH / 2 - PADDING) * 100 / contH + "%",
              maxWidth: imgW * 100 / contW + "%",
              maxHeight: imgH * 100 / contH + "%"
            }).show();
            $img.css({
              visibility: 'hidden'
            });
            return requestAnimationFrame(function(){
              return $el.addClass('p0ne-img-large-open').css({
                left: '',
                top: '',
                maxWidth: '',
                maxHeight: ''
              });
            });
          },
          close: function(cb){
            var $img_, $el_, contW, contH, imgW, imgH, offset, this$ = this;
            $img_ = $img;
            $el_ = $el;
            this.isOpen = false;
            contW = $container.width();
            contH = $container.height();
            imgW = $img.width();
            imgH = $img.height();
            offset = $img.offset();
            $el.css({
              left: (offset.left + imgW / 2 - PADDING) * 100 / contW + "%",
              top: (offset.top + imgH / 2 - PADDING) * 100 / contH + "%",
              maxWidth: imgW * 100 / contW + "%",
              maxHeight: imgH * 100 / contH + "%"
            });
            return sleep(200, function(){
              $el.removeClass('p0ne-img-large-open');
              $img_.css({
                visibility: 'visible'
              });
              this$.container.onClose();
              return typeof cb === 'function' ? cb() : void 8;
            });
          }
        };
        dialog.closeBind = bind$(dialog, 'close');
        return addListener(chatDomEvents, 'click', '.p0ne-img', function(e){
          var $img_;
          $img_ = $(this);
          e.preventDefault();
          if (dialog.isOpen) {
            if ($img_.is($img)) {
              dialog.close();
            } else {
              dialog.close(helper);
            }
          } else {
            helper();
          }
          function helper(){
            var src;
            $img = $img_;
            dialog.isOpen = true;
            src = $img.attr('src');
            if (src !== lastSrc) {
              lastSrc = src;
              $el[0].onload = function(){
                return _$context.trigger('ShowDialogEvent:show', {
                  dialog: dialog
                }, true);
              };
              return $el.attr('src', src);
            } else {
              return _$context.trigger('ShowDialogEvent:show', {
                dialog: dialog
              }, true);
            }
          }
          return helper;
        });
      },
      disable: function(){
        var ref$, this$ = this;
        if ((ref$ = this.dialog) != null && ref$.isOpen) {
          return this.dialog.close(function(){
            var ref$;
            return (ref$ = this$.$el) != null ? ref$.remove() : void 8;
          });
        } else {
          return (ref$ = this.$el) != null ? ref$.remove() : void 8;
        }
      }
    });
    /*
    module \chatYoutubeThumbnails, do
        settings: \chat
        help: '''
            Convert show thumbnails of linked Youtube videos in the chat.
            When hovering the thumbnail, it will animate, alternating between three frames of the video.
        '''
        setup: ({add, addListener}) ->
            addListener chatDomEvents, \mouseenter, \.p0ne-yt-img, (e) ~>
                clearInterval @interval
                img = this
                id = this.parentElement
    
                if id != @lastID
                    @frame = 1
                    @lastID = id
                img.style.backgroundImage = "url(http://i.ytimg.com/vi/#id/#{@frame}.jpg)"
                @interval = repeat 1_000ms, ~>
                    console.log "[p0ne_yt_preview]", "showing 'http://i.ytimg.com/vi/#id/#{@frame}.jpg'"
                    @frame = (@frame % 3) + 1
                    img.style.backgroundImage = "url(http://i.ytimg.com/vi/#id/#{@frame}.jpg)"
                console.log "[p0ne_yt_preview]", "started", e, id, @interval
                #ToDo show YT-options (grab, open, preview, [automute])
    
            addListener chatDomEvents, \mouseleave, \.p0ne-yt-img, (e) ~>
                clearInterval @interval
                img = this
                id = this.parentElement.dataset.ytCid
                img.style.backgroundImage = "url(http://i.ytimg.com/vi/#id/0.jpg)"
                console.log "[p0ne_yt_preview]", "stopped"
                #ToDo hide YT-options
    
            addListener API, \chat:image, ({pre, url, onload}) ->
            yt = YT_REGEX .exec(url)
            if yt and (yt = yt.1)
                console.log "[inline-img]", "[YouTube #yt] #url ==> http://i.ytimg.com/vi/#yt/0.jpg"
                return "
                    <a class=p0ne-yt data-yt-cid='#yt' #pre>
                        <div class=p0ne-yt-icon></div>
                        <div class=p0ne-yt-img #onload style='background-image:url(http://i.ytimg.com/vi/#yt/0.jpg)'></div>
                        #url
                    </a>
                " # no `onerror` on purpose # when updating the HTML, check if it breaks the animation callback
                # default.jpg for smaller thumbnail; 0.jpg for big thumbnail; 1.jpg, 2.jpg, 3.jpg for previews
            return false
        interval: -1
        frame: 1
        lastID: ''
    */
    /*@source p0ne.look-and-feel.ls */
    /**
     * plug_p0ne modules to add styles.
     * This needs to be kept in sync with plug_pony.css
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    module('p0neStylesheet', {
      setup: function(arg$){
        var loadStyle;
        loadStyle = arg$.loadStyle;
        return loadStyle(p0ne.host + "/css/plug_p0ne.css?r=41");
      }
    });
    /*
    window.moduleStyle = (name, d) ->
        options =
            settings: true
            module: -> @toggle!
        if typeof d == \string
            if isURL(d) # load external CSS
                options.setup = ({loadStyle}) ->
                    loadStyle d
            else if d.0 == "." # toggle class
                options.setup = ->
                    $body .addClass d
                options.disable = ->
                    $body .removeClass d
        else if typeof d == \function
            options.setup = d
        module name, options
    */
    /*####################################
    #            FIMPLUG THEME           #
    ####################################*/
    module('fimplugTheme', {
      settings: 'look&feel',
      displayName: "Brinkie's fimplug Theme",
      setup: function(arg$){
        var loadStyle;
        loadStyle = arg$.loadStyle;
        return loadStyle(p0ne.host + "/css/fimplug.css?r=24");
      }
    });
    /*####################################
    #          ANIMATED DIALOGS          #
    ####################################*/
    module('animatedUI', {
      require: ['Dialog'],
      setup: function(arg$){
        var addListener, replace;
        addListener = arg$.addListener, replace = arg$.replace;
        $('.dialog').addClass('opaque');
        replace(Dialog, 'render', function(){
          return function(){
            var this$ = this;
            this.show();
            sleep(0, function(){
              return this$.$el.addClass('opaque');
            });
            return this;
          };
        });
        addListener(_$context, 'ShowDialogEvent:show', function(d){
          var ref$, ref1$, this$ = this;
          if (((ref$ = d.dialog.options) != null ? (ref1$ = ref$.media) != null ? ref1$.format : void 8 : void 8) === 2) {
            return sleep(0, function(){
              return this$.$el.addClass('opaque');
            });
          }
        });
        return replace(Dialog, 'close', function(close_){
          return function(){
            var this$ = this;
            this.$el.removeClass('opaque');
            sleep(200, function(){
              return close_.call(this$);
            });
            return this;
          };
        });
      }
    });
    /*####################################
    #        FIX HIGH RESOLUTIONS        #
    ####################################*/
    module('fixHiRes', {
      displayName: "☢ Fix high resolutions",
      settings: 'fixes',
      help: 'This will fix some odd looking things on larger screens\nNOTE: This is WORK IN PROGESS! Right now it doesn\'t help much.',
      setup: function(){
        return $body.addClass('p0ne-fix-hires');
      },
      disable: function(){
        return $body.removeClass('p0ne-fix-hires');
      }
    });
    /*####################################
    #         PLAYLIST ICON VIEW         #
    ####################################*/
    module('playlistIconView', {
      displayName: "Playlist Icon View",
      settings: 'look&feel',
      help: 'Shows songs in the playlist and history panel in an icon view instead of the default list view.',
      optional: ['PlaylistItemList', 'app'],
      setup: function(arg$, playlistIconView){
        var addListener, replace, replaceListener, CELL_HEIGHT, CELL_WIDTH, ref$, $hovered, $mediaPanel, this$ = this;
        addListener = arg$.addListener, replace = arg$.replace, replaceListener = arg$.replaceListener;
        $body.addClass('playlist-icon-view');
        if (typeof PlaylistItemList == 'undefined' || PlaylistItemList === null) {
          chatWarn(playlistIconView.displayName, "this module couldn't fully load, it might not act 100% as expected. If you have problems, you might want to disable this.");
          return;
        }
        CELL_HEIGHT = 185;
        CELL_WIDTH = 160;
        replace(PlaylistItemList.prototype, 'onResize', function(){
          return function(){
            var newCellsPerRow, newVisibleRows;
            this.constructor.__super__.onResize.call(this);
            newCellsPerRow = ~~((this.$el.width() - 10) / CELL_WIDTH);
            newVisibleRows = Math.ceil(2 + this.$el.height() / CELL_HEIGHT) * newCellsPerRow;
            if (newVisibleRows !== this.visibleRows || newCellsPerRow !== this.cellsPerRow) {
              console.log("[pIV resize]", newVisibleRows, newCellsPerRow);
              this.visibleRows = newVisibleRows;
              this.cellsPerRow = newCellsPerRow;
              delete this.currentRow;
              return this.onScroll();
            }
          };
        });
        replace(PlaylistItemList.prototype, 'onScroll', function(oS){
          return function(){
            var top, ref$, lastRow, ref1$, i$, e, row;
            if (this.scrollPane) {
              top = (ref$ = ~~(this.scrollPane.scrollTop() / CELL_HEIGHT) - 1) > 0 ? ref$ : 0;
              this.firstRow = top * this.cellsPerRow;
              lastRow = (ref$ = this.firstRow + this.visibleRows) < (ref1$ = this.collection.length) ? ref$ : ref1$;
              if (this.currentRow !== this.firstRow) {
                console.log("[scroll]", this.firstRow, lastRow, this.visibleRows);
                this.currentRow = this.firstRow;
                this.$firstRow.height(top * CELL_HEIGHT);
                this.$lastRow.height(~~((this.collection.length - lastRow) / this.cellsPerRow) * CELL_HEIGHT);
                this.$container.empty().append(this.$firstRow);
                for (i$ = this.firstRow; i$ <= lastRow; ++i$) {
                  e = i$;
                  if (row = this.rows[e]) {
                    this.$container.append(row.$el);
                    row.render();
                  }
                }
                return this.$container.append(this.$lastRow);
              }
            }
          };
        });
        if ((ref$ = this.pl = app != null ? app.footer.playlist.playlist.media.list : void 8) != null && ref$.rows) {
          Layout.off('resize', this.pl.resizeBind).resize(replace(this.pl, 'resizeBind', function(){
            return bind$(this$.pl, 'onResize');
          }));
          this.pl.$el.off('jsp-scroll-y', this.pl.scrollBind).on('jsp-scroll-y', replace(this.pl, 'scrollBind', function(){
            return bind$(this$.pl, 'onScroll');
          }));
          replaceListener(_$context, 'anim:playlist:progress', PlaylistItemList, function(){
            return this$.pl.onResize;
          });
          delete this.pl.currentRow;
          this.pl.onResize(Layout.getSize());
          if (typeof (ref$ = this.pl).onScroll === 'function') {
            ref$.onScroll();
          }
        } else {
          console.warn("no pl");
        }
        replace(searchManager, '_search', function(){
          return function(){
            var limit;
            limit = (typeof pl != 'undefined' && pl !== null ? pl.visibleRows : void 8) || 50;
            console.log("[_search]", this.lastQuery, this.page, limit);
            if (this.lastFormat === 1) {
              return searchAux.ytSearch(this.lastQuery, this.page, limit, this.ytBind);
            } else if (this.lastFormat === 2) {
              return searchAux.scSearch(this.lastQuery, this.page, limit, this.scBind);
            }
          };
        });
        $hovered = $();
        $mediaPanel = $('#media-panel');
        addListener($mediaPanel, 'mouseover', '.row', function(){
          $hovered.removeClass('hover');
          $hovered = $(this);
          if (!$hovered.hasClass('selected')) {
            return $hovered.addClass('hover');
          }
        });
        addListener($mediaPanel, 'mouseout', '.hovered', function(){
          return $hovered.removeClass('hover');
        });
        return replace(PlaylistItemList.prototype, 'onDragUpdate', function(){
          return function(e){
            var n, r, i, s, o;
            this.constructor.__super__.onDragUpdate.call(this, e);
            n = this.scrollPane.scrollTop();
            if (this.currentDragRow && this.currentDragRow.$el) {
              r = 0;
              i = this.currentDragRow.options.index;
              if (!this.lockFirstItem || i > 0) {
                this.targetDropIndex = i;
                s = this.currentDragRow.$el.offset().left;
                if (this.mouseX >= s + this.currentDragRow.$el.width() / 2) {
                  this.$el.addClass('p0ne-drop-right');
                  this.targetDropIndex = i === this.lastClickedIndex - 1
                    ? this.lastClickedIndex
                    : this.targetDropIndex = i + 1;
                } else {
                  this.$el.removeClass('p0ne-drop-right');
                  this.targetDropIndex = i === this.lastClickedIndex + 1
                    ? this.lastClickedIndex
                    : this.targetDropIndex = i;
                }
              } else if (i === 0) {
                this.targetDropIndex = 1;
              }
            }
            return o = this.onCheckListScroll();
          };
        });
      },
      disableLate: function(){
        var ref$, ref1$;
        console.info(getTime() + " [playlistIconView] disabling");
        $body.removeClass('playlist-icon-view');
        return (ref$ = this.pl) != null ? (ref1$ = ref$.$el) != null ? ref1$.off('jsp-scroll-y').on('jsp-scroll-y', this.pl.scrollBind) : void 8 : void 8;
      }
    });
    /*####################################
    #          VIDEO PLACEHOLDER         #
    ####################################*/
    module('videoPlaceholderImage', {
      displayName: "Video Placeholder Thumbnail",
      settings: 'look&feel',
      help: 'Shows a thumbnail in place of the video, if you snooze the video or turn off the stream.\n\nThis is useful for knowing WHAT is playing, even when don\'t want to watch it.',
      screenshot: 'https://i.imgur.com/TMHVsrN.gif',
      setup: function(arg$){
        var addListener, $room, $playbackImg;
        addListener = arg$.addListener;
        $room = $('#room');
        $playbackImg = $('#playback-container');
        addListener(API, 'advance', updatePic);
        updatePic({
          media: API.getMedia()
        });
        function updatePic(d){
          var img;
          if (!d.media) {
            console.log("[Video Placeholder Image] hide", d);
            return $playbackImg.css({
              backgroundColor: 'transparent',
              backgroundImage: 'none'
            });
          } else if (d.media.format === 1) {
            if ($room.hasClass('video-only')) {
              img = "https://i.ytimg.com/vi/" + d.media.cid + "/maxresdefault.jpg";
            } else {
              img = "https://i.ytimg.com/vi/" + d.media.cid + "/0.jpg";
            }
            console.log("[Video Placeholder Image] " + img, d);
            return $playbackImg.css({
              backgroundColor: '#000',
              backgroundImage: "url(" + img + ")"
            });
          } else {
            console.log("[Video Placeholder Image] " + d.media.image, d);
            return $playbackImg.css({
              backgroundColor: '#000',
              backgroundImage: "url(" + d.media.image + ")"
            });
          }
        }
        return updatePic;
      },
      disable: function(){
        return $('#playback-container').css({
          backgroundColor: 'transparent',
          backgroundImage: 'none'
        });
      }
    });
    /*####################################
    #             LEGACY CHAT            #
    ####################################*/
    module('legacyChat', {
      displayName: "Smaller Chat",
      settings: 'chat',
      help: 'Shows the chat in the old format, before badges were added to it in December 2014.\nMakes the messages smaller, so more fit on the screen',
      disabled: true,
      setup: function(arg$){
        var addListener, $cb, this$ = this;
        addListener = arg$.addListener;
        $body.addClass('legacy-chat');
        $cb = $('#chat-button');
        addListener($cb, 'dblclick', function(e){
          this$.toggle();
          return e.preventDefault();
        });
        return addListener(chatDomEvents, 'dblclick', '.popout .icon-chat', function(e){
          this$.toggle();
          return e.preventDefault();
        });
      },
      disable: function(){
        return $body.removeClass('legacy-chat');
      }
    });
    /*####################################
    #            LEGACY FOOTER           #
    ####################################*/
    module('legacyFooter', {
      displayName: "Info Footer",
      settings: 'look&feel',
      help: 'Restore the old look of the footer (the thing below the chat) and transform it into a more useful information panel.\nTo get to the settings etc, click anywhere on the panel.',
      disabled: true,
      setup: function(){
        var foo, info, x$;
        $body.addClass('legacy-footer');
        foo = $('#footer-user');
        info = foo.find('.info');
        info.on('click', function(){});
        info.on('click', function(){
          foo.addClass('menu');
          return requestAnimationFrame(function(){
            return $body.one('click', function(){
              return foo.removeClass('menu');
            });
          });
        });
        x$ = foo.find('.back span');
        if (!/\S/.test(x$.text())) {
          x$.text((typeof Lang != 'undefined' && Lang !== null ? Lang.userMeta.backToCommunity : void 8) || "Back To Community");
        }
        return x$;
      },
      disable: function(){
        return $body.removeClass('legacy-footer');
      }
    });
    /*####################################
    #            CHAT DJ ICON            #
    ####################################*/
    module('djIconChat', {
      require: ['chatPlugin'],
      settings: 'look&feel',
      displayName: "Current-DJ-icon in Chat",
      setup: function(arg$){
        var addListener, css, icon;
        addListener = arg$.addListener, css = arg$.css;
        icon = getIcon('icon-current-dj');
        css('djIconChat', "#chat .from-current-dj .timestamp::before { background: " + icon.background + "; }");
        return addListener(_$context, 'chat:plugin', function(message){
          var ref$;
          if (message.uid && message.uid === ((ref$ = API.getDJ()) != null ? ref$.id : void 8)) {
            return message.addClass('from-current-dj');
          }
        });
      }
    });
    /*####################################
    #             EMOJI PACK             #
    ####################################*/
    module('emojiPack', {
      displayName: '☢ Emoji Pack [Google]',
      settings: 'look&feel',
      disabled: true,
      help: 'Replace all emojis with the one from Google (for Android Lollipop).\n\nEmojis are are the little images that show up e.g. when you write ":eggplant:" in the chat. <span class="emoji emoji-1f346"></span>\n\n<small>\nNote: :yellow_heart: <span class="emoji emoji-1f49b"></span> and :green_heart: <span class="emoji emoji-1f49a"></span> look neither yellow nor green with this emoji pack.\n</small>',
      screenshot: 'https://i.imgur.com/Ef94Csn.png',
      _settings: {
        pack: 'google'
      },
      setup: function(arg$){
        var loadStyle;
        loadStyle = arg$.loadStyle;
        return loadStyle(p0ne.host + "/css/temp." + this._settings.pack + "-emoji.css");
      }
    });
    /*####################################
    #               CENSOR               #
    ####################################*/
    module('censor', {
      displayName: "Censor",
      settings: 'dev',
      help: 'blurs some information like playlist names, counts, EP and Plug Notes.\nGreat for taking screenshots',
      disabled: true,
      setup: function(arg$){
        var css;
        css = arg$.css;
        $body.addClass('censored');
        return css('@font-face {font-family: "ThePrintedWord";src: url("http://letterror.com/wp-content/themes/nextltr/css/fonts/ThePrintedWord.eot");src: url("http://letterror.com/wp-content/themes/nextltr/css/fonts/ThePrintedWord.eot?") format("embedded-opentype"),url("http://letterror.com/wp-content/themes/nextltr/css/fonts/ThePrintedWord.woff") format("woff"),url("http://letterror.com/wp-content/themes/nextltr/css/fonts/ThePrintedWord.svg") format("svg"),url("http://letterror.com/wp-content/themes/nextltr/css/fonts/ThePrintedWord.otf") format("opentype");font-style: normal;font-weight: 400;font-stretch: normal;}');
      },
      disable: function(){
        return $body.removeClass('censored');
      }
    });
    /*@source p0ne.room-theme.ls */
    /**
     * Room Settings module for plug_p0ne
     * made to be compatible with plugCubes Room Settings
     * so room hosts don't have to bother with mutliple formats
     * that also means, that a lot of inspiration came from and credits go to the PlugCubed team ♥
     *
     * for more information, see https://issue.plugcubed.net/wiki/Plug3%3ARS
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
    */
    /*####################################
    #            ROOM SETTINGS           #
    ####################################*/
    module('roomSettings', {
      require: ['room'],
      optional: ['_$context'],
      persistent: ['_data', '_room'],
      module: new DataEmitter('roomSettings'),
      setup: function(arg$){
        var addListener;
        addListener = arg$.addListener;
        this._update();
        if (typeof _$context != 'undefined' && _$context !== null) {
          addListener(_$context, 'room:joining', this._clear, this);
          return addListener(_$context, 'room:joined', this._update, this);
        }
      },
      _update: function(){
        var roomslug, roomDescription, url, this$ = this;
        this._listeners = [];
        roomslug = getRoomSlug();
        if (this._data && roomslug === this._room) {
          return;
        }
        if (!(roomDescription = room.get('description'))) {
          return console.warn("[p0ne] no p³ compatible Room Settings found");
        } else if (url = /@p3=(.*)/i.exec(roomDescription)) {
          console.log("[p0ne] p³ compatible Room Settings found", url[1]);
          return $.getJSON(proxify(url[1])).then(function(data){
            console.log(getTime() + " [p0ne] loaded p³ compatible Room Settings");
            this$._room = roomslug;
            return this$.set(data);
          }).fail(function(){
            return chatWarn("cannot load Room Settings", "p0ne");
          });
        }
      }
    });
    /*####################################
    #             ROOM THEME             #
    ####################################*/
    module('roomTheme', {
      displayName: "Room Theme",
      require: ['roomSettings'],
      optional: ['roomLoader'],
      settings: 'look&feel',
      help: 'Applies the room theme, if this room has one.\nRoom Settings and thus a Room Theme can be added by (co-) hosts of the room.',
      setup: function(arg$){
        var addListener, replace, css, loadStyle, roles, this$ = this;
        addListener = arg$.addListener, replace = arg$.replace, css = arg$.css, loadStyle = arg$.loadStyle;
        roles = ['residentdj', 'bouncer', 'manager', 'cohost', 'host', 'ambassador', 'admin'];
        this.$playbackBackground = $('#playback .background img');
        this.playbackBackgroundVanilla = this.$playbackBackground.attr('src');
        addListener(roomSettings, 'data', function(d){
          var styles, role, ref$, color, colorMap, k, selector, rule, attrs, v, i$, len$, ref1$, name, url, x$, key, text, lang;
          console.log(getTime() + " [roomTheme] loading theme");
          this$.clear();
          styles = "";
          /*== colors ==*/
          if (d.colors) {
            styles += "\n/*== colors ==*/\n";
            for (role in ref$ = d.colors.chat) {
              color = ref$[role];
              if (isColor(color)) {
                styles += "/* " + role + " => " + color + " */\n#user-panel:not(.is-none) .user > .icon-chat-" + role + " + .name, #user-lists .user > .icon-chat-" + role + " + .name,\n.cm.from-" + role + " .from, #waitlist .icon-chat-" + role + " + span,\n#user-rollover .icon-chat-cohost + span, ." + role + " {\n        color: " + color + " !important;\n}\n";
              }
            }
            colorMap = {
              background: '.room-background',
              header: '.app-header',
              footer: '#footer'
            };
            for (k in colorMap) {
              selector = colorMap[k];
              if (isColor(d.colors[k])) {
                styles += selector + " { background-color: " + d.colors[k] + " !important }\n";
              }
            }
          }
          /*== CSS ==*/
          if (d.css) {
            styles += "\n/*== custom CSS ==*/\n";
            for (rule in ref$ = d.css.rule) {
              attrs = ref$[rule];
              styles += rule + " {";
              for (k in attrs) {
                v = attrs[k];
                styles += "\n\t" + k + ": " + v;
                if (!/;\s*$/.test(v)) {
                  styles += ";";
                }
              }
              styles += "\n}\n";
            }
            for (i$ = 0, len$ = (ref$ = d.css.fonts || []).length; i$ < len$; ++i$) {
              ref1$ = ref$[i$], name = ref1$.name, url = ref1$.url;
              if (name && url) {
                if ($.isArray(url)) {
                  url = [].join.call(url, ", ");
                }
                styles += "@font-face {\n    font-family: '" + name + "';\n    src: '" + url + "';\n}\n";
              }
            }
            for (i$ = 0, len$ = (ref$ = d.css['import'] || []).length; i$ < len$; ++i$) {
              url = ref$[i$];
              loadStyle(url);
            }
          }
          /*== images ==*/
          if (d.images) {
            styles += "\n/*== images ==*/\n";
            /* custom p0ne stuff */
            if (isURL(d.images.backgroundScalable)) {
              styles += "#app { background-image: url(" + d.images.background + ") fixed center center / cover }\n";
              /* original plug³ stuff */
            } else if (isURL(d.images.background)) {
              styles += ".room-background { background-image: url(" + d.images.background + ") !important }\n";
            }
            if (isURL(d.images.playback) && (typeof roomLoader != 'undefined' && roomLoader !== null) && (typeof Layout != 'undefined' && Layout !== null)) {
              x$ = new Image;
              x$.onload = function(){
                this$.$playbackBackground.attr('src', d.images.playback);
                replace(roomLoader, 'frameHeight', function(){
                  return x$.height - 10;
                });
                replace(roomLoader, 'frameWidth', function(){
                  return x$.width - 18;
                });
                roomLoader.onVideoResize(Layout.getSize());
                return console.log(getTime() + " [roomTheme] loaded playback frame");
              };
              x$.onerror = function(){
                return console.error(getTime() + " [roomTheme] failed to load playback frame");
              };
              x$.src = d.images.playback;
              replace(roomLoader, 'src', function(){
                return d.images.playback;
              });
            }
            if (isURL(d.images.booth)) {
              styles += "/* custom booth */\n#avatars-container::before {\n    background-image: url(" + d.images.booth + ");\n}\n";
            }
            for (role in ref$ = d.images.icons) {
              url = ref$[role];
              if (in$(role, roles)) {
                styles += ".icon-chat-" + role + " {\n    background-image: url(" + url + ");\n    background-position: 0 0;\n}\n";
              }
            }
          }
          /*== text ==*/
          if (d.text) {
            for (key in ref$ = d.text.plugDJ) {
              text = ref$[key];
              for (lang in Lang[key]) {
                replace(Lang[key], lang, fn$);
              }
            }
          }
          css('roomTheme', styles);
          return this$.styles = styles;
          function fn$(){
            return text;
          }
        });
        return addListener(roomSettings, 'cleared', this.clear, this);
      },
      clear: function(skipDisables){
        var i$, ref$, len$, ref1$, target, attr, style, url;
        console.log(getTime() + " [roomTheme] clearing RoomTheme");
        if (!skipDisables) {
          for (i$ = 0, len$ = (ref$ = this._cbs.replacements || []).length; i$ < len$; ++i$) {
            ref1$ = ref$[i$], target = ref1$[0], attr = ref1$[1];
            target[attr] = target[attr + "_"];
          }
          for (style in this._cbs.css) {
            p0neCSS.css(style, "/* disabled */");
          }
          for (url in this._cbs.loadedStyles) {
            p0neCSS.unloadStyle(url);
          }
          delete this._cbs.replacements, delete this._cbs.css, delete this._cbs.loadedStyles;
        }
        this.currentRoom = null;
        return (ref$ = this.$playbackBackground) != null ? ref$.one('load', function(){
          if (typeof Layout != 'undefined' && Layout !== null) {
            return typeof roomLoader != 'undefined' && roomLoader !== null ? roomLoader.onVideoResize(Layout.getSize()) : void 8;
          }
        }).attr('src', this.playbackBackgroundVanilla) : void 8;
      },
      disable: function(){
        return this.clear(true);
      }
    });
    /*@source p0ne.song-notif.ls */
    /**
     * get fancy song notifications in the chat (with preview thumbnail, description, buttons, …)
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #             SONG NOTIF             #
    ####################################*/
    module('songNotif', {
      require: ['chatDomEvents'],
      optional: ['_$context', 'chat', 'users', 'database', 'auxiliaries', 'app', 'popMenu'],
      settings: 'base',
      displayName: 'Song Notifications',
      help: 'Shows notifications for playing songs in the chat.\nBesides the songs\' name, it also features a thumbnail and some extra buttons.\n\nBy clicking on the song\'s or author\'s name, a search on plug.dj for that name will be started, to easily find similar tracks.\n\nBy hovering the notification and clicking "description" the songs description will be loaded.\nYou can click anywhere on it to close it again.',
      persistent: ['lastMedia', '$div'],
      setup: function(arg$, arg1$, arg2$, module_){
        var addListener, $create, $createPersistent, css, $lastNotif, that, $description, this$ = this;
        addListener = arg$.addListener, $create = arg$.$create, $createPersistent = arg$.$createPersistent, css = arg$.css;
        $lastNotif = $();
        this.$div || (this.$div = $cms().find('.p0ne-song-notif:last'));
        this.callback = function(d){
          var media, score, ref$, html, time, mediaURL, duration, e;
          try {
            media = d.media;
            if ((media != null ? media.id : void 8) !== this$.lastMedia) {
              if (score = (ref$ = d.lastPlay) != null ? ref$.score : void 8) {
                /*@security HTML injection shouldn't be an issue, unless the score attributes are oddly manipulated */
                this$.$div.removeClass('song-current').find('.song-stats').html("<div class=score><div class='item positive'><i class='icon icon-history-positive'></i> " + score.positive + "</div><div class='item grabs'><i class='icon icon-history-grabs'></i> " + score.grabs + "</div><div class='item negative'><i class='icon icon-history-negative'></i> " + score.negative + "</div><div class='item listeners'><i class='icon icon-history-listeners'></i> " + ((typeof users != 'undefined' && users !== null ? users.length : void 8) || API.getUsers().length) + "</div></div>");
                this$.lastMedia = null;
                $lastNotif = this$.$div;
              }
            } else {
              return;
            }
            if (!media) {
              return;
            }
            this$.lastMedia = media.id;
            if (typeof chat != 'undefined' && chat !== null) {
              chat.lastType = 'p0ne-song-notif';
            }
            this$.$div = $createPersistent("<div class='update p0ne-song-notif song-current' data-id='" + media.id + "' data-cid='" + media.cid + "' data-format='" + media.format + "'>");
            html = "";
            time = getTime();
            if (media.format === 1) {
              mediaURL = "http://youtube.com/watch?v=" + media.cid;
            } else {
              mediaURL = "https://soundcloud.com/search?q=" + encodeURIComponent(media.author + ' - ' + media.title);
            }
            duration = mediaTime(media.duration);
            console.logImg(media.image.replace(/^\/\//, 'https://')).then(function(){
              return console.log(time + " [DJ_ADVANCE] " + d.dj.username + " is playing '" + media.author + " - " + media.title + "' (" + duration + ")", d);
            });
            html += "<div class='song-thumb-wrapper'><img class='song-thumb' src='" + media.image + "' /><span class='song-duration'>" + duration + "</span><div class='song-add btn'><i class='icon icon-add'></i></div><a class='song-open btn' href='" + mediaURL + "' target='_blank'><i class='icon icon-chat-popout'></i></a><!-- <div class='song-skip btn right'><i class='icon icon-skip'></i></div> --><!-- <div class='song-download btn right'><i class='icon icon-###'></i></div> --></div>" + getTimestamp() + "<div class='song-stats'></div><div class='song-dj un'></div><b class='song-title'></b><span class='song-author'></span><div class='song-description-btn'>Description</div>";
            this$.$div.html(html);
            this$.$div.find('.song-title').text(d.media.title).prop('title', d.media.title);
            this$.$div.find('.song-author').text(d.media.author);
            this$.$div.find('.song-dj').text(d.dj.username).data('uid', d.dj.id);
            if (media.format === 2 && p0ne.SOUNDCLOUD_KEY) {
              this$.$div.addClass('loading');
              mediaLookup(media).then(function(d){
                var that;
                this$.$div.removeClass('loading').data('description', d.description).find('.song-open').attr('href', d.url);
                if (d.download) {
                  return this$.$div.addClass('downloadable').find('.song-download').attr('href', d.download).attr('title', formatMB(d.downloadSize / 1000000) + " " + ((that = d.downloadFormat) ? '(.' + that + ')' : ''));
                }
              });
            }
            return appendChat(this$.$div);
          } catch (e$) {
            e = e$;
            return console.error("[p0ne.notif]", e);
          }
        };
        addListener(API, 'advance', this.callback);
        if (_$context) {
          addListener(_$context, 'room:joined', function(){
            return this$.callback({
              media: API.getMedia(),
              dj: API.getDJ()
            });
          });
        }
        addListener(API, 'modSkip', function(modUsername){
          var that, modID;
          console.info("[API.modSkip]", modUsername);
          if (that = getUser(modUsername)) {
            modID = "data-uid='" + that.id + "'";
          } else {
            modID = "";
          }
          return $lastNotif.find('.timestamp').after($("<div class='song-skipped un' " + modID + ">").text(modUsername));
        });
        loadStyle(p0ne.host + "/css/p0ne.notif.css?r=18");
        if (that = API.getMedia()) {
          that.image = httpsify(that.image);
          this.callback({
            media: that,
            dj: API.getDJ()
          });
        }
        addListener(_$context, 'RestrictedSearchEvent:search', function(){
          return snooze();
        });
        if (typeof popMenu != 'undefined' && popMenu !== null) {
          addListener(chatDomEvents, 'click', '.song-add', function(){
            var $el, $notif, id, format, msgOffset, obj;
            $el = $(this);
            $notif = $el.closest('.p0ne-song-notif');
            id = $notif.data('id');
            format = $notif.data('format');
            console.log("[add from notif]", $notif, id, format);
            msgOffset = $notif.offset();
            $el.offset = function(){
              return {
                left: msgOffset.left + 17,
                top: msgOffset.top + 18
              };
            };
            obj = {
              id: id,
              format: 1
            };
            obj.get = function(name){
              return this[name];
            };
            obj.media = obj;
            popMenu.isShowing = false;
            return popMenu.show($el, [obj]);
          });
        } else {
          css('songNotificationsAdd', '.song-add {display:none}');
        }
        addListener(chatDomEvents, 'click', '.song-add', function(){
          return showDescription($(this).closest('.p0ne-song-notif'), "<span class='ruleskip'>!ruleskip 1 - nonpony</span>\n<span class='ruleskip'>!ruleskip 2 - </span>\n<span class='ruleskip'>!ruleskip 3 - </span>\n<span class='ruleskip'>!ruleskip 4 - </span>\n<span class='ruleskip'>!ruleskip  - </span>\n<span class='ruleskip'>!ruleskip  - </span>\n<span class='ruleskip'>!ruleskip  - </span>\n<span class='ruleskip'>!ruleskip  - </span>");
        });
        addListener(chatDomEvents, 'click', '.song-author', function(){
          return mediaSearch(this.textContent);
        });
        $description = $();
        addListener(chatDomEvents, 'click', '.song-description-btn', function(e){
          var $notif, cid, format, that;
          try {
            if ($description) {
              hideDescription();
            }
            $description = $(this);
            $notif = $description.closest('.p0ne-song-notif');
            cid = $notif.data('cid');
            format = $notif.data('format');
            console.log("[song-notif] showing description", cid, $notif);
            if (that = $description.data('description')) {
              return showDescription($notif, that);
            } else {
              return console.log("looking up", {
                cid: cid,
                format: format
              }, mediaLookup({
                cid: cid,
                format: format
              }, {
                success: function(data){
                  var text;
                  text = formatPlainText(data.description);
                  $description.data('description', text);
                  return showDescription($notif, text);
                },
                fail: function(){
                  return $description.text("Failed to load").addClass('.song-description-failed');
                }
              }).timeout(200, function(){
                return $description.text("Description loading…").addClass('loading');
              }));
            }
          } catch (e$) {
            e = e$;
            return console.error("[song-notif]", e);
          }
        });
        addListener(chatDomEvents, 'click', '.song-description', function(e){
          if (!e.target.href) {
            return hideDescription();
          }
        });
        function showDescription($notif, text){
          var h, cm, offsetTop, ref$, ch;
          $notif.addClass('song-notif-with-description').append($description.removeClass('song-description-btn loading').css({
            opacity: 0,
            position: 'absolute'
          }).addClass('song-description').html(text + " <i class='icon icon-clear-input'></i>"));
          h = $description.height();
          $description.css({
            height: 0,
            position: 'static'
          }).animate({
            opacity: 1,
            height: h
          }, function(){
            return $description.css({
              height: 'auto'
            });
          });
          cm = $cm();
          offsetTop = ((ref$ = $notif.offset()) != null ? ref$.top : void 8) - 100;
          ch = cm.height();
          if (offsetTop + h > ch) {
            return cm.animate({
              scrollTop: cm.scrollTop() + Math.min(offsetTop + h - ch + 100, offsetTop)
            });
          }
        }
        function hideDescription(){
          var $notif, offsetTop, ref$, cm;
          if (!$description) {
            return;
          }
          console.log("[song-notif] closing description", $description);
          $notif = $description.closest('.p0ne-song-notif').removeClass('song-notif-with-description');
          $description.animate({
            opacity: 0,
            height: 0
          }, function(){
            return $(this).css({
              opacity: '',
              height: 'auto'
            }).removeClass('song-description text').addClass('song-description-btn').text("Description").appendTo($notif.find('.song-notif-next'));
          });
          $description = null;
          offsetTop = ((ref$ = $notif.offset()) != null ? ref$.top : void 8) - 100;
          if (offsetTop < 0) {
            cm = $cm();
            return cm.animate({
              scrollTop: cm.scrollTop() + offsetTop - 100
            });
          }
        }
        this.showDescription = showDescription;
        return this.hideDescription = hideDescription;
      },
      disable: function(){
        return typeof this.hideDescription === 'function' ? this.hideDescription() : void 8;
      }
    });
    /*@source p0ne.song-info.ls */
    /**
     * plug_p0ne songInfo
     * adds a dropdown with the currently playing song's description when clicking on the now-playing-bar (in the top-center of the page)
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #              SONG INFO             #
    ####################################*/
    module('songInfo', {
      optional: ['_$context'],
      settings: 'base',
      displayName: 'Song-Info Dropdown',
      help: 'A panel with the song\'s description and links to the artist and song.\nClick on the now-playing-bar (in the top-center of the page) to open it.',
      setup: function(arg$){
        var addListener, $create, css, this$ = this;
        addListener = arg$.addListener, $create = arg$.$create, css = arg$.css;
        this.$create = $create;
        css('songInfo', '#now-playing-bar {cursor: pointer;}');
        this.$el = $create('<div>').addClass('p0ne-song-info').appendTo('body');
        this.loadBind = bind$(this, 'load');
        addListener($('#now-playing-bar'), 'click', function(e){
          var $target, media;
          $target = $(e.target);
          if ($target.closest('#history-button').length || $target.closest('#volume').length) {
            return;
          }
          if (!this$.visible) {
            media = API.getMedia();
            if (!media) {
              this$.$el.html("Cannot load information if No song playing!");
            } else if (this$.lastMediaID === media.id) {
              API.once('advance', this$.loadBind);
            } else {
              this$.$el.html("loading…");
              this$.load({
                media: media
              });
            }
            this$.$el.addClass('expanded');
          } else {
            this$.$el.removeClass('expanded');
            API.off('advance', this$.loadBind);
          }
          return this$.visible = !this$.visible;
        });
        if (!_$context) {
          return;
        }
        return addListener(_$context, 'show:user show:history show:dashboard dashboard:disable', function(){
          if (this$.visible) {
            this$.visible = false;
            this$.$el.removeClass('expanded');
            return API.off('advance', this$.loadBind);
          }
        });
      },
      load: function(arg$, isRetry){
        var media, this$ = this;
        media = arg$.media;
        console.log("[song-info]", media);
        if (this.lastMediaID === media.id) {
          return this.showInfo(media);
        } else {
          this.lastMediaID = media.id;
          this.mediaData = null;
          mediaLookup(media, {
            fail: function(err){
              console.error("[song-info]", err);
              if (isRetry) {
                this$.$el.html("error loading, retrying…");
                return load({
                  media: media
                }, true);
              } else {
                return this$.$el.html("Couldn't load song info, sorry =(");
              }
            },
            success: function(mediaData){
              this$.mediaData = mediaData;
              console.log("[song-info] got data", this$.mediaData);
              return this$.showInfo(media);
            }
          });
          return API.once('advance', this.loadBind);
        }
      },
      showInfo: function(media){
        var d, $meta, $parts;
        if (this.lastMediaID !== media.id || this.disabled) {
          return;
        }
        d = this.mediaData;
        this.$el.html("");
        $meta = this.$create('<div>').addClass('p0ne-song-info-meta').appendTo(this.$el);
        $parts = {};
        if (media.format === 1) {
          $meta.addClass('youtube');
        } else {
          $meta.addClass('soundcloud');
        }
        $('<span>').addClass('p0ne-song-info-author').appendTo($meta).click(function(){
          return mediaSearch(media.author);
        }).attr('title', "search for '" + media.author + "'").text(media.author);
        $('<span>').addClass('p0ne-song-info-title').appendTo($meta).click(function(){
          return mediaSearch(media.title);
        }).attr('title', "search for '" + media.title + "'").text(media.title);
        $('<br>').appendTo($meta);
        $('<a>').addClass('p0ne-song-info-uploader').appendTo($meta).attr('href', d.uploader.url).attr('target', '_blank').attr('title', "open channel of '" + d.uploader.name + "'").text(d.uploader.name);
        $('<a>').addClass('p0ne-song-info-upload-title').appendTo($meta).attr('href', d.url).attr('target', '_blank').attr('title', (media.format === 1 ? 'open video on YouTube' : 'open Song on SoundCloud') + "").text(d.title);
        $('<br>').appendTo($meta);
        $('<span>').addClass('p0ne-song-info-date').appendTo($meta).text(getDateTime(new Date(d.uploadDate)));
        $('<span>').addClass('p0ne-song-info-duration').appendTo($meta).text("duration: " + mediaTime(+d.duration));
        if (media.format === 1 && d.restriction) {
          if (d.restriction.allowed) {
            $('<span>').addClass('p0ne-song-info-blocked').appendTo(this.$el).text("exclusively for " + humanList(d.restriction.allowed) + (d.restriction.allowed.length > 100 ? '(' + d.restriction.allowed.length + '/249)' : ''));
          }
          if (d.restriction.blocked) {
            $('<span>').addClass('p0ne-song-info-blocked').appendTo(this.$el).text("blocked in " + humanList(d.restriction.blocked) + (d.restriction.blocked.length > 100 ? '(' + d.restriction.blocked.length + '/249)' : ''));
          }
        }
        return $('<div>').addClass('p0ne-song-info-description').appendTo(this.$el).html(formatPlainText(d.description));
      },
      disable: function(){
        var ref$;
        return (ref$ = this.$el) != null ? ref$.remove() : void 8;
      }
    });
    /*@source p0ne.avatars.ls */
    /**
     * plug_p0ne Custom Avatars
     * adds custom avatars to plug.dj when connected to a plug_p0ne Custom Avatar Server (ppCAS)
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     *
     * Developer's note: if you create your own custom avatar script or use a modified version of this,
     * you are hereby granted permission connect to this one's default avatar server.
     * However, please drop me an e-mail so I can keep an overview of things.
     * I remain the right to revoke this right anytime.
     */
    /* THIS IS A TESTING VERSION! SOME THINGS ARE NOT IMPLEMENTED YET! */
    /* (this includes things mentioned in the "notes" section below) */
    /*
    Notes for Socket Servers:
    - server-side:
        - push avatars using something like `socket.trigger('addAvatar', …)`
        - remember, you can offer specific avatars that are for moderators only
        - for people without a role, please do NOT allow avatars that might be confused with staff avatars (e.g. the (old) admin avatars)
            => to avoid confusion
        - dynamically loading avatars is possible
            - e.g. allow users customizing avatars and add them with addAvatar()
                with unique IDs and a URL to a PHP site that generates the avatar
            - WARNING: I HIGHLY discourage from allowing users to set their own images as avatars
                There's ALWAYS "this one guy" who abuses it.
                And most people don't want a bunch of dancing dicks on their screen
    - client-side (custom scripts)
        - when listening to userJoins, please use API.on(API.USER_JOIN, …) to avoid conflicts
        - add avatars using addAvatar(…)
        - do not access p0ne._avatars directly, do avoid conflicts and bugs!
        - if you however STILL manually change something, you might need to do updateAvatarStore() to update it
    */
    if (!window.SockJS) {
      window.Socket = window.WebSocket;
      require.config({
        paths: {
          sockjs: p0ne.host + "/scripts/sockjs"
        }
      });
    }
    console.time("[p0ne custom avatars] loaded SockJS");
    require(['sockjs'], function(SockJS){
      console.groupCollapsed("[p0ne custom avatars]");
      console.timeEnd("[p0ne custom avatars] loaded SockJS");
      requireHelper('users', function(it){
        var ref$, ref1$;
        return ((ref$ = it.models) != null ? (ref1$ = ref$[0]) != null ? ref1$.attributes.avatarID : void 8 : void 8) && !('isTheUserPlaying' in it) && !('lastFilter' in it);
      });
      window.userID || (window.userID = API.getUser().id);
      if (typeof users != 'undefined' && users !== null) {
        window.user_ || (window.user_ = users.get(userID));
      }
      window.sleep || (window.sleep = function(delay, fn){
        return setTimeout(fn, delay);
      });
      requireHelper('avatarAuxiliaries', function(it){
        return it.getAvatarUrl;
      });
      requireHelper('Avatar', function(it){
        return it.AUDIENCE;
      });
      requireHelper('myAvatars', function(it){
        return it.comparator === 'id';
      });
      requireHelper('InventoryDropdown', function(it){
        return it.selected;
      });
      window.Lang = require('lang/Lang');
      window.Cells = requireAll(function(m){
        var ref$;
        return ((ref$ = m.prototype) != null ? ref$.className : void 8) === 'cell' && m.prototype.getBlinkFrame;
      });
      /*####################################
      #           CUSTOM AVATARS           #
      ####################################*/
      user.avatarID = API.getUser().avatarID;
      module('customAvatars', {
        require: ['users', 'Lang', 'avatarAuxiliaries', 'Avatar', 'myAvatars'],
        optional: ['user_', '_$context'],
        displayName: 'Custom Avatars',
        settings: 'base',
        disabled: true,
        help: 'This adds a few custom avatars to plug.dj\n\nYou can select them like any other avatar, by clicking on your username (below the chat) and then clicking "My Stuff".\nClick on the Dropdown field in the top-left to select another category.\n\nEveryone who uses plug_p0ne sees you with your custom avatar.',
        persistent: ['socket'],
        _settings: {
          vanillaAvatarID: user.avatarID,
          avatarID: user.avatarID
        },
        setup: function(arg$, customAvatars){
          var addListener, revert, css, avatarID, hasNewAvatar, getAvatarUrl_, _internal_addAvatar, i$, ref$, len$, Cell, that, urlParser, this$ = this;
          addListener = arg$.addListener, this.replace = arg$.replace, revert = arg$.revert, css = arg$.css;
          console.info("[p0ne custom avatars] initializing");
          p0ne._avatars = {};
          avatarID = API.getUser().avatarID;
          hasNewAvatar = this._settings.vanillaAvatarID === avatarID;
          replace(avatarAuxiliaries, 'getAvatarUrl', function(gAU_){
            return function(avatarID, type){
              var ref$;
              return ((ref$ = p0ne._avatars[avatarID]) != null ? ref$[type] : void 8) || gAU_(avatarID, type);
            };
          });
          getAvatarUrl_ = avatarAuxiliaries.getAvatarUrl_;
          _internal_addAvatar = function(d){
            var avatarID, avatar, base_url;
            avatarID = d.avatarID;
            if (p0ne._avatars[avatarID]) {
              console.info("[p0ne custom avatars] updating '" + avatarID + "'", d);
            } else if (!d.isVanilla) {
              console.info("[p0ne custom avatars] adding '" + avatarID + "'", d);
            }
            avatar = {
              inInventory: false,
              category: d.category || 'p0ne',
              thumbOffsetTop: d.thumbOffsetTop,
              thumbOffsetLeft: d.thumbOffsetLeft,
              isVanilla: !!d.isVanilla,
              permissions: d.permissions || 0
            };
            if (d.isVanilla) {
              avatar[""] = getAvatarUrl_(avatarID, "");
              avatar.dj = getAvatarUrl_(avatarID, 'dj');
              avatar.b = getAvatarUrl_(avatarID, 'b');
            } else {
              base_url = d.base_url || "";
              avatar[""] = base_url + (d.anim || avatarID + '.png');
              avatar.dj = base_url + (d.dj || avatarID + 'dj.png');
              avatar.b = base_url + (d.b || avatarID + 'b.png');
            }
            p0ne._avatars[avatarID] = avatar;
            if (!(avatar.category in Lang.userAvatars)) {
              Lang.userAvatars[avatar.category] = avatar.category;
            }
            delete Avatar.IMAGES[avatarID + ""];
            delete Avatar.IMAGES[avatarID + "dj"];
            delete Avatar.IMAGES[avatarID + "b"];
            if (!updateAvatarStore.loading) {
              updateAvatarStore.loading = true;
              return requestAnimationFrame(function(){
                updateAvatarStore();
                return updateAvatarStore.loading = false;
              });
            }
          };
          out$.addAvatar = this.addAvatar = function(avatarID, d){
            var avatar;
            if (typeof d === 'object') {
              avatar = d;
              d.avatarID = avatarID;
            } else if (typeof avatarID === 'object') {
              avatar = avatarID;
            } else {
              throw new TypeError("invalid avatar data passed to addAvatar(avatarID*, data)");
            }
            d.isVanilla = false;
            return _internal_addAvatar(d);
          };
          out$.removeAvatar = this.removeAvatar = function(avatarID, replace){
            var i$, ref$, len$, u, ref1$;
            for (i$ = 0, len$ = (ref$ = users.models).length; i$ < len$; ++i$) {
              u = ref$[i$];
              if (u.get('avatarID') === avatarID) {
                u.set('avatarID', u.get('avatarID_'));
              }
            }
            return ref1$ = (ref$ = p0ne._avatars)[avatarID], delete ref$[avatarID], ref1$;
          };
          out$.changeAvatar = this.changeAvatar = function(userID, avatarID){
            var avatar, user, ref$;
            avatar = p0ne._avatars[avatarID];
            if (!avatar) {
              console.warn("[p0ne custom avatars] can't load avatar: '" + avatarID + "'");
              return;
            }
            if (!(user = users.get(userID))) {
              return;
            }
            if (!avatar.permissions || API.hasPermissions(userID, avatar.permissions)) {
              (ref$ = user.attributes).avatarID_ || (ref$.avatarID_ = user.get('avatarID'));
              user.set('avatarID', avatarID);
            } else {
              console.warn("user with ID " + userID + " doesn't have permissions for avatar '" + avatarID + "'");
            }
            if (userID === user_.id) {
              return this$._settings.avatarID = avatarID;
            }
          };
          out$.updateAvatarStore = this.updateAvatarStore = function(){
            var styles, avatarIDs, l, avatarID, ref$, avi, vanilla, categories, ref1$, key$, category, avis, i$, len$;
            styles = "";
            avatarIDs = [];
            l = 0;
            for (avatarID in ref$ = p0ne._avatars) {
              avi = ref$[avatarID];
              if (!avi.isVanilla) {
                avatarIDs[l++] = avatarID;
                styles += ".avi-" + avatarID + " {background-image: url('" + avi[''] + "');background-position: " + (avi.thumbOffsetLeft || 0) + "px " + (avi.thumbOffsetTop || 0) + "px";
                styles += "}\n";
              }
            }
            if (l) {
              css('p0ne_avatars', ".avi {background-repeat: no-repeat;}\n.thumb.small .avi-" + avatarIDs.join(', .thumb.small .avi-') + " {background-size: 1393px; /* = 836/15*24 thumbsWidth / thumbsCount * animCount*/}\n.thumb.medium .avi-" + avatarIDs.join(', .thumb.medium .avi-') + " {background-size: 1784px; /* = 1115/15*24 thumbsWidth / thumbsCount * animCount*/}\n" + styles + "");
            }
            vanilla = [];
            l = 0;
            categories = {};
            for (avatarID in ref$ = p0ne._avatars) {
              avi = ref$[avatarID];
              if (avi.inInventory || !avi.isVanilla) {
                if (avi.isVanilla) {
                  vanilla[l++] = new Avatar({
                    id: avatarID,
                    category: avi.category,
                    type: 'avatar'
                  });
                } else {
                  (ref1$ = categories[key$ = avi.category] || (categories[key$] = []))[ref1$.length] = avatarID;
                }
              }
            }
            myAvatars.models = [];
            l = 0;
            for (category in categories) {
              avis = categories[category];
              for (i$ = 0, len$ = avis.length; i$ < len$; ++i$) {
                avatarID = avis[i$];
                myAvatars.models[l++] = new Avatar({
                  id: avatarID,
                  category: category,
                  type: 'avatar'
                });
              }
            }
            myAvatars.models = myAvatars.models.concat(vanilla);
            myAvatars.length = myAvatars.models.length;
            myAvatars.trigger('reset', false);
            console.log("[p0ne custom avatars] avatar inventory updated");
            return true;
          };
          addListener(myAvatars, 'reset', function(vanillaTrigger){
            if (vanillaTrigger) {
              return updateAvatarStore();
            }
          });
          replace(InventoryDropdown.prototype, 'draw', function(d_){
            return function(){
              var html, categories, i$, ref$, len$, avi, category, this$ = this;
              html = "";
              categories = {};
              for (i$ = 0, len$ = (ref$ = myAvatars.models).length; i$ < len$; ++i$) {
                avi = ref$[i$];
                categories[avi.get('category')] = true;
              }
              for (category in categories) {
                html += "<div class=\"row\" data-value=\"" + category + "\"><span>" + Lang.userAvatars[category] + "</span></div>";
              }
              this.$el.html("<dl class=\"dropdown\">\n    <dt><span></span><i class=\"icon icon-arrow-down-grey\"></i><i class=\"icon icon-arrow-up-grey\"></i></dt>\n    <dd>" + html + "</dd>\n</dl>");
              $('dt').on('click', function(e){
                return this$.onBaseClick(e);
              });
              $('.row').on('click', function(e){
                return this$.onRowClick(e);
              });
              this.select(InventoryDropdown.selected);
              return this.$el.show();
            };
          });
          Lang.userAvatars.p0ne = "Custom Avatars";
          /*for {id:avatarID, attributes:{category}} in AvatarList.models
              _internal_addAvatar do
                  avatarID: avatarID
                  isVanilla: true
                  category: category
                  #category: avatarID.replace /\d+$/, ''
                  #category: avatarID.substr(0,avatarID.length-2) damn you "tastycat"
          console.log "[p0ne custom avatars] added internal avatars", p0ne._avatars
          */
          for (i$ = 0, len$ = (ref$ = window.Cells).length; i$ < len$; ++i$) {
            Cell = ref$[i$];
            replace(Cell.prototype, 'onClick', fn$);
          }
          $.ajax({
            url: '/_/store/inventory/avatars',
            success: function(d){
              var avatarIDs, l, i$, ref$, len$, avatar;
              avatarIDs = [];
              l = 0;
              for (i$ = 0, len$ = (ref$ = d.data).length; i$ < len$; ++i$) {
                avatar = ref$[i$];
                avatarIDs[l++] = avatar.id;
                if (!p0ne._avatars[avatar.id]) {
                  _internal_addAvatar({
                    avatarID: avatar.id,
                    isVanilla: true,
                    category: avatar.category
                  });
                }
                p0ne._avatars[avatar.id].inInventory = true;
              }
              return updateAvatarStore();
            }
          });
          if (that = !hasNewAvatar && this._settings.avatarID) {
            changeAvatar(userID, that);
          }
          if ((typeof _$context != 'undefined' && _$context !== null) && (typeof user_ != 'undefined' && user_ !== null)) {
            addListener(_$context, 'ack', function(){
              return replace(user_, 'set', function(s_){
                return function(obj, val){
                  if (obj.avatarID && obj.avatarID === this.get('avatarID_')) {
                    delete obj.avatarID;
                  }
                  return s_.call(this, obj, val);
                };
              });
            });
            addListener(_$context, 'UserEvent:friends', function(){
              return revert(user_, 'set');
            });
          }
          /*####################################
          #         ppCAS Integration          #
          ####################################*/
          this.oldBlurb = API.getUser().blurb;
          this.blurbIsChanged = false;
          urlParser = document.createElement('a');
          addListener(API, 'chatCommand', function(str){
            var server, base_url, helper;
            if (0 === str.toLowerCase().indexOf("/ppcas")) {
              server = $.trim(str.substr(6));
              if (server === "<url>") {
                chatWarn("hahaha, no. You have to replace '<url>' with an actual URL of a ppCAS server, otherwise it won't work.", "p0ne avatars");
              } else if (server === ".") {
                base_url = "https://dl.dropboxusercontent.com/u/4217628/plug.dj/customAvatars/";
                helper = function(fn){
                  var i$, ref$, len$, avatarID, results$ = [];
                  fn = window[fn];
                  for (i$ = 0, len$ = (ref$ = ['su01', 'su02', 'space03', 'space04', 'space05', 'space06']).length; i$ < len$; ++i$) {
                    avatarID = ref$[i$];
                    fn(avatarID, {
                      category: 'Veteran',
                      base_url: base_url,
                      thumbOffsetTop: -5
                    });
                  }
                  fn('animal12', {
                    category: 'Veteran',
                    base_url: base_url,
                    thumbOffsetTop: -19,
                    thumbOffsetLeft: -16
                  });
                  for (i$ = 0, len$ = (ref$ = ['animal01', 'animal02', 'animal03', 'animal04', 'animal05', 'animal06', 'animal07', 'animal08', 'animal09', 'animal10', 'animal11', 'animal12', 'animal13', 'animal14', 'lucha01', 'lucha02', 'lucha03', 'lucha04', 'lucha05', 'lucha06', 'lucha07', 'lucha08', 'monster01', 'monster02', 'monster03', 'monster04', 'monster05', '_tastycat', '_tastycat02', 'warrior01', 'warrior02', 'warrior03', 'warrior04']).length; i$ < len$; ++i$) {
                    avatarID = ref$[i$];
                    results$.push(fn(avatarID, {
                      category: 'Veteran',
                      base_url: base_url,
                      thumbOffsetTop: -10
                    }));
                  }
                  return results$;
                };
                this$.socket = {
                  close: function(){
                    var ref$;
                    helper('removeAvatar');
                    return ref$ = this.socket, delete this.socket, ref$;
                  }
                };
                helper('addAvatar');
              }
              urlParser.href = server;
              if (urlParser.host !== location.host) {
                console.log("[p0ne custom avatars] connecting to", server);
                return this$.connect(server);
              } else {
                return console.warn("[p0ne custom avatars] invalid ppCAS server");
              }
            }
          });
          return this.connect('https://p0ne.com/_');
          function fn$(oC_){
            return function(){
              var avatarID, ref$;
              console.log("[p0ne custom avatars] Avatar Cell click", this);
              avatarID = this.model.get("id");
              if (!p0ne._avatars[avatarID] || p0ne._avatars[avatarID].inInventory) {
                oC_.apply(this, arguments);
                return (ref$ = customAvatars.socket) != null ? ref$.emit('changeAvatarID', null) : void 8;
              } else {
                if ((ref$ = customAvatars.socket) != null) {
                  ref$.emit('changeAvatarID', avatarID);
                }
                changeAvatar(userID, avatarID);
                return this.onSelected();
              }
            };
          }
        },
        connectAttemps: 1,
        connect: function(url, reconnecting, reconnectWarning){
          var reconnect, user, oldBlurb, newBlurb, this$ = this;
          if (!reconnecting && this.socket) {
            if (url === this.socket.url && this.socket.readyState === 1) {
              return;
            }
            this.socket.close();
          }
          console.log("[p0ne custom avatars] using socket as ppCAS avatar server");
          reconnect = true;
          if (reconnectWarning) {
            setTimeout(function(){
              if (this$.connectAttemps === 0) {
                return chatWarn("lost connection to avatar server \xa0 =(", "p0ne avatars");
              }
            }, 10000);
          }
          this.socket = new SockJS(url);
          this.socket.url = url;
          this.socket.on = this.socket.addEventListener;
          this.socket.off = this.socket.removeEventListener;
          this.socket.once = function(type, callback){
            return this.on(type, function(){
              this.off(type, callback);
              return callback.apply(this, arguments);
            });
          };
          this.socket.emit = function(type){
            var data;
            data = slice$.call(arguments, 1);
            console.log("[ppCAS] > [" + type + "]", data);
            return this.send(JSON.stringify({
              type: type,
              data: data
            }));
          };
          this.socket.trigger = function(type, args){
            var listeners, i$, len$, fn, results$ = [];
            if (typeof args !== 'object' || !(args != null && args.length)) {
              args = [args];
            }
            listeners = this._listeners[type];
            if (listeners) {
              for (i$ = 0, len$ = listeners.length; i$ < len$; ++i$) {
                fn = listeners[i$];
                results$.push(fn.apply(this, args));
              }
              return results$;
            } else {
              return console.error("[ppCAS] unknown event '" + type + "'");
            }
          };
          this.socket.onmessage = function(arg$){
            var message, ref$, type, data, e;
            message = arg$.data;
            try {
              ref$ = JSON.parse(message), type = ref$.type, data = ref$.data;
              console.log("[ppCAS] < [" + type + "]", data);
            } catch (e$) {
              e = e$;
              console.warn("[ppCAS] invalid message received", message, e);
              return;
            }
            return this$.socket.trigger(type, data);
          };
          this.replace(this.socket, close, function(close_){
            return function(){
              this.trigger(close);
              return close_.apply(this, arguments);
            };
          });
          user = API.getUser();
          oldBlurb = user.blurb || "";
          newBlurb = oldBlurb.replace(/🐎\w{4}/g, '');
          if (oldBlurb !== newBlurb) {
            this.changeBlurb(newBlurb, {
              success: function(){
                return console.info("[ppCAS] removed old authToken from user blurb");
              }
            });
          }
          this.socket.on('authToken', function(authToken){
            var user, newBlurb;
            user = API.getUser();
            this$.oldBlurb = user.blurb || "";
            if (!user.blurb) {
              newBlurb = authToken;
            } else if (user.blurb.length >= 72) {
              newBlurb = user.blurb.substr(0, 71) + "… 🐎" + authToken;
            } else {
              newBlurb = user.blurb + " " + authToken;
            }
            this$.blurbIsChanged = true;
            return this$.changeBlurb(newBlurb, {
              success: function(){
                this$.blurbIsChanged = false;
                return this$.socket.emit('auth', userID);
              },
              error: function(){
                console.error("[ppCAS] failed to authenticate by changing the blurb.");
                return this$.changeBlurb(this$.oldBlurb, {
                  success: function(){
                    return console.info("[ppCAS] blurb reset.");
                  }
                });
              }
            });
          });
          this.socket.on('authAccepted', function(){
            this$.connectAttemps = 0;
            reconnecting = false;
            return this$.changeBlurb(this$.oldBlurb, {
              success: function(){
                return this$.blurbIsChanged = false;
              },
              error: function(){
                chatWarn("failed to authenticate to avatar server, maybe plug.dj is down or changed it's API?", "p0ne avatars");
                return this$.changeBlurb(this$.oldBlurb, {
                  error: function(){
                    return console.error("[ppCAS] failed to reset the blurb.");
                  }
                });
              }
            });
          });
          this.socket.on('authDenied', function(){
            console.warn("[ppCAS] authDenied");
            chatWarn("authentification failed", "p0ne avatars");
            this$.changeBlurb(this$.oldBlurb, {
              success: function(){
                return this$.blurbIsChanged = false;
              },
              error: function(){
                return this$.changeBlurb(this$.oldBlurb, {
                  error: function(){
                    return console.error("[ppCAS] failed to reset the blurb.");
                  }
                });
              }
            });
            return chatWarn("Failed to authenticate with user id '" + userID + "'", "p0ne avatars");
          });
          this.socket.on('avatars', function(avatars){
            var user, avatarID, avatar;
            user = API.getUser();
            this$.socket.avatars = avatars;
            if (this$.socket.users) {
              requestAnimationFrame(initUsers);
            }
            for (avatarID in avatars) {
              avatar = avatars[avatarID];
              addAvatar(avatarID, avatar);
            }
            if (this$._settings.avatarID in avatars) {
              return changeAvatar(userID, this$._settings.avatarID);
            } else if (user.avatarID in avatars) {
              return this$.socket.emit('changeAvatarID', user.avatarID);
            }
          });
          this.socket.on('users', function(users){
            this$.socket.users = users;
            if (this$.socket.avatars) {
              return requestAnimationFrame(initUsers);
            }
          });
          function initUsers(avatarID){
            var userID, ref$, ref1$;
            for (userID in ref$ = this$.socket.users) {
              avatarID = ref$[userID];
              console.log("[ppCAS] change other's avatar", userID, "(" + ((ref1$ = users.get(userID)) != null ? ref1$.get('username') : void 8) + ")", avatarID);
              this$.changeAvatar(userID, avatarID);
            }
            if (reconnecting) {
              chatWarn("reconnected", "p0ne avatars");
            }
            _$context.trigger('ppCAS:connected');
            return API.trigger('ppCAS:connected');
          }
          this.socket.on('changeAvatarID', function(userID, avatarID){
            var ref$;
            console.log("[ppCAS] change other's avatar:", userID, avatarID);
            return (ref$ = users.get(userID)) != null ? ref$.set('avatarID', avatarID) : void 8;
          });
          this.socket.on('disconnect', function(userID){
            console.log("[ppCAS] user disconnected:", userID);
            return this$.changeAvatarID(userID, avatarID);
          });
          this.socket.on('disconnected', function(reason){
            return this$.socket.trigger('close', reason);
          });
          this.socket.on('close', function(reason){
            console.warn("[ppCAS] connection closed", reason);
            return reconnect = false;
          });
          this.socket.onclose = function(e){
            var timeout;
            console.warn("[ppCAS] DISCONNECTED", e);
            _$context.trigger('ppCAS:disconnected');
            API.trigger('ppCAS:disconnected');
            if (e.wasClean) {
              return reconnect = false;
            } else if (reconnect && !this$.disabled) {
              timeout = ~~((5000 + Math.random() * 5000) * this$.connectAttemps);
              console.info("[ppCAS] reconnecting in " + humanTime(timeout) + " (" + xth(this$.connectAttemps) + " attempt)");
              return this$.reconnectTimer = sleep(timeout, function(){
                console.log("[ppCAS] reconnecting…");
                this$.connectAttemps++;
                this$.connect(url, true, this$.connectAttemps === 1);
                _$context.trigger('ppCAS:connecting');
                return API.trigger('ppCAS:connecting');
              });
            }
          };
          _$context.trigger('ppCAS:connecting');
          return API.trigger('ppCAS:connecting');
        },
        changeBlurb: function(newBlurb, options){
          options == null && (options = {});
          return $.ajax({
            method: 'PUT',
            url: '/_/profile/blurb',
            contentType: 'application/json',
            data: JSON.stringify({
              blurb: newBlurb
            }),
            success: options.success,
            error: options.error
          });
        },
        disable: function(){
          var ref$, avatarID, avi, i$, user, that, results$ = [];
          if (this.blurbIsChanged) {
            this.changeBlurb(this.oldBlurb);
          }
          if ((ref$ = this.socket) != null) {
            ref$.close();
          }
          clearTimeout(this.reconnectTimer);
          for (avatarID in ref$ = p0ne._avatars) {
            avi = ref$[avatarID];
            avi.inInventory = false;
          }
          this.updateAvatarStore();
          for (i$ in ref$ = users.models) {
            user = ref$[i$];
            if (that = user.attributes.avatarID_) {
              results$.push(user.set('avatarID', that));
            }
          }
          return results$;
        }
      });
      return console.groupEnd("[p0ne custom avatars]");
    });
    /*@source p0ne.settings.ls */
    /**
     * Settings pane for plug_p0ne
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #              SETTINGS              #
    ####################################*/
    module('p0neSettings', {
      _settings: {
        groupToggles: {
          p0neSettings: true,
          base: true
        }
      },
      setup: function(arg$, arg1$, arg2$, oldModule){
        var $create, addListener, groupToggles, ref$, $ppM, $ppI, $ppW, $ppS, $ppP, i$, module, this$ = this;
        $create = arg$.$create, addListener = arg$.addListener;
        this.$create = $create;
        groupToggles = this.groupToggles = (ref$ = this._settings).groupToggles || (ref$.groupToggles = {
          p0neSettings: true,
          base: true
        });
        $ppM = $create("<div id=p0ne-menu>").insertAfter('#app-menu');
        $ppI = $create("<div class=p0ne-icon>p<div class=p0ne-icon-sub>0</div></div>").appendTo($ppM);
        $ppW = this.$ppW = $("<div class=p0ne-settings-wrapper>").appendTo($ppM);
        $ppS = $create("<div class='p0ne-settings noselect'>").appendTo($ppW);
        $ppP = $create("<div class=p0ne-settings-popup>").appendTo($ppM).fadeOut(0);
        this.$vip = $("<div class=p0ne-settings-vip>").appendTo($ppS);
        this.toggleMenu(groupToggles.p0neSettings);
        this.$ppInfo = $("<div class=p0ne-settings-footer><div class=p0ne-icon>p<div class=p0ne-icon-sub>0</div></div><div class=p0ne-settings-version>v" + p0ne.version + "</div><div class=p0ne-settings-help-btn>help</div><div class=p0ne-settings-expert-toggle>show all options</div></div>").appendTo($ppS);
        for (i$ in ref$ = p0ne.modules) {
          module = ref$[i$];
          this.addModule(module);
        }
        $ppI.click(function(){
          return this$.toggleMenu();
        });
        addListener($body, 'click', '.p0ne-settings-summary', throttle(200, function(e){
          var $s;
          $s = $(this).parent();
          if ($s.data('open')) {
            $s.data('open', false).removeClass('open').stop().animate({
              height: 40
            }, 'slow');
            groupToggles[$s.data('group')] = false;
          } else {
            $s.data('open', true).addClass('open').stop().animate({
              height: $s.children().length * 44
            }, 'slow');
            groupToggles[$s.data('group')] = true;
          }
          return e.preventDefault();
        }));
        addListener($ppW, 'click', '.checkbox', throttle(200, function(){
          var $this, enable, $el, module;
          $this = $(this);
          enable = this.checked;
          $el = $this.closest('.p0ne-settings-item');
          module = $el.data('module');
          if (typeof module === 'string') {
            module = window[module] || {};
          }
          if (enable) {
            return module.enable();
          } else {
            return module.disable();
          }
        }));
        addListener($ppW, 'mouseover', '.p0ne-settings-has-more', function(){
          var $this, module, l, maxT, h, t, tt, ref$, diff;
          $this = $(this);
          module = $this.data('module');
          $ppP.html("<div class=p0ne-settings-popup-triangle></div><h3>" + module.displayName + "</h3>" + module.help + "" + (!module.screenshot
            ? ''
            : '<img src=' + module.screenshot + '>') + "");
          l = $ppW.width();
          maxT = $ppM.height();
          h = $ppP.height();
          t = $this.offset().top - 50;
          tt = (ref$ = t - h / 2) > 0 ? ref$ : 0;
          diff = tt - (maxT - h - 30);
          if (diff > 0) {
            t += diff + 10 - tt;
            tt -= diff;
          } else if (tt !== 0) {
            t = '50%';
          }
          $ppP.css({
            top: tt,
            left: l
          }).stop().fadeIn();
          return $ppP.find('.p0ne-settings-popup-triangle').css({
            top: t
          });
        });
        addListener($ppW, 'mouseout', '.p0ne-settings-has-more', function(){
          return $ppP.stop().fadeOut();
        });
        addListener($ppP, 'mouseover', function(){
          return $ppP.stop().fadeIn();
        });
        addListener($ppP, 'mouseout', function(){
          return $ppP.stop().fadeOut();
        });
        addListener(API, 'p0ne:moduleLoaded', function(module){
          return this$.addModule(module);
        });
        addListener(API, 'p0ne:moduleDisabled', function(module_){
          var ref$;
          if ((ref$ = module_._$settings) != null) {
            ref$.removeClass('p0ne-settings-item-enabled').find('.checkbox').attr('checked', false);
          }
          if ((ref$ = module_._$settingsExtra) != null) {
            ref$.stop().slideUp(function(){
              return $(this).remove();
            });
          }
          return console.log("[p0neSettings:disabledModule]", module_.name);
        });
        addListener(API, 'p0ne:moduleEnabled', function(module){
          var ref$;
          if ((ref$ = module._$settings) != null) {
            ref$.addClass('p0ne-settings-item-enabled').find('.checkbox')[0].checked = true;
          }
          this$.settingsExtra(true, module);
          return console.log("[p0neSettings:enabledModule]", module.name);
        });
        addListener(API, 'p0ne:moduleUpdated', function(module, module_){
          var ref$;
          console.log("[p0neSettings:updatedModule]", module.name, module_.name);
          if (module.settings) {
            this$.addModule(module, module_);
            if (module.help !== module_.help && ((ref$ = module._$settings) != null && ref$.is(':hover'))) {
              return module._$settings.mouseover();
            }
          }
        });
        addListener($body, 'click', '#app-menu', function(){
          return this$.toggleMenu(false);
        });
        if (typeof _$context != 'undefined' && _$context !== null) {
          addListener(_$context, 'show:user show:history show:dashboard dashboard:disable', function(){
            return this$.toggleMenu(false);
          });
        }
        addListener($body, 'click', '#plugcubed', function(){
          return this$.toggleMenu(false);
        });
        return _.defer(function(){
          var d, scrollLeftMax;
          d = $('<div>').css({
            height: 100,
            width: 100,
            overflow: 'auto'
          }).append($('<div>').css({
            height: 102,
            width: 100
          })).appendTo('body');
          if ('scrollLeftMax' in d[0]) {
            scrollLeftMax = d[0].scrollLeftMax;
          } else {
            d[0].scrollLeft = 999;
            scrollLeftMax = d[0].scrollLeft;
          }
          if (scrollLeftMax !== 0) {
            $ppW.css({
              paddingRight: scrollLeftMax
            });
          }
          return d.remove();
        });
      },
      toggleMenu: function(state){
        if (state != null
          ? state
          : state = !this.groupToggles.p0neSettings) {
          this.$ppW.slideDown();
        } else {
          this.$ppW.slideUp();
        }
        return this.groupToggles.p0neSettings = state;
      },
      groups: {},
      moderationGroup: $(),
      addModule: function(module, module_){
        var itemClasses, icons, i$, ref$, len$, k, $s;
        if (module.settings) {
          itemClasses = 'p0ne-settings-item';
          icons = "";
          for (i$ = 0, len$ = (ref$ = ['help', 'screenshot']).length; i$ < len$; ++i$) {
            k = ref$[i$];
            if (module[k]) {
              icons += "<div class=p0ne-settings-" + k + "></div>";
            }
          }
          if (icons.length) {
            icons = "<div class=p0ne-settings-icons>" + icons + "</div>";
            itemClasses += ' p0ne-settings-has-more';
          }
          if (module.settingsExtra) {
            itemClasses += ' p0ne-settings-has-extra';
          }
          if (!module.disabled) {
            itemClasses += ' p0ne-settings-item-enabled';
          }
          if (module.settingsVip) {
            $s = this.$vip;
            itemClasses += ' p0ne-settings-is-vip';
          } else if (!($s = this.groups[module.settings])) {
            $s = this.groups[module.settings] = $('<div class=p0ne-settings-group>').data('group', module.settings).append($('<div class=p0ne-settings-summary>').text(module.settings.toUpperCase())).insertBefore(this.$ppInfo);
            if (this._settings.groupToggles[module.settings]) {
              $s.data('open', true).addClass('open');
            }
            if (module.settings === 'moderation') {
              $s.addClass('p0ne-settings-group-moderation');
            }
          }
          module._$settings = $("<label class='" + itemClasses + "'><input type=checkbox class=checkbox " + (module.disabled ? '' : 'checked') + " /><div class=togglebox><div class=knob></div></div>" + module.displayName + "" + icons + "</label>").data('module', module);
          if (module_ != null && ((ref$ = module_._$settings) != null && ref$.parent().is($s))) {
            module_._$settings.after(module._$settings.addClass('updated')).remove();
            sleep(2000, function(){
              return module._$settings.removeClass('updated');
            });
            this.settingsExtra(false, module, module_);
          } else {
            module._$settings.appendTo($s);
          }
          if (this._settings.groupToggles[module.settings] && !module.settingsVip) {
            $s.stop().animate({
              height: $s.children().length * 44
            }, 'slow');
          }
          if (!module.disabled) {
            this.settingsExtra(false, module);
          }
        }
      },
      settingsExtra: function(autofocus, module, module_){
        var ref$, err, this$ = this;
        try {
          if (module_ != null) {
            if ((ref$ = module_._$settingsExtra) != null) {
              ref$.remove();
            }
          }
          if (module.settingsExtra) {
            module.settingsExtra(module._$settingsExtra = $("<div class=p0ne-settings-extra>").hide().insertAfter(module._$settings));
            return requestAnimationFrame(function(){
              module._$settingsExtra.slideDown();
              if (autofocus) {
                return module._$settingsExtra.find('input').focus();
              }
            });
          }
        } catch (e$) {
          err = e$;
          console.error("[" + module.name + "] error while processing settingsExtra", err.stack);
          return (ref$ = module._$settingsExtra) != null ? ref$.remove() : void 8;
        }
      }
    });
    /*@source p0ne.moderate.ls */
    /**
     * plug_p0ne modules to help moderators do their job
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #       BASE MODERATION MODULE       #
    ####################################*/
    module('enableModeratorModules', {
      require: ['user_'],
      setup: function(arg$){
        var addListener, prevRole;
        addListener = arg$.addListener;
        prevRole = user_.attributes.role;
        if (user.isStaff) {
          $body.addClass('user-is-staff');
        }
        return addListener(user_, 'change:role', function(user, newRole){
          var i$, ref$, len$, m;
          if (newRole > 1 && prevRole < 2) {
            for (i$ = 0, len$ = (ref$ = p0ne.modules).length; i$ < len$; ++i$) {
              m = ref$[i$];
              if (m.modDisabled) {
                m.enable();
                m.modDisabled = false;
              }
            }
            $body.addClass('user-is-staff');
            return user.isStaff = true;
          } else {
            for (i$ = 0, len$ = (ref$ = p0ne.modules).length; i$ < len$; ++i$) {
              m = ref$[i$];
              if (m.moderator && !m.modDisabled) {
                m.modDisabled = true;
                m.disable();
              }
            }
            $body.removeClass('user-is-staff');
            return user.isStaff = true;
          }
        });
      },
      disable: function(){
        return $body.removeClass('user-is-staff');
      }
    });
    /*####################################
    #             YELLOW MOD             #
    ####################################*/
    module('yellowMod', {
      displayName: 'Yellow Name as Staff',
      moderator: true,
      settings: 'moderation',
      setup: function(arg$){
        var css, id;
        css = arg$.css;
        id = API.getUser().id;
        return css('yellowMod', "#chat .fromID-" + id + " .un,.user[data-uid='" + id + "'] .name > span {color: #ffdd6f !important;}");
      }
    });
    /*####################################
    #       WARN ON HISTORY PLAYS        #
    ####################################*/
    module('warnOnHistory', {
      displayName: 'Warn on History',
      moderator: true,
      settings: 'moderation',
      setup: function(arg$){
        var addListener, this$ = this;
        addListener = arg$.addListener;
        return addListener(API, 'advance', function(d){
          var hist, inHistory, skipped, i$, len$, i, m, lastPlayI, lastPlay, msg;
          if (d.media) {
            hist = API.getHistory();
            inHistory = 0;
            skipped = 0;
            for (i$ = 0, len$ = hist.length; i$ < len$; ++i$) {
              i = i$;
              m = hist[i$];
              if (m.media.cid === d.media.cid && i !== 0) {
                lastPlayI || (lastPlayI = i);
                lastPlay || (lastPlay = m);
                inHistory++;
                if (m.skipped) {
                  skipped++;
                }
              }
            }
            if (inHistory) {
              msg = "";
              if (inHistory > 1) {
                msg += inHistory + "x ";
              }
              msg += "(" + (lastPlayI + 1) + "/" + (hist.length - 1) + ") ";
              if (skipped === inHistory) {
                msg += "but was skipped last time ";
              }
              if (skipped > 1) {
                msg += "it was skipped " + skipped + "/" + inHistory + " times ";
              }
              chatWarn(msg, 'Song is in History');
              return API.trigger('p0ne:songInHistory');
            }
          }
        });
      }
    });
    /*####################################
    #      DISABLE MESSAGE DELETE        #
    ####################################*/
    module('disableChatDelete', {
      require: ['_$context', 'user_'],
      optional: ['socketListeners'],
      moderator: true,
      displayName: 'Show deleted messages',
      settings: 'moderation',
      setup: function(arg$){
        var replace_$Listener, addListener, $createPersistent, css, lastDeletedCid;
        replace_$Listener = arg$.replace_$Listener, addListener = arg$.addListener, $createPersistent = arg$.$createPersistent, css = arg$.css;
        css('disableChatDelete', '.deleted {border-left: 2px solid red;display: none;}.p0ne-showDeletedMessages .deleted {display: block;}.deleted-message {display: block;text-align: right;color: red;font-family: monospace;}');
        $body.addClass('p0ne-showDeletedMessages');
        lastDeletedCid = null;
        addListener(_$context, 'socket:chatDelete', function(arg$){
          var p, c, mi, ref$;
          p = arg$.p, c = p.c, mi = p.mi;
          markAsDeleted(c, ((ref$ = users.get(mi)) != null ? ref$.get('username') : void 8) || mi);
          return lastDeletedCid = c;
        });
        replace_$Listener('chat:delete', function(){
          return function(cid){
            if (cid !== lastDeletedCid) {
              return markAsDeleted(cid);
            }
          };
        });
        function markAsDeleted(cid, moderator){
          var ref$, $msg, isLast, t, uid, d, cm;
          if ((typeof chat != 'undefined' && chat !== null) && ((ref$ = chat.lastText) != null && ref$.hasClass("cid-" + cid))) {
            $msg = chat.lastText.parent().parent();
            isLast = true;
          } else {
            $msg = getChat(cid);
          }
          console.log("[Chat Delete]", cid, $msg.text());
          t = getISOTime();
          try {
            uid = (ref$ = cid.split('-')) != null ? ref$[0] : void 8;
            if (cid === uid || !((ref$ = getUser(uid)) != null && ref$.gRole)) {
              $msg.addClass('deleted');
            }
            d = $createPersistent(getTimestamp()).addClass('delete-timestamp').appendTo($msg);
            d.text("deleted " + (moderator ? 'by ' + moderator : '') + " " + d.text());
            cm = $cm();
            cm.scrollTop(cm.scrollTop() + d.height());
            if (isLast) {
              return chat.lastType = 'p0ne-deleted';
            }
          } catch (e$) {}
        }
        return markAsDeleted;
      },
      disable: function(){
        return $body.removeClass('p0ne-showDeletedMessages');
      }
    });
    /*####################################
    #         DELETE OWN MESSAGES        #
    ####################################*/
    module('chatDeleteOwnMessages', {
      moderator: true,
      setup: function(arg$){
        var addListener;
        addListener = arg$.addListener;
        $cm().find("fromID-" + userID).addClass('deletable').append($('<div class="delete-button">Delete</div>').click(delCb));
        addListener(API, 'chat', function(message){
          var cid, uid;
          cid = message.cid, uid = message.uid;
          if (uid === userID) {
            return getChat(cid).addClass('deletable').append($('<div class="delete-button">Delete</div>').click(delCb));
          }
        });
        function delCb(){
          return API.moderateDeleteChat(
          $(this).closest('.cm').data('cid'));
        }
        return delCb;
      }
    });
    /*####################################
    #            WARN ON MEHER           #
    ####################################*/
    module('warnOnMehers', {
      users: {},
      moderator: true,
      displayName: 'Warn on Mehers',
      settings: 'moderation',
      _settings: {
        instantWarn: false,
        maxMehs: 3
      },
      setup: function(arg$, arg1$, arg2$, m_){
        var addListener, users, current, lastAdvance, this$ = this;
        addListener = arg$.addListener;
        if (m_) {
          this.users = m_.users;
        }
        users = this.users;
        current = {};
        addListener(API, 'voteUpdate', function(d){
          current[d.user.id] = d.vote;
          if (d.vote === -1 && d.user.uid !== userID) {
            console.error(formatUser(d.user, true) + " meh'd this song");
            if (this$._settings.instantWarn) {
              return appendChat($("<div class='cm system'><div class=box><i class='icon icon-chat-system'></i></div><div class='msg text'>" + formatUserHTML(troll, true) + " meh'd the past " + plural(users[k], 'song') + "!</div></div>"));
            }
          }
        });
        lastAdvance = 0;
        return addListener(API, 'advance', function(d){
          var k, ref$, v, troll, ref1$;
          d = Date.now();
          for (k in ref$ = current) {
            v = ref$[k];
            if (v === -1) {
              users[k] || (users[k] = 0);
              if (++users[k] > this$._settings.maxMehs && (troll = getUser(k))) {
                appendChat($("<div class='cm system'><div class=box><i class='icon icon-chat-system'></i></div><div class='msg text'>" + formatUserHTML(troll) + " meh'd the past " + plural(users[k], 'song') + "!</div></div>"));
              }
            } else if (d > lastAdvance + 10000 && ((ref1$ = d.lastPlay) != null ? ref1$.dj.id : void 8) !== k) {
              delete users[k];
            }
          }
          current = {};
          return lastAdvance = d;
        });
      }
    });
    /*####################################
    #              AFK TIMER             #
    ####################################*/
    module('afkTimer', {
      require: ['RoomUserRow', 'WaitlistRow'],
      optional: ['socketListeners', 'app', 'userList', '_$context'],
      moderator: true,
      settings: 'moderation',
      displayName: "Show Idle Time",
      help: 'This module shows how long users have been inactive in the User- and Waitlist-Panel.\n"Being active"',
      lastActivity: {},
      _settings: {
        highlightOver: 43 .min
      },
      setup: function(arg$, arg1$, arg2$, m_){
        var addListener, $create, settings, start, i$, ref$, len$, user, ref1$, key$, lastActivity, $waitlistBtn, $afkCount, chatHidden, lastAfkCount, d, noActivityYet, fn, Constr;
        addListener = arg$.addListener, $create = arg$.$create;
        settings = this._settings;
        this.start = start = Date.now();
        if (m_) {
          this.lastActivity = m_.lastActivity || {};
        }
        for (i$ = 0, len$ = (ref$ = API.getUsers()).length; i$ < len$; ++i$) {
          user = ref$[i$];
          (ref1$ = this.lastActivity)[key$ = user.id] || (ref1$[key$] = start);
        }
        lastActivity = this.lastActivity;
        $waitlistBtn = $('#waitlist-button').append($afkCount = $create('<div class=p0ne-toolbar-count>'));
        addListener(API, 'socket:skip socket:grab', function(id){
          return updateUser(id);
        });
        addListener(API, 'userJoin socket:nameChanged', function(u){
          return updateUser(u.id);
        });
        addListener(API, 'chat', function(u){
          return updateUser(u.uid);
        });
        addListener(API, 'socket:gifted', function(e){
          return updateUser(e.s);
        });
        addListener(API, 'socket:modAddDJ socket:modBan socket:modMoveDJ socket:modRemoveDJ socket:modSkip socket:modStaff', function(u){
          return updateUser(u.mi);
        });
        addListener(API, 'userLeave', function(u){
          var key$, ref$;
          return ref$ = lastActivity[key$ = u.id], delete lastActivity[key$], ref$;
        });
        chatHidden = $cm().parent().css('display') === 'none';
        if ((typeof _$context != 'undefined' && _$context !== null) && (app != null || (typeof userList != 'undefined' && userList !== null))) {
          addListener(_$context, 'show:users show:waitlist', function(){
            return chatHidden = true;
          });
          addListener(_$context, 'show:chat', function(){
            return chatHidden = false;
          });
        }
        lastAfkCount = 0;
        this.timer = repeat(60000, function(){
          var afkCount, d, usersToCheck, that, i$, len$, u;
          if (chatHidden) {
            return forceRerender();
          } else {
            afkCount = 0;
            d = Date.now();
            usersToCheck = API.getWaitList();
            if (that = API.getDJ()) {
              usersToCheck[usersToCheck.length] = that;
            }
            for (i$ = 0, len$ = usersToCheck.length; i$ < len$; ++i$) {
              u = usersToCheck[i$];
              if (d - lastActivity[u.id] > settings.highlightOver) {
                afkCount++;
              }
            }
            if (afkCount !== lastAfkCount) {
              if (afkCount) {
                $afkCount.text(afkCount);
              } else {
                $afkCount.clear();
              }
              return lastAfkCount = afkCount;
            }
          }
        });
        d = 0;
        for (i$ = 0, len$ = (ref$ = [RoomUserRow, WaitlistRow]).length; i$ < len$; ++i$) {
          fn = i$;
          Constr = ref$[i$];
          replace(Constr.prototype, 'render', fn$);
        }
        function updateUser(uid){
          var i$, ref$, ref1$, len$, r, results$ = [];
          lastActivity[uid] = Date.now();
          for (i$ = 0, len$ = (ref$ = (typeof userList != 'undefined' && userList !== null ? (ref1$ = userList.listView) != null ? ref1$.rows : void 8 : void 8) || (app != null ? app.room.waitlist.rows : void 8)).length; i$ < len$; ++i$) {
            r = ref$[i$];
            if (r.model.id === uid) {
              results$.push(r.render(true));
            }
          }
          return results$;
        }
        function forceRerender(){
          var i$, ref$, ref1$, len$, r, results$ = [];
          for (i$ = 0, len$ = (ref$ = (app != null ? app.room.waitlist.rows : void 8) || (typeof userList != 'undefined' && userList !== null ? (ref1$ = userList.listView) != null ? ref1$.rows : void 8 : void 8) || []).length; i$ < len$; ++i$) {
            r = ref$[i$];
            results$.push(r.render(false));
          }
          return results$;
        }
        return forceRerender();
        function fn$(r_){
          return function(isUpdate){
            var ago, time, noActivityYet, $span;
            r_.apply(this, arguments);
            if (!d) {
              d = Date.now();
              requestAnimationFrame(function(){
                d = 0;
                return noActivityYet = null;
              });
            }
            ago = d - lastActivity[this.model.id];
            if (lastActivity[this.model.id] <= start) {
              time = noActivityYet || (noActivityYet = ">" + humanTime(ago, true));
            } else if (ago < 60000) {
              time = "<1m";
            } else if (ago < 120000) {
              time = "<2m";
            } else {
              time = humanTime(ago, true);
            }
            $span = $('<span class=p0ne-last-activity>').text(time);
            if (ago > settings.highlightOver) {
              $span.addClass('p0ne-last-activity-warn');
            }
            if (isUpdate) {
              $span.addClass('p0ne-last-activity-update');
            }
            this.$el.append($span);
            if (isUpdate) {
              return requestAnimationFrame(function(){
                return $span.removeClass('p0ne-last-activity-update');
              });
            }
          };
        }
      },
      disable: function(){
        clearInterval(this.timer);
        return $('#waitlist-button').removeClass('p0ne-toolbar-highlight');
      },
      disableLate: function(){
        var i$, ref$, ref1$, len$, r, results$ = [];
        for (i$ = 0, len$ = (ref$ = (app != null ? app.room.waitlist.rows : void 8) || (typeof userList != 'undefined' && userList !== null ? (ref1$ = userList.listView) != null ? ref1$.rows : void 8 : void 8) || []).length; i$ < len$; ++i$) {
          r = ref$[i$];
          results$.push(r.render());
        }
        return results$;
      }
    });
    /*@source p0ne.userHistory.ls */
    /**
     * small module to show a user's song history on plug.dj
     * fetches the song history from the user's /@/profile page
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
    */
    /*####################################
    #            USER HISTORY            #
    ####################################*/
    module('userHistory', {
      require: ['userRollover', 'RoomHistory', 'backbone'],
      help: 'Shows another user\'s song history when clicking on their username in the user-rollover.\n\nDue to technical restrictions, only Youtube songs can be shown.',
      setup: function(arg$){
        var addListener, replace, css;
        addListener = arg$.addListener, replace = arg$.replace, css = arg$.css;
        css('userHistory', '#user-rollover .username { cursor: pointer }');
        addListener($('body'), 'click', '#user-rollover .username', function(){
          var user, userID, username, userlevel, userslug;
          $('#history-button.selected').click();
          user = userRollover.user;
          userID = user.id;
          username = user.get('username');
          userlevel = user.get('level');
          userslug = user.get('slug');
          if (userlevel < 5) {
            userRollover.$level.text(userlevel + " (user-history requires >4!)");
            return;
          }
          console.log(getTime() + " [userHistory] loading " + username + "'s history");
          if (!userslug) {
            return getUserData(userID).then(function(d){
              user.set('slug', d.slug);
              return loadUserHistory(user);
            });
          } else {
            return loadUserHistory(user);
          }
        });
        function loadUserHistory(user){
          return $.get("https://plug.dj/@/" + user.get('slug')).fail(function(){
            return console.error("! couldn't load user's history");
          }).then(function(d){
            var songs;
            userRollover.cleanup();
            songs = new backbone.Collection();
            d.replace(/<div class="row">\s*<img src="(.*)"\/>\s*<div class="meta">\s*<span class="author">(.*?)<\/span>\s*<span class="name">(.*?)<\/span>[\s\S]*?positive"><\/i><span>(\d+)<\/span>[\s\S]*?grabs"><\/i><span>(\d+)<\/span>[\s\S]*?negative"><\/i><span>(\d+)<\/span>[\s\S]*?listeners"><\/i><span>(\d+)<\/span>/g, function(arg$, img, author, roomName, positive, grabs, negative, listeners){
              var cid, ref$, title;
              if (cid = /\/vi\/(.{11})\//.exec(img)) {
                cid = cid[1];
                ref$ = author.split(" - "), title = ref$[0], author = ref$[1];
                return songs.add(new backbone.Model({
                  user: {
                    id: user.id,
                    username: "in " + roomName
                  },
                  room: {
                    name: roomName
                  },
                  score: {
                    positive: positive,
                    grabs: grabs,
                    negative: negative,
                    listeners: listeners,
                    skipped: 0
                  },
                  media: new backbone.Model({
                    format: 1,
                    cid: cid,
                    author: author,
                    title: title,
                    image: httpsify(img)
                  })
                }));
              }
            });
            console.info(getTime() + " [userHistory] loaded history for " + user.get('username'), songs);
            out$.songs = songs;
            out$.d = d;
            replace(RoomHistory.prototype, 'collection', function(){
              return songs;
            });
            _$context.trigger('show:history');
            return requestAnimationFrame(function(){
              RoomHistory.prototype.collection = RoomHistory.prototype.collection_;
              return console.log(getTime() + " [userHistory] restoring room's proper history");
            });
          });
        }
        return loadUserHistory;
      }
    });
    /*@source p0ne.dev.ls */
    /**
     * plug_p0ne dev
     * a set of plug_p0ne modules for usage in the console
     * They are not used by any other module
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #        FIX CONSOLE SPAMMING        #
    ####################################*/
    module('fixConsoleSpamming', {
      setup: function(arg$){
        /* this fixes a bug in plug.dj. Version 1.2.6.6390 (2015-02-15)
         * which spams the console with console.info(undefined)
         * everytime the socket receives a message.
         * On WebKit browsers it's ignored, on others (e.g. Firefox)
         * it will create many empty messages in the console
         * (https://i.imgur.com/VBzw2ek.png screenshot from Firefox' Web Console)
        */
        var replace;
        replace = arg$.replace;
        return replace(console, 'info', function(info_){
          return function(){
            if (arguments.length) {
              return info_.apply(this, arguments);
            }
          };
        });
      }
    });
    /*####################################
    #      SANDBOX BACKBONE EVENTS       #
    ####################################*/
    module('sandboxBackboneEvents', {
      optional: ['_$context'],
      setup: function(arg$){
        var replace, slice;
        replace = arg$.replace;
        slice = Array.prototype.slice;
        replace(Backbone.Events, 'trigger', function(){
          return function(type){
            var args, a, b, c, events, l, i, ev, e;
            if (this._events) {
              args = slice.call(arguments, 1);
              a = args[0], b = args[1], c = args[2];
              for (;;) {
                if ((events = this._events[type]) && (l = events.length)) {
                  i = -1;
                  while (i < l) {
                    try {
                      switch (args.length) {
                      case 0:
                        while (++i < l) {
                          (ev = events[i]).callback.call(ev.ctx);
                        }
                        break;
                      case 1:
                        while (++i < l) {
                          (ev = events[i]).callback.call(ev.ctx, a);
                        }
                        break;
                      case 2:
                        while (++i < l) {
                          (ev = events[i]).callback.call(ev.ctx, a, b);
                        }
                        break;
                      case 3:
                        while (++i < l) {
                          (ev = events[i]).callback.call(ev.ctx, a, b, c);
                        }
                        break;
                      default:
                        while (++i < l) {
                          (ev = events[i]).callback.apply(ev.ctx, args);
                        }
                      }
                    } catch (e$) {
                      e = e$;
                      console.error("[" + (this._name || 'unnamed EventEmitter') + "] Error while triggering '" + type + "' [" + i + "]", this, args, e.stack);
                    }
                  }
                }
                if (type === 'all') {
                  return this;
                }
                args.unshift(type);
                a = args[0], b = args[1], c = args[2];
                type = 'all';
              }
            }
          };
        });
        replace(API, '_name', function(){
          return 'API';
        });
        replace(API, 'trigger', function(){
          return Backbone.Events.trigger;
        });
        if (typeof _$context != 'undefined' && _$context !== null) {
          replace(_$context, '_name', function(){
            return '_$context';
          });
          return replace(_$context, 'trigger', function(){
            return Backbone.Events.trigger;
          });
        }
      }
    });
    /*####################################
    #           LOG EVERYTHING           #
    ####################################*/
    module('logEventsToConsole', {
      optional: ['_$context', 'socketListeners'],
      displayName: "Log Events to Console",
      settings: 'dev',
      help: 'This will log events to the JavaScript console.\nThis is mainly for programmers. If you are none, keep this disabled for better performance.\n\nBy default this will leave out some events to avoid completly spamming the console.\nYou can force-enable logging ALL events by running `logEventsToConsole.logAll = true`',
      disabledByDefault: true,
      logAll: false,
      setup: function(arg$){
        var addListener, logEventsToConsole, ctx, chatEvnt;
        addListener = arg$.addListener;
        logEventsToConsole = this;
        if (typeof _$context != 'undefined' && _$context !== null) {
          ctx = _$context;
          chatEvnt = 'chat:receive';
        } else {
          ctx = API;
          chatEvnt = 'chat';
        }
        addListener('early', ctx, chatEvnt, function(data){
          var message, name;
          message = cleanMessage(data.message);
          if (data.un) {
            name = collapseWhitespace(
            data.un.replace(/\u202e/g, '\\u202e'));
            name = stripHTML(
            repeatString$(" ", 24 - name.length) + name);
            if (data.type === 'emote') {
              return console.log(getTime() + " [CHAT] %c" + name + ": %c" + message, "font-weight: bold", "font-style: italic");
            } else {
              return console.log(getTime() + " [CHAT] %c" + name + ": %c" + message, "font-weight: bold", "");
            }
          } else if (data.type.has('system')) {
            return console.info(getTime() + " [CHAT] [system] %c" + message, "font-size: 1.2em; color: red; font-weight: bold");
          } else {
            return console.log(getTime() + " [CHAT] %c" + message, 'color: #36F');
          }
        });
        addListener(API, 'userJoin', function(user){
          return console.log(getTime() + " + [JOIN]", user.id, formatUser(user, true), user);
        });
        addListener(API, 'userLeave', function(user){
          var name;
          name = htmlUnescape(user.username).replace(/\u202e/g, '\\u202e');
          return console.log(getTime() + " - [LEAVE]", user.id, formatUser(user, true), user);
        });
        if (!window._$context) {
          return;
        }
        addListener(_$context, 'all', function(){
          return function(type, args){
            var group;
            group = type.substr(0, type.indexOf(":"));
            if ((group !== 'socket' && group !== 'tooltip' && group !== 'djButton' && group !== 'chat' && group !== 'sio' && group !== 'playback' && group !== 'playlist' && group !== 'notify' && group !== 'drag' && group !== 'audience' && group !== 'anim' && group !== 'HistorySyncEvent' && group !== 'user' && group !== 'ShowUserRolloverEvent') && (type !== 'ChatFacadeEvent:muteUpdate' && type !== 'PlayMediaEvent:play' && type !== 'userPlaying:update' && type !== 'context:update') || logEventsToConsole.logAll) {
              return console.log(getTime() + " [" + type + "]", args);
            } else if (group === 'socket' && (type !== 'socket:chat' && type !== 'socket:vote' && type !== 'socket:grab' && type !== 'socket:earn')) {
              return console.log(getTime() + " [" + type + "]", args);
            }
          };
        });
        return addListener(_$context, 'PlayMediaEvent:play', function(data){
          return console.log(getTime() + " [SongInfo]", "playlist: " + data.playlistID, "historyID: " + data.historyID);
        });
      }
    });
    /*####################################
    #            LOG GRABBERS            #
    ####################################*/
    module('logGrabbers', {
      require: ['votes'],
      setup: function(arg$){
        var addListener, replace, grabbers;
        addListener = arg$.addListener, replace = arg$.replace;
        grabbers = {};
        replace(votes, 'grab', function(g_){
          return function(uid){
            var u;
            u = getUser(uid);
            console.info(getTime() + " [logGrabbers] " + formatUser(u, user.isStaff) + " grabbed this song");
            grabbers[uid] = u.un;
            return g_.call(this, uid);
          };
        });
        return addListener(API, 'advance', function(){
          var name;
          console.log("[logGrabbers] the last song was grabbed by " + humanList((function(){
            var i$, ref$, results$ = [];
            for (i$ in ref$ = grabbers) {
              name = ref$[i$];
              results$.push(name);
            }
            return results$;
          }())));
          return grabbers = {};
        });
      }
    });
    /*####################################
    #             DEV TOOLS              #
    ####################################*/
    module('InternalAPI', {
      optional: ['users', 'playlists', 'user_', 'app'],
      setup: function(){
        var k, ref$, v;
        for (k in ref$ = API) {
          v = ref$[k];
          if (!this[k]) {
            this[k] = v;
          } else if (this[k] === 'user') {
            (fn$.call(this, k, v));
          }
        }
        return importAll$(this, Backbone.Events);
        function fn$(k, v){
          this[k] = function(){
            var ref$;
            return getUserInternal((ref$ = API[k]()) != null ? ref$.id : void 8);
          };
        }
      },
      chatLog: API.chatLog,
      getAdmins: function(){
        return typeof users != 'undefined' && users !== null ? users.filter(function(it){
          return it.get('gRole') === 5;
        }) : void 8;
      },
      getAmbassadors: function(){
        return typeof users != 'undefined' && users !== null ? users.filter(function(u){
          var ref$;
          return 0 < (ref$ = u.get('gRole')) && ref$ < 5;
        }) : void 8;
      },
      getAudience: typeof users != 'undefined' && users !== null ? users.getAudience : void 8,
      getBannedUsers: function(){
        throw Error('unimplemented');
      },
      getDJ: function(){
        var ref$;
        return getUserInternal((ref$ = API.getDJ()) != null ? ref$.id : void 8);
      },
      getHistory: function(){
        return roomHistory;
      },
      getHost: function(){
        var ref$;
        return getUserInternal((ref$ = API.getHost()) != null ? ref$.id : void 8);
      },
      getMedia: function(){
        return typeof currentMedia != 'undefined' && currentMedia !== null ? currentMedia.get('media') : void 8;
      },
      getNextMedia: function(){
        return typeof playlists != 'undefined' && playlists !== null ? playlists.activeMedia[0] : void 8;
      },
      getUser: function(){
        return user_;
      },
      getUsers: function(){
        return users;
      },
      getPlaylist: window.getActivePlaylist,
      getPlaylists: function(){
        return playlists;
      },
      getStaff: function(){
        return typeof users != 'undefined' && users !== null ? users.filter(function(u){
          return u.get('role');
        }) : void 8;
      },
      getWaitList: function(){
        return app != null ? app.room.waitlist : void 8;
      }
    });
    /*####################################
    #           DOWNLOAD LINK            #
    ####################################*/
    module('downloadLink', {
      setup: function(arg$){
        var css, icon;
        css = arg$.css;
        icon = getIcon('icon-arrow-down');
        return css('downloadLink', ".p0ne-downloadlink::before {content: ' ';position: absolute;margin-top: -6px;margin-left: -27px;width: 30px;height: 30px;background-position: " + icon.position + ";background-image: " + icon.image + ";}");
      },
      module: function(name, filename, dataOrURL){
        if (!dataOrURL) {
          dataOrURL = filename;
          filename = name;
        }
        if (dataOrURL && !isURL(dataOrURL)) {
          if (typeof dataOrURL !== 'string') {
            dataOrURL = JSON.stringify(dataOrURL);
          }
          dataOrURL = URL.createObjectURL(new Blob([dataOrURL], {
            type: 'text/plain'
          }));
        }
        filename = filename.replace(/[\/\\\?%\*\:\|\"\<\>\.]/g, '');
        return appendChat("<div class='message p0ne-downloadlink'><i class='icon'></i><span class='text'><a href='" + dataOrURL + "' download='" + filename + "'>" + name + "</a></span></div>");
      }
    });
    /*####################################
    #            AUXILIARIES             #
    ####################################*/
    importAll$(window, {
      roomState: function(){
        ajax('GET', 'rooms/state');
      },
      export_: function(name){
        return function(data){
          console.log("[export] " + name + " =", data);
          window[name] = data;
        };
      },
      searchEvents: function(regx){
        var k;
        if (!(regx instanceof RegExp)) {
          regx = new RegExp(regx, 'i');
        }
        return (function(){
          var results$ = [];
          for (k in typeof _$context != 'undefined' && _$context !== null ? _$context._events : void 8) {
            if (regx.test(k)) {
              results$.push(k);
            }
          }
          return results$;
        }());
      },
      listUsers: function(){
        var res, i$, ref$, len$, u;
        res = "";
        for (i$ = 0, len$ = (ref$ = API.getUsers()).length; i$ < len$; ++i$) {
          u = ref$[i$];
          res += u.id + "\t" + u.username + "\n";
        }
        return console.log(res);
      },
      listUsersByAge: function(){
        var a, i$, len$, u, results$ = [];
        a = API.getUsers().sort(function(a, b){
          a = +a.joined.replace(/\D/g, '');
          b = +b.joined.replace(/\D/g, '');
          return (a > b && 1) || (a === b && 0) || -1;
        });
        for (i$ = 0, len$ = a.length; i$ < len$; ++i$) {
          u = a[i$];
          results$.push(console.log(u.joined.replace(/T|\..+/g, ' '), u.username));
        }
        return results$;
      },
      joinRoom: function(slug){
        return ajax('POST', 'rooms/join', {
          slug: slug
        });
      },
      findModule: function(test){
        var res, id, ref$, module;
        if (typeof test === 'string' && window.l) {
          test = l(test);
        }
        res = [];
        for (id in ref$ = require.s.contexts._.defined) {
          module = ref$[id];
          if (module) {
            if (test(module, id)) {
              module.requireID || (module.requireID = id);
              console.log("[findModule]", id, module);
              res[res.length] = module;
            }
          }
        }
        return res;
      },
      requireHelperHelper: function(module){
        var k, v, keys, keysExact, isNotObj, ref$, id, m2, ref1$, ref2$;
        if (typeof module === 'string') {
          module = require(module);
        }
        if (!module) {
          return false;
        }
        for (k in module) {
          v = module[k];
          keys = 0;
          keysExact = 0;
          isNotObj = (ref$ = typeof v) !== 'object' && ref$ !== 'function';
          for (id in ref$ = require.s.contexts._.defined) {
            m2 = ref$[id];
            if (m2 && m2[k] && (k !== 'requireID' && k !== 'cid' && k !== 'id')) {
              keys++;
              if (isNotObj && m2[k] === v) {
                keysExact++;
              }
            }
          }
          if (keys === 1) {
            return "(." + k + ")";
          } else if (keysExact === 1) {
            return "(." + k + " == " + JSON.stringify(v) + ")";
          }
        }
        for (k in ref$ = module.prototype) {
          v = ref$[k];
          keys = 0;
          keysExact = 0;
          isNotObj = typeof v !== 'object';
          for (id in ref1$ = require.s.contexts._.defined) {
            m2 = ref1$[id];
            if (m2 && ((ref2$ = m2.prototype) != null && ref2$[k])) {
              keys++;
              if (isNotObj && m2[k] === v) {
                keysExact++;
              }
            }
          }
          if (keys === 1) {
            return "(.::?." + k + ")";
          } else if (keysExact === 1) {
            return "(.::?." + k + " == " + JSON.stringify(v) + ")";
          }
        }
        return false;
      },
      validateUsername: function(username, ignoreWarnings, cb){
        if (typeof ignoreWarnings === 'function') {
          cb = ignoreWarnings;
          ignoreWarnings = false;
        } else if (!cb) {
          cb = function(slug, err){
            return console[err && 'error' || 'log']("username '" + username + "': ", err || slug);
          };
        }
        if (!ignoreWarnings) {
          if (username.length < 2) {
            cb(false, "too short");
          } else if (username.length >= 25) {
            cb(false, "too long");
          } else if (username.has("/")) {
            cb(false, "forward slashes are not allowed");
          } else if (username.has("\n")) {
            cb(false, "line breaks are not allowed");
          } else {
            ignoreWarnings = true;
          }
        }
        if (ignoreWarnings) {
          return $.getJSON("https://plug.dj/_/users/validate/" + encodeURIComponent(username), function(d){
            var ref$;
            return cb(d && ((ref$ = d.data[0]) != null ? ref$.slug : void 8));
          });
        }
      },
      getRequireArg: function(haystack, needle){
        var ref$, a, b, that;
        ref$ = haystack.split("], function("), a = ref$[0], b = ref$[1];
        a = a.substr(a.indexOf('"')).split('", "');
        b = b.substr(0, b.indexOf(')')).split(', ');
        if (that = b[a.indexOf(needle)]) {
          try {
            window[that] = require(needle);
          } catch (e$) {}
          return that;
        } else if (that = a[b.indexOf(needle)]) {
          try {
            window[needle] = require(that);
          } catch (e$) {}
          return that;
        }
      },
      logOnce: function(base, event){
        if (!event) {
          event = base;
          if (-1 !== event.indexOf(':')) {
            base = _$context;
          } else {
            base = API;
          }
        }
        return base.once('event', logger(event));
      },
      usernameToSlug: function(un){
        /* note: this is NOT really accurate! */
        var lastCharWasLetter, res, i$, ref$, len$, c, lc;
        lastCharWasLetter = false;
        res = "";
        for (i$ = 0, len$ = (ref$ = htmlEscape(un)).length; i$ < len$; ++i$) {
          c = ref$[i$];
          if ((lc = c.toLowerCase()) !== c.toUpperCase()) {
            if (/\w/.test(lc)) {
              res += c.toLowerCase();
            } else {
              res += "\\u" + pad(lc.charCodeAt(0), 4);
            }
            lastCharWasLetter = true;
          } else if (lastCharWasLetter) {
            res += "-";
            lastCharWasLetter = false;
          }
        }
        if (!lastCharWasLetter) {
          res = res.substr(0, res.length - 1);
        }
        return res;
      },
      reconnectSocket: function(){
        return _$context.trigger('force:reconnect');
      },
      ghost: function(){
        return $.get('/');
      },
      getAvatars: function(){
        API.once('p0ne:avatarsloaded', logger('AVATARS'));
        return $.get($("script[src^='https://cdn.plug.dj/_/static/js/avatars.']").attr('src')).then(function(d){
          var that;
          if (that = d.match(/manifest.*/)) {
            return API.trigger('p0ne:avatarsloaded', JSON.parse(that[0].substr(11, that[0].length - 12)));
          }
        });
      },
      parseYTGetVideoInfo: function(d, onlyStripHTML){
        var k, v, ref$, res, i$, len$, a, ref1$;
        if (typeof d === 'object') {
          for (k in d) {
            v = d[k];
            d[k] = parseYTGetVideoInfo(v);
          }
          return d;
        } else if (typeof d !== 'string' || d.startsWith("http")) {
          return d;
        } else if (d.startsWith("<!DOCTYPE html>")) {
          d = JSON.parse(((ref$ = d.match(/ytplayer\.config = (\{[\s\S]*?\});/)) != null ? ref$[1] : void 8) || null);
          if (onlyStripHTML) {
            return d;
          } else {
            return parseYTGetVideoInfo(d);
          }
        } else if (d.has(",")) {
          return d.split(",").map(parseYTGetVideoInfo);
        } else if (d.has("&")) {
          res = {};
          for (i$ = 0, len$ = (ref$ = d.split("&")).length; i$ < len$; ++i$) {
            a = ref$[i$];
            a = a.split("=");
            if (res[a[0]]) {
              if (!$.isArray(res[a[0]])) {
                res[a[0]] = [res[a[0]]];
              }
              (ref1$ = res[a[0]])[ref1$.length] = parseYTGetVideoInfo(unescape(a[1]));
            } else {
              res[a[0]] = parseYTGetVideoInfo(unescape(a[1]));
            }
          }
          return res;
        } else if (!isNaN(d)) {
          return +d;
        } else if (d === 'True' || d === 'False') {
          return d === 'True';
        } else {
          return d;
        }
      }
    });
    if (!window.chrome) {
      $.getScript("https://cdn.p0ne.com/script/zclip/jquery.zclip.min.js").then(function(){
        window.copy = function(str, title){
          return appendChat($("<button class='cm p0ne-notif'> copy " + (title || '') + "</button>")).zclip({
            path: "https://cdn.p0ne.com/script/zclip/ZeroClipboard.swf",
            copy: str
          });
        };
        return console.info("[copy polyfill] loaded polyfill for copy() with zclip");
      }).fail(function(){
        return console.warn("[copy polyfill] failed to load zclip!");
      });
    }
    /*####################################
    #            RENAME USER             #
    ####################################*/
    module('renameUser', {
      require: ['users'],
      module: function(idOrName, newName){
        var u, i$, ref$, len$, user, id, rup;
        u = users.get(idOrName);
        if (!u) {
          idOrName = idOrName.toLowerCase();
          for (i$ = 0, len$ = (ref$ = users.models).length; i$ < len$; ++i$) {
            user = ref$[i$];
            if (user.attributes.username.toLowerCase() === idOrName) {
              u = user;
              break;
            }
          }
        }
        if (!u) {
          return console.error("[rename user] can't find user with ID or name '" + idOrName + "'");
        }
        u.set('username', newName);
        id = u.id;
        if (!(rup = window.p0ne.renameUserPlugin)) {
          rup = window.p0ne.renameUserPlugin = function(d){
            d.un = rup[d.fid] || d.un;
          };
          if ((ref$ = window.p0ne.chatPlugins) != null) {
            ref$[ref$.length] = rup;
          }
        }
        return rup[id] = newName;
      }
    });
    (function(){
      window._$events = {
        _update: function(){
          var k, ref$, v, results$ = [];
          for (k in ref$ = typeof _$context != 'undefined' && _$context !== null ? _$context._events : void 8) {
            v = ref$[k];
            results$.push(this[k.replace(/:/g, '_')] = v);
          }
          return results$;
        }
      };
      return _$events._update();
    })();
    /*####################################
    #            EXPORT DATA             #
    ####################################*/
    module('export_', {
      require: ['downloadLink'],
      exportRCS: function(){
        var k, ref$, v, results$ = [];
        for (k in ref$ = localStorage) {
          v = ref$[k];
          results$.push(downloadLink("plugDjChat '" + k + "'", k.replace(/plugDjChat-(.*?)T(\d+):(\d+):(\d+)\.\d+Z/, "$1 $2.$3.$4.html"), v));
        }
        return results$;
      },
      exportPlaylists: function(){
        var i$, len$, results$ = [];
        for (i$ = 0, len$ = playlists.length; i$ < len$; ++i$) {
          results$.push((fn$.call(this, playlists[i$])));
        }
        return results$;
        function fn$(pl){
          return $.get("/_/playlists/" + pl.id + "/media").then(function(data){
            return downloadLink("playlist '" + pl.name + "'", pl.name + ".txt", data);
          });
        }
      }
    });
    /*####################################
    #              COPY CHAT             #
    ####################################*/
    window.copyChat = function(copy){
      var host, res;
      $('#chat-messages img').fixSize();
      host = p0ne.host;
      res = "<!DOCTYPE HTML>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n<title>plug.dj Chatlog " + getTime() + " - " + getRoomSlug() + " (" + API.getUser().rawun + ")</title>\n<!-- basic chat styling -->\n" + $("head link[href^='https://cdn.plug.dj/_/static/css/app']")[0].outerHTML + "\n<link href='https://dl.dropboxusercontent.com/u/4217628/css/fimplugChatlog.css' rel='stylesheet' type='text/css'>";
      res += getCustomCSS(true);
      /*
      res += """\n
          <!-- p0ne song notifications -->
          <link rel='stylesheet' href='#host/css/p0ne.notif.css' type='text/css'>
      """ if window.songNotifications
      
      res += """\n
          <!-- better ponymotes -->
          <link rel='stylesheet' href='#host/css/bpmotes.css' type='text/css'>
          <link rel='stylesheet' href='#host/css/emote-classes.css' type='text/css'>
          <link rel='stylesheet' href='#host/css/combiners-nsfw.css' type='text/css'>
          <link rel='stylesheet' href='#host/css/gif-animotes.css' type='text/css'>
          <link rel='stylesheet' href='#host/css/extracss-pure.css' type='text/css'>
      """ if window.bpm or $cm! .find \.bpm-emote .length
      
      res += """\n
          <style>
          #{css \yellowMod}
          </style>
      """ if window.yellowMod
      */
      res += "\n\n</head>\n<body id=\"chatlog\">\n" + $('.app-right').html().replace(/https:\/\/api\.plugCubed\.net\/proxy\//g, '').replace(/src="\/\//g, 'src="https://') + "\n</body>";
      return copy(res);
    };
    /*@source p0ne.ponify.ls */
    /**
     * ponify chat - a script to ponify some words in the chat on plug.dj
     * Text ponification based on http://pterocorn.blogspot.dk/2011/10/ponify.html
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #            PONIFY CHAT             #
    ####################################*/
    module('ponify', {
      optional: ['emoticons'],
      displayName: 'Ponify Chat',
      settings: 'pony',
      help: 'Ponify the chat! (replace words like "anyone" with "anypony")\nReplaced words will be underlined. Move your cursor over the word to see it\'s original.\n\nIt also replaces some of the emoticons with pony emoticons.',
      disabled: true
      /*== TEXT ==*/,
      map: {
        "anybody": "anypony",
        "anyone": "anypony",
        "ass": "flank",
        "asses": "flanks",
        "boner": "wingboner",
        "boy": "colt",
        "boyfriend": "coltfriend",
        "boyfriends": "coltfriends",
        "boys": "colts",
        "bro fist": "brohoof",
        "bro-fist": "brohoof",
        "butt": "flank",
        "butthurt": "saddle-sore",
        "butts": "flanks",
        "child": "foal",
        "children": "foals",
        "cowboy": "cowpony",
        "cowboys": "cowponies",
        "cowgirl": "cowpony",
        "cowgirls": "cowponies",
        "disappoint": "disappony",
        "disappointed": "disappony",
        "disappointment": "disapponyment",
        "doctor who": "doctor whooves",
        "dr who": "dr whooves",
        "dr. who": "dr. whooves",
        "everybody": "everypony",
        "everyone": "everypony",
        "fap": "clop",
        "faps": "clops",
        "foot": "hoof",
        "feet": "hooves",
        "folks": "foalks",
        "fool": "foal",
        "foolish": "foalish",
        "germany": "germaneigh",
        "gentleman": "gentlecolt",
        "gentlemen": "gentlecolts",
        "girl": "filly",
        "girls": "fillies",
        "girlfriend": "fillyfriend",
        "girlfriends": "fillyfriends",
        "halloween": "nightmare night",
        "hand": "hoof",
        "hands": "hooves",
        "handed": "hoofed",
        "handedly": "hoofedly",
        "handers": "hoofers",
        "handmade": "hoofmade",
        "hey": "hay",
        "high-five": "hoof-five",
        "highfive": "hoof-five",
        "ladies": "fillies",
        "main": "mane",
        "man": "stallion",
        "men": "stallions",
        "manhattan": "manehattan",
        "marathon": "mareathon",
        "miracle": "mareacle",
        "miracles": "mareacles",
        "money": "bits",
        "naysayer": "neighsayer",
        "no one else": "nopony else",
        "no-one else": "nopony else",
        "noone else": "nopony else",
        "nobody": "nopony",
        "nottingham": "trottingham",
        "null": "nullpony",
        "old-timer": "old-trotter",
        "people": "ponies",
        "person": "pony",
        "persons": "ponies",
        "philadelphia": "fillydelphia",
        "somebody": "somepony",
        "someone": "somepony",
        "stalingrad": "stalliongrad",
        "sure as hell": "sure as hay",
        "tattoo": "cutie mark",
        "tattoos": "cutie mark",
        "da heck": "da hay",
        "the heck": "the hay",
        "the hell": "the hay",
        "troll": "parasprite",
        "trolls": "parasprites",
        "trolled": "parasprited",
        "trolling": "paraspriting",
        "trollable": "paraspritable",
        "woman": "mare",
        "women": "mares",
        "confound those dover boys": "confound these ponies"
      },
      ponifyMsg: function(msg){
        var this$ = this;
        msg.message = msg.message.replace(this.regexp, function(_, prepre, pre, s, post, i){
          var w, r, lastUpperCaseLetters, l, ref$, ref1$, i$, o;
          w = this$.map[s.toLowerCase()];
          r = "";
          /*preserve upper/lower case*/
          lastUpperCaseLetters = 0;
          l = (ref$ = s.length) < (ref1$ = w.length) ? ref$ : ref1$;
          for (i$ = 0; i$ < l; ++i$) {
            o = i$;
            if (s[o].toLowerCase() !== s[o]) {
              r += w[o].toUpperCase();
              lastUpperCaseLetters++;
            } else {
              r += w[o];
              lastUpperCaseLetters = 0;
            }
          }
          if (w.length >= s.length && lastUpperCaseLetters >= 3) {
            r += w.substr(l).toUpperCase();
          } else {
            r += w.substr(l);
          }
          r = "<abbr class=ponified title='" + s + "'>" + r + "</abbr>";
          if (pre) {
            if ("aeioujyh".has(w[0])) {
              r = "an " + r;
            } else {
              r = "a " + r;
            }
          }
          if (post) {
            if ("szx".has(w[w.length - 1])) {
              r += "' ";
            } else {
              r += "'s ";
            }
          }
          console.log("replaced '" + s + "' with '" + r + "'", msg.cid);
          return prepre + r;
        });
      }
      /*== EMOTICONS ==*/
      /* images from bronyland.com (reuploaded to imgur to not spam the console with warnings, because bronyland.com doesn't support HTTPS) */,
      autoEmotiponies: {
        '8)': {
          name: 'rainbowdetermined2',
          url: "https://i.imgur.com/WFa3vKA.png"
        },
        ':(': {
          name: 'fluttershysad',
          url: "https://i.imgur.com/6L0bpWd.png"
        },
        ':)': {
          name: 'twilightsmile',
          url: "https://i.imgur.com/LDoxwfg.png"
        },
        ':?': {
          name: 'rainbowhuh',
          url: "https://i.imgur.com/te0Mnih.png"
        },
        ':B': {
          name: 'twistnerd',
          url: "https://i.imgur.com/57VFd38.png"
        },
        ':D': {
          name: 'pinkiehappy',
          url: "https://i.imgur.com/uFwZib6.png"
        },
        ':S': {
          name: 'unsuresweetie',
          url: "https://i.imgur.com/EATu0iu.png"
        },
        ':O': {
          name: 'pinkiegasp',
          url: "https://i.imgur.com/b9G2kaz.png"
        },
        ':X': {
          name: 'fluttershybad',
          url: "https://i.imgur.com/mnJHnsv.png"
        },
        ':|': {
          name: 'ajbemused',
          url: "https://i.imgur.com/8SLymiw.png"
        },
        ';)': {
          name: 'raritywink',
          url: "https://i.imgur.com/9fo7ZW3.png"
        },
        '<3': {
          name: 'heart',
          url: "https://i.imgur.com/aPBXLob.png"
        },
        'B)': {
          name: 'coolphoto',
          url: "https://i.imgur.com/QDgMyIZ.png"
        },
        'D:': {
          name: 'raritydespair',
          url: "https://i.imgur.com/og1FoWN.png"
        }
      },
      emotiponies: {
        aj: "https://i.imgur.com/nnYMw87.png",
        applebloom: "https://i.imgur.com/vAdPBJj.png",
        applejack: "https://i.imgur.com/nnYMw87.png",
        blush: "https://i.imgur.com/IpxwJ5c.png",
        cool: "https://i.imgur.com/WFa3vKA.png",
        cry: "https://i.imgur.com/fkYW4BG.png",
        derp: "https://i.imgur.com/Y00vqcH.png",
        derpy: "https://i.imgur.com/h6GdxHo.png",
        eek: "https://i.imgur.com/mnJHnsv.png",
        evil: "https://i.imgur.com/I8CNeRx.png",
        fluttershy: "https://i.imgur.com/6L0bpWd.png",
        fs: "https://i.imgur.com/6L0bpWd.png",
        idea: "https://i.imgur.com/aitjp1R.png",
        lol: "https://i.imgur.com/XVy41jX.png",
        loveme: "https://i.imgur.com/H81S9x0.png",
        mad: "https://i.imgur.com/taFXcWV.png",
        mrgreen: "https://i.imgur.com/IkInelN.png",
        oops: "https://i.imgur.com/IpxwJ5c.png",
        photofinish: "https://i.imgur.com/QDgMyIZ.png",
        pinkie: "https://i.imgur.com/tpQZaW4.png",
        pinkiepie: "https://i.imgur.com/tpQZaW4.png",
        rage: "https://i.imgur.com/H81S9x0.png",
        rainbowdash: "https://i.imgur.com/xglySrD.png",
        rarity: "https://i.imgur.com/9fo7ZW3.png",
        razz: "https://i.imgur.com/f8SgNBw.png",
        rd: "https://i.imgur.com/xglySrD.png",
        roll: "https://i.imgur.com/JogpKQo.png",
        sad: "https://i.imgur.com/6L0bpWd.png",
        scootaloo: "https://i.imgur.com/9zVXkyg.png",
        shock: "https://i.imgur.com/b9G2kaz.png",
        sweetie: "https://i.imgur.com/EATu0iu.png",
        sweetiebelle: "https://i.imgur.com/EATu0iu.png",
        trixie: "https://i.imgur.com/2QEmT8y.png",
        trixie2: "https://i.imgur.com/HWW2D6b.png",
        trixieleft: "https://i.imgur.com/HWW2D6b.png",
        twi: "https://i.imgur.com/LDoxwfg.png",
        twilight: "https://i.imgur.com/LDoxwfg.png",
        twist: "https://i.imgur.com/57VFd38.png",
        twisted: "https://i.imgur.com/I8CNeRx.png",
        wink: "https://i.imgur.com/9fo7ZW3.png"
      },
      setup: function(arg$){
        var addListener, replace, css, aEM, emote, ref$, ref1$, name, url, m, ponyCSS, reversedMap, this$ = this;
        addListener = arg$.addListener, replace = arg$.replace, css = arg$.css;
        this.regexp = RegExp('((?:^|<.+?>.+?</.+?>).*?)(\\b|an?\\s+)(' + Object.keys(this.map).join('|').replace(/\s+/g, '\\s*') + ')(\'s?)?\\b', 'gi');
        addListener(_$context, 'chat:plugin', function(msg){
          return this$.ponifyMsg(msg);
        });
        if (typeof emoticons != 'undefined' && emoticons !== null) {
          aEM = importAll$({}, emoticons.autoEmoteMap);
          for (emote in ref$ = this.autoEmotiponies) {
            ref1$ = ref$[emote], name = ref1$.name, url = ref1$.url;
            aEM[emote] = name;
            this.emotiponies[name] = url;
          }
          replace(emoticons, 'autoEmoteMap', function(){
            return aEM;
          });
          m = clone$(emoticons.map);
          ponyCSS = ".ponimoticon { width: 27px; height: 27px }\n.chat-suggestion-item .ponimoticon { margin-left: -5px }\n.emoji-glow { width: auto; height: auto }\n.emoji { position: static; display: inline-block }\n";
          reversedMap = {};
          for (emote in ref$ = this.emotiponies) {
            url = ref$[emote];
            if (reversedMap[url]) {
              m[emote] = reversedMap[url] + " ponimoticon";
            } else {
              reversedMap[url] = emote;
              m[emote] = emote + " ponimoticon";
            }
            ponyCSS += ".emoji-" + emote + " { background: url(" + url + ") }\n";
          }
          css('ponify', ponyCSS);
          replace(emoticons, 'map', function(){
            return m;
          });
          return typeof emoticons.update === 'function' ? emoticons.update() : void 8;
        }
      },
      disable: function(){
        return typeof emoticons.update === 'function' ? emoticons.update() : void 8;
      }
    });
    /*@source p0ne.fimplug.ls */
    /**
     * fimplug related modules
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*not really implemented yet*/
    /*
    module \songNotifRuleskip, do
        require: <[ songNotif ]>
        setup: ({replace, addListener}) ->
            replace songNotif, \skip, -> return ($notif) ->
                songNotif.showDescription $notif, """
                    <span class="ruleskip-btn ruleskip-1" data-rule=1>!ruleskip 1 MLP-related only</span>
                    <span class="ruleskip-btn" data-rule=2>!ruleskip 2 Loops / Pictures</span>
                    <span class="ruleskip-btn" data-rule=3>!ruleskip 3 low-efford mixes</span>
                    <span class="ruleskip-btn" data-rule=4>!ruleskip 4 history</span>
                    <span class="ruleskip-btn" data-rule=6>!ruleskip 6 &gt;10min</span>
                    <span class="ruleskip-btn" data-rule=13>!ruleskip 13 clop/porn/gote</span>
                    <span class="ruleskip-btn" data-rule=14>!ruleskip 14 episode / not music</span>
                    <span class="ruleskip-btn" data-rule=23>!ruleskip 23 WD-only</span>
                """
            addListener chatDomEvents, \click, \.ruleskip-btn, (btn) ->
                songNotif.hideDescription!
                if num = $ btn .data \rule
                    API.sendChat "!ruleskip #num"
    */
    /*####################################
    #              FIMSTATS              #
    ####################################*/
    module('fimstats', {
      settings: 'pony',
      optional: ['_$context'],
      disabled: true,
      setup: function(arg$, lookup){
        var addListener, $create, $el;
        addListener = arg$.addListener, $create = arg$.$create;
        css('fimstats', '.p0ne-last-played {position: absolute;right: 140px;top: 30px;font-size: .9em;color: #ddd;transition: opacity .2s ease-out;}#volume:hover ~ .p0ne-last-played {opacity: 0;}#dialog-preview .p0ne-last-played {right: 0;top: 23px;left: 0;}/*@media (min-width: 0px) {*/.p0ne-fimstats-last { display: none; }.p0ne-fimstats-first { display: none; }.p0ne-fimstats-plays::before { content: " ("; }.p0ne-fimstats-plays::after { content: "x) "; }.p0ne-fimstats-first-notyet::before { content: "first play!"; }.p0ne-fimstats-once::before { content: "once "; }/*}*/@media (min-width: 1600px) {.p0ne-fimstats-last { display: inline; }.p0ne-fimstats-first { display: inline; }.p0ne-fimstats-plays::before { content: " …("; }.p0ne-fimstats-plays::after { content: "x)… "; }.p0ne-fimstats-first-notyet::before { content: "first played just now!"; }.p0ne-fimstats-once::before { content: "once played by "; }}@media (min-width: 1700px) {.p0ne-fimstats-last::before { content: "last: "; }.p0ne-fimstats-plays::before { content: " - (played "; }.p0ne-fimstats-plays::after { content: "x)"; }.p0ne-fimstats-first::before { content: " - first: "; }}@media (min-width: 1800px) {.p0ne-fimstats-last::before { content: "last played by "; }.p0ne-fimstats-plays::before { content: " \xa0 - (played "; }.p0ne-fimstats-plays::after { content: "x)"; }.p0ne-fimstats-first::before { content: " - \xa0 first played by "; }}');
        $el = $create('<span class=p0ne-last-played>').appendTo('#now-playing-bar');
        addListener(API, 'advance', this.updateStats = function(d){
          d || (d = {
            media: API.getMedia()
          });
          if (d.media) {
            return lookup(d.media).then(function(d){
              return $el.html(d.html).prop('title', d.text);
            }).fail(function(err){
              return $el.html(err.html).prop('title', err.text);
            });
          } else {
            return $el.html("");
          }
        });
        if (typeof _$context != 'undefined' && _$context !== null) {
          addListener(_$context, 'ShowDialogEvent:show', function(d){
            var ref$;
            if ((ref$ = d.dialog.options) != null && ref$.media) {
              console.log("[fimstats]", d.media);
              return lookup(d.dialog.options.media.toJSON()).then(function(d){
                console.log("[fimstats] ->", d.media, d, $('#dialog-preview .message'));
                return $('#dialog-preview .message').after($('<div class=p0ne-last-played>').html(d.html));
              });
            }
          });
        }
        return this.updateStats();
      },
      module: function(media){
        return $.getJSON("https://fimstats.anjanms.com/_/media/" + media.format + "/" + media.cid + "?key=" + p0ne.FIMSTATS_KEY).then(function(d){
          var first, last;
          d.firstPlay = d.data[0].firstPlay;
          d.lastPlay = d.data[0].lastPlay;
          d.plays = d.data[0].plays;
          first = d.firstPlay.user + " " + ago(d.firstPlay.time * 1000);
          last = d.lastPlay.user + " " + ago(d.lastPlay.time * 1000);
          if (first !== last) {
            d.text = "last played by " + last + " \xa0 - (" + d.plays + "x) - \xa0 first played by " + first;
            d.html = "<span class=p0ne-fimstats-last>" + last + "</span><span class=p0ne-fimstats-plays>" + d.plays + "</span><span class=p0ne-fimstats-first>" + first + "</span>";
          } else {
            d.text = "once played by " + first;
            d.html = "<span class=p0ne-fimstats-once>" + first + "</span>";
          }
          return d;
        }).fail(function(d, arg$, status){
          if (status === "Not Found") {
            d.text = "first played just now!";
            d.html = "<span class=p0ne-fimstats-first-notyet></span>";
          } else {
            d.text = d.html = "";
          }
          return d;
        });
      }
    });
    /*@source p0ne.bpm.ls */
    /**
     * BetterPonymotes - a script add ponymotes to the chat on plug.dj
     * based on BetterPonymotes https://ponymotes.net/bpm/
     * for a ponymote tutorial see:
     * http://www.reddit.com/r/mylittlepony/comments/177z8f/how_to_use_default_emotes_like_a_pro_works_for/
     *
     * @author jtbrinkmann aka. Brinkie Pie
     * @license MIT License
     * @copyright (c) 2015 J.-T. Brinkmann
     */
    /*####################################
    #          BETTER PONYMOTES          #
    ####################################*/
    module('bpm', {
      require: ['chatPlugin'],
      displayName: 'Better Ponymotes',
      settings: 'pony',
      _settings: {
        showNSFW: false
      },
      module: function(str){
        if (!str) {
          console.error("bpm(null)");
        }
        return this.bpm(str);
      },
      setup: function(arg$, arg1$){
        var addListener, $create, _settings, host, ref$, _FLAG_NSFW, _FLAG_REDIRECT, EMOTE_REGEXP, sanitize_map;
        addListener = arg$.addListener, $create = arg$.$create;
        _settings = arg1$._settings;
        host = ((ref$ = window.p0ne) != null ? ref$.host : void 8) || "https://cdn.p0ne.com";
        /*== external sources ==*/
        if (!window.emote_map) {
          window.emote_map = {};
          $.getScript(host + "/scripts/bpm-resources.js").then(function(){
            return API.trigger('p0ne_emotes_map');
          });
        } else {
          requestAnimationFrame(function(){
            return API.trigger('p0ne_emotes_map');
          });
        }
        $create("<div id='bpm-resources'><link rel='stylesheet' href='" + host + "/css/bpmotes.css' type='text/css'><link rel='stylesheet' href='" + host + "/css/emote-classes.css' type='text/css'><link rel='stylesheet' href='" + host + "/css/combiners-nsfw.css' type='text/css'><link rel='stylesheet' href='" + host + "/css/gif-animotes.css' type='text/css'>" + ('webkitAnimation' in document.body.style
          ? "<link rel='stylesheet' href='" + host + "/css/extracss-webkit.css' type='text/css'>"
          : "<link rel='stylesheet' href='" + host + "/css/extracss-pure.css' type='text/css'>") + "</div>").appendTo($body);
        /*
                <style>
                \#chat-suggestion-items .bpm-emote {
                    max-width: 27px;
                    max-height: 27px
                }
                </style>
        */
        /*== constants ==*/
        _FLAG_NSFW = 1;
        _FLAG_REDIRECT = 2;
        /*
         * As a note, this regexp is a little forgiving in some respects and strict in
         * others. It will not permit text in the [] portion, but alt-text quotes don't
         * have to match each other.
         */
        /*                 [](/  <   emote   >   <     alt-text    >  )*/
        EMOTE_REGEXP = /\[\]\(\/([\w:!#\/\-]+)\s*(?:["']([^"]*)["'])?\)/g;
        /*== auxiliaries ==*/
        /*
         * Escapes an emote name (or similar) to match the CSS classes.
         *
         * Must be kept in sync with other copies, and the Python code.
         */
        sanitize_map = {
          '!': '_excl_',
          ':': '_colon_',
          '#': '_hash_',
          '/': '_slash_'
        };
        function sanitize_emote(s){
          return s.toLowerCase().replace(/[!:#\/]/g, function(c){
            return sanitize_map[c];
          });
        }
        function lookup_core_emote(name, altText){
          var data, nameWithSlash, parts, flag_data, tag_data, flags, source_id, is_nsfw, is_redirect;
          data = emote_map["/" + name];
          if (!data) {
            return null;
          }
          nameWithSlash = name;
          parts = data.split(',');
          flag_data = parts[0];
          tag_data = parts[1];
          flags = parseInt(flag_data.slice(0, 1), 16);
          source_id = parseInt(flag_data.slice(1, 3), 16);
          is_nsfw = flags & _FLAG_NSFW;
          is_redirect = flags & _FLAG_REDIRECT;
          /*tags = []
          start = 0
          while (str = tag_data.slice(start, start+2)) != ""
              tags.push(parseInt(str, 16)) # Hexadecimal
              start += 2
          
          if is_redirect
              base = parts.2
          else
              base = name*/
          return {
            name: nameWithSlash,
            is_nsfw: !!is_nsfw,
            source_id: source_id,
            source_name: sr_id2name[source_id],
            css_class: "bpmote-" + sanitize_emote(name),
            altText: altText
          };
        }
        function convert_emote_element(info, parts, _){
          var title, flags, i$, len$, i, flag;
          title = (info.name + " from " + info.source_name).replace(/"/g, '');
          flags = "";
          for (i$ = 0, len$ = parts.length; i$ < len$; ++i$) {
            i = i$;
            flag = parts[i$];
            if (i > 0) {
              /* Normalize case, and forbid things that don't look exactly as we expect */
              flag = sanitize_emote(flag.toLowerCase());
              if (!/\W/.test(flag)) {
                flags += " bpflag-" + flag;
              }
            }
          }
          if (info.is_nsfw) {
            if (_settings.showNSFW) {
              title = "[NSFW] " + title;
              flags += " bpm-nsfw";
            } else {
              console.warn("[bpm] nsfw emote (disabled)", name);
              return "<span class='bpm-nsfw' title='NSFW emote'>" + _ + "</span>";
            }
          }
          return "<span class='bpflag-in bpm-emote " + info.css_class + " " + flags + "' title='" + title + "'>" + (info.altText || '') + "</span>";
        }
        this.bpm = function(str){
          if (!str) {
            console.error("bpm(null) [2]");
          }
          return str.replace(EMOTE_REGEXP, function(_, parts, altText){
            var name, info;
            parts = parts.split('-');
            name = parts[0];
            info = lookup_core_emote(name, altText);
            if (!info) {
              return _;
            } else {
              return partialize$.apply(this, [convert_emote_element, [info, parts, void 8], [2]]);
            }
          });
        };
        addListener(window._$context || API, 'chat:plugin', function(msg){
          return msg.message = bpm(msg.message);
        });
        return addListener('once', API, 'p0ne_emotes_map', function(){
          var cb;
          console.info("[bpm] loaded");
          $cms().find('.text').html(function(){
            return bpm(this.innerHTML);
          });
          /* add autocomplete if/when plug_p0ne and plug_p0ne.autocomplete are loaded */
          cb = function(){
            var AUTOCOMPLETE_REGEX;
            AUTOCOMPLETE_REGEX = /^\[\]\(\/([\w#\\!\:\/]+)(\s*["'][^"']*["'])?(\))?/;
            return typeof addAutocompletion === 'function' ? addAutocompletion({
              name: "Ponymotes",
              data: Object.keys(emote_map),
              pre: "[]",
              check: function(str, pos){
                var temp;
                if (!str[pos + 2] || str[pos + 2] === "(" && (!str[pos + 3] || str[pos + 3] === "(/")) {
                  temp = AUTOCOMPLETE_REGEX.exec(str.substr(pos));
                  if (temp) {
                    this.data = temp[2] || '';
                    return true;
                  }
                }
                return false;
              },
              display: function(items){
                var emote;
                return (function(){
                  var i$, ref$, len$, results$ = [];
                  for (i$ = 0, len$ = (ref$ = items).length; i$ < len$; ++i$) {
                    emote = ref$[i$];
                    results$.push({
                      value: "[](/" + emote + ")",
                      image: bpm("[](/" + emote + ")")
                    });
                  }
                  return results$;
                }());
              },
              insert: function(suggestion){
                return suggestion.substr(0, suggestion.length - 1) + "" + this.data + ")";
              }
            }) : void 8;
          };
          if (window.addAutocompletion) {
            return cb();
          } else {
            return addListener('once', API, 'p0ne:autocomplete', cb);
          }
        });
      },
      disable: function(revertPonimotes){
        if (revertPonimotes) {
          return $cms().find('.bpm-emote').replaceWith(function(){
            var flags, i$, ref$, len$, class_, emote;
            flags = "";
            for (i$ = 0, len$ = (ref$ = this.classList || this.className.split(/s+/)).length; i$ < len$; ++i$) {
              class_ = ref$[i$];
              if (class_.startsWith('bpmote-')) {
                emote = class_.substr(7);
              } else if (class_.startsWith('bpflag-') && class_ !== 'bpflag-in') {
                flags += class_.substr(6);
              }
            }
            if (emote) {
              return document.createTextNode("[](/" + emote + flags + ")");
            } else {
              return console.warn("[bpm] cannot convert back", this);
            }
          });
        }
      }
    });
    /*@source p0ne.end.ls */
    return _.defer(function(){
      var remaining, name, ref$, m;
      remaining = 1;
      for (name in ref$ = p0ne.modules) {
        m = ref$[name];
        if (m.loading) {
          remaining++;
          m.loading.always(moduleLoaded);
        }
      }
      moduleLoaded();
      if (remaining) {
        console.info(getTime() + " [p0ne] " + plural(remaining, 'module') + " still loading");
      }
      function moduleLoaded(m){
        var noCollapsedGroup, name, ref$;
        if (--remaining === 0) {
          console.error = error_;
          console.warn = warn_;
          console.groupEnd();
          console.info("[p0ne] initialized!");
          if (errors) {
            console.error("[p0ne] There have been " + errors + " errors");
          }
          if (warnings) {
            console.warn("[p0ne] There have been " + warnings + " warnings");
          }
          noCollapsedGroup = true;
          for (name in ref$ = p0ne.modules) {
            m = ref$[name];
            if (m.disabled && !m.settings && !(m.moderator && user.isStaff)) {
              if (noCollapsedGroup) {
                console.groupCollapsed("[p0ne] there are disabled modules which are hidden from the settings");
                noCollapsedGroup = false;
              }
              console.warn("\t" + name, m);
            }
          }
          if (!noCollapsedGroup) {
            console.groupEnd();
          }
          if (typeof appendChat === 'function') {
            appendChat("<div class='cm p0ne-notif p0ne-notif-loaded'>plug_p0ne v" + p0ne.version + " loaded " + (typeof getTimestamp === 'function' ? getTimestamp() : void 8) + "</div>");
          }
          return console.timeEnd("[p0ne] completly loaded");
        }
      }
      return moduleLoaded;
    });
    function fn$(type, callback, context){
      var ref$;
      ((ref$ = this._events)[type] || (ref$[type] = [])).unshift({
        callback: callback,
        context: context,
        ctx: context || this
      });
      return this;
    }
  });
  function fn$(needle){
    return -1 !== this.indexOf(needle);
  }
  function fn1$(needles){
    var i$, len$, needle;
    for (i$ = 0, len$ = needles.length; i$ < len$; ++i$) {
      needle = needles[i$];
      if (-1 !== this.indexOf(needle)) {
        return true;
      }
    }
    return false;
  }
});
function importAll$(obj, src){
  for (var key in src) obj[key] = src[key];
  return obj;
}
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
}
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) { 
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
function partialize$(f, args, where){
  var context = this;
  return function(){
    var params = slice$.call(arguments), i,
        len = params.length, wlen = where.length,
        ta = args ? args.concat() : [], tw = where ? where.concat() : [];
    for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
    return len < wlen && len ?
      partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
  };
}
