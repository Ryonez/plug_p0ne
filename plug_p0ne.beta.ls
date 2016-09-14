/*=====================*\
|*      plug_p0ne      *|
\*=====================*/

/*@source p0ne.head.ls */
/**
 * plug_p0ne - a modern script collection to improve plug.dj
 * adds a variety of new functions, bugfixes, tweaks and developer tools/functions
 *
 * This script collection is written in LiveScript (a CoffeeScript descendend which compiles to JavaScript). If you are reading this in JavaScript, you might want to check out the LiveScript file instead for a better documented and formatted source; just replace the .js with .ls in the URL of this file
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.2.3
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
*/

console.info "~~~~~~~~~~~~ plug_p0ne loading ~~~~~~~~~~~~"
window.p0ne =
    version: \1.2.3
    lastCompatibleVersion: \1.2.1 /* see below */
    host: 'https://cdn.p0ne.com'
    SOUNDCLOUD_KEY: \aff458e0e87cfbc1a2cde2f8aeb98759
    YOUTUBE_KEY: \AI39si6XYixXiaG51p_o0WahXtdRYFCpMJbgHVRKMKCph2FiJz9UCVaLdzfltg1DXtmEREQVFpkTHx_0O_dSpHR5w0PTVea4Lw
    proxy: (url) -> return "https://jsonp.nodejitsu.com/?raw=true&url=#url" # for cross site requests
    started: new Date()
    lsBound: {}
    modules: []
    dependencies: {}

/*####################################
#           COMPATIBILITY            #
####################################*/
/* check if last run p0ne version is incompatible with current and needs to be migrated */
window.compareVersions = (a, b) -> /* returns whether `a` is greater-or-equal to `b`; e.g. "1.2.0" is greater than "1.1.4.9" */
    a .= split \.
    b .= split \.
    for ,i in a
        if a[i] < b[i]
            return false
        else if a[i] > b[i]
            return true
    return true


<-      (fn) ->
    if not (v = localStorage.p0neVersion)
        # no previous version of p0ne found, looks like we're good to go
        return fn!

    if compareVersions(v, p0ne.lastCompatibleVersion)
        # no migration required, continue
        fn!
    else
        # incompatible, load migration script and continue when it's done
        console.warn "[p0ne] obsolete p0ne version detected (#v), migrating…"
        API.once "p0ne_migrated_#{p0ne.lastCompatibleVersion}", fn
        $.getScript "#{p0ne.host}/script/plug_p0ne.migrate.#{vArr.0}.js?from=#v&to=#{p0ne.version}"

p0ne = window.p0ne
localStorage.p0neVersion = p0ne.version

``
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

window.l = function(expression) {
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

``
/*@source p0ne.auxiliaries.ls */
/**
 * Auxiliary-functions for plug_p0ne
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
*/

$window = $ window
$body = $ document.body
window.s_to_ms = 1_000
window.min_to_ms = 60_000

/*####################################
#            DATA MANAGER            #
####################################*/
window{compress, decompress} = LZString
if not window.dataSave?.p0ne
    window.dataLoad = (name, defaultVal={}) ->
        return p0ne.lsBound[name] if p0ne.lsBound[name]
        if localStorage[name]
            if decompress(localStorage[name])
                return p0ne.lsBound[name] = JSON.parse(that)
            else
                name_ = Date.now!
                console.warn "failed to load '#name' from localStorage, it seems to be corrupted! made a backup to '#name_' and continued with default value"
                localStorage[name_] = localStorage[name]
        return p0ne.lsBound[name] = defaultVal
    window.dataSave = !->
        err = ""
        for k,v of p0ne.lsBound
            try
                localStorage[k] = compress(v.toJSON?! || JSON.stringify(v))
            catch
                err += "failed to store '#k' to localStorage\n"
        if err
            alert err
        else
            console.log "[Data Manager] saved data"
    window.dataSave.p0ne = true
    $window .on \beforeunload, dataSave
    setInterval dataSave, 15min *min_to_ms


/*####################################
#         PROTOTYPE FUNCTIONS        #
####################################*/
# helper for defining non-enumerable functions via Object.defineProperty
let (d = (property, fn) -> if @[property] != fn then Object.defineProperty this, property, { enumerable: false, writable: true, configurable: true, value: fn })
    d.call Object::, \define, d


Array::define \remove, (i) -> return @splice i, 1
Array::define \removeItem, (el) ->
    if -1 != (i = @indexOf(el))
        @splice i, 1
    return this
Array::define \random, -> return this[~~(Math.random! * @length)]
String::define \reverse, ->
    res = ""
    i = @length
    while i--
        res += @[i]
    return res
String::define \has, (needle) -> return -1 != @indexOf needle
String::define \startsWith, (str) ->
    i=0
    while char = str[i]
        return false if char != this[i++]
    return true
String::define \endsWith, (str) ->
    return this.lastIndexOf == @length - str.length

jQuery.fn <<<<
    fixSize: -> #… this is not really used?
        for el in this
            el.style .width = "#{el.width}px"
            el.style .height = "#{el.height}px"
        return this
    concat: (arr2) ->
        l = @length
        return this if not arr2 or not arr2.length
        return arr2 if not l
        for el, i in arr2
            @[i+l] = el
        @length += arr2.length
        return this


/*####################################
#         GENERAL AUXILIARIES        #
####################################*/
$dummy = $ \<a>
window <<<<
    YT_REGEX: /https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|embed|e)\/|.*(?:\?|&amp;)v=)|youtu\.be\/)([^"&?\/<>\s]{11})(?:&.*?|#.*?|)$/i
    repeat: (timeout, fn) -> return setInterval (-> fn ... if not disabled), timeout
    sleep: (timeout, fn) -> return setTimeout fn, timeout
    pad: (num) -> return switch true
        | num < 0   => num
        | num < 10  => "0#num"
        | num == 0  => "00"
        | otherwise => num

    generateID: -> return (~~(Math.random!*0xFFFFFF)) .toString(16).toUpperCase!


    getUser: (nameOrID) !->
        return if not nameOrID
        users = API.getUsers!
        if +nameOrID
            for user in users when user.id == nameOrID
                return user
        else
            for user in users when user.username == nameOrID
                return user
            nameOrID .= toLowerCase!
            for user in users when user.username .toLowerCase! == nameOrID
                return user
    getUserInternal: (nameOrID) !->
        return if not users
        if +nameOrID
            users.get nameOrID
        else
            users = users.models
            for user in users when user.username == nameOrID
                return user
            nameOrID .= toLowerCase!
            for user in users when user.username .toLowerCase! == nameOrID
                return user

    logger: (loggerName, fn) ->
        return ->
            console.log "[#loggerName]", arguments
            return fn? ...

    replace: (context, attribute, cb) ->
        context["#{attribute}_"] ||= context[attribute]
        context[attribute] = cb(context["#{attribute}_"])

    loadScript: (loadedEvent, data, file, callback) ->
        d = $.Deferred!
        d.then callback if callback

        if data
            d.resolve!
        else
            $.getScript "#{p0ne.host}/#file"
            $ window .one loadedEvent, d.resolve #Note: .resolve() is always bound to the Deferred
        return d.promise!

    requireIDs: dataLoad \requireIDs, {}
    requireHelper: (name, test, {id, onfail, fallback}=0) ->
        if (module = window[name] || require.s.contexts._.defined[id]) and test module
            id = module.requireID
            res = module
        else if (id = requireIDs[name]) and (module = require.s.contexts._.defined[id]) and test module
            res = module
        else
            for id, module of require.s.contexts._.defined when module and test module, id
                console.warn "[requireHelper] module '#name' updated to ID '#id'"
                requireIDs[name] = id
                res = module
                break
        if res
            #p0ne.modules[name] = res
            res.requireID = id
            window[name] = res if name
            return res
        else
            console.error "[requireHelper] could not require '#name'"
            onfail?!
            window[name] = fallback if name
            return fallback
    requireAll: (test) ->
        return [m for id, m of require.s.contexts._.defined when m and test(m, id)]


    /* callback gets called with the arguments cb(errorCode, response, event) */
    ajax: (type, url,  data, cb) ->
        if typeof url != \string
            [type, url, data] = [url, data, cb]
            type = data?.type || \POST
        if typeof data == \function
            success = data; data = null
        else if typeof cb == \function
            success = cb
        else if data and (data.success or data.error)
            {success, error} = data
            delete data.success
            delete data.error
        else if typeof cb == \object
            {success, fail} = cb if cb
        delete data.type if data
        options = do
                type: type
                url: "https://plug.dj/_/#url"
                success: ({data}) ->
                    console.info "[#url]", data
                    success? data
                error: (err) ->
                    console.error "[#url]", data
                    error? data
        if data
            options.contentType = \application/json
            options.data = JSON.stringify(data)
        return $.ajax options

    befriend: (userID, cb) -> ajax \POST, "friends", id: userID, cb
    ban: (userID, cb) -> ajax \POST, "bans/add", userID: userID, duration: API.BAN.HOUR, reason: 1, cb
    banPerma: (userID, cb) -> ajax \POST, "bans/add", userID: userID, duration: API.BAN.PERMA, reason: 1, cb
    unban: (userID, cb) -> ajax \DELETE, "bans/#userID", cb
    modMute: (userID, cb) -> ajax \POST, "mutes/add", userID: userID, duration: API.MUTE.SHORT, reason: 1, cb
    modUnmute: (userID, cb) -> ajax \DELETE, "mutes/#userID", cb
    chatDelete: (chatID, cb) -> ajax \DELETE, "chat/#chatID", cb
    kick: (userID, cb) ->
        <- ban userID
        <- sleep 1_000ms
        unban userID, cb


    $djButton: $ \#dj-button
    mute: ->
        return $ '.icon-volume-half, .icon-volume-on' .click! .length
    muteonce: ->
        return $ \.snooze .click! .length
    unmute: ->
        return $ '.playback-controls.snoozed .refresh, .icon-volume-off, .icon-volume-mute-once'.click! .length
    join: ->
        if $djButton.hasClass \is-wait
            $djButton.click!
            return true
        else
            return false
    leave: ->
        if $djButton.hasClass \is-leave
            $djButton.click!
            return true
        else
            return false


    mediaLookup: ({format, id, cid}:url, cb) ->
        if typeof cb == \function
            success = cb
        else
            if typeof cb == \object
                {success, fail} = cb if cb
            success ||= (data) -> console.info "[mediaLookup] #{<[yt sc]>[format - 1]}:#cid", data
        fail ||= (err) -> console.error "[mediaLookup] couldn't look up", cid, url, cb, err

        if typeof url == \string
            if cid = YT_REGEX .exec(url)?.1
                format = 1
            else if parseURL url .hostname in <[ soundcloud.com  i1.sndcdn.com ]>
                format = 2
        else
            cid ||= id

        if window.mediaLookup.lastID == (cid || url) and window.mediaLookup.lastData
            success window.mediaLookup.lastData
        else
            window.mediaLookup.lastID = cid || url
            window.mediaLookup.lastData = null
        if format == 1 # youtube
            return $.getJSON "https://gdata.youtube.com/feeds/api/videos/#cid?v=2&alt=json"
                .fail fail
                .success (d) ->
                    cid = d.entry.id.$t.substr(27)
                    window.mediaLookup.lastData =
                        format:       1
                        data:         d
                        cid:          cid
                        uploader:
                            name:     d.entry.author.0.name.$t
                            id:       d.entry.media$group.yt$uploaderId.$t
                        image:        "https://i.ytimg.com/vi/#cid/0.jpg"
                        title:        d.entry.title.$t
                        uploadDate:   d.entry.published.$t
                        url:          "https://youtube.com/watch?v=#cid"
                        description:  d.entry.media$group.media$description.$t
                        duration:     d.entry.media$group.yt$duration.seconds
                    success window.mediaLookup.lastData
        else if format == 2
            if cid
                req = $.getJSON "https://api.soundcloud.com/tracks/#cid.json", do
                    client_id: p0ne.SOUNDCLOUD_KEY
            else
                req = $.getJSON "https://api.soundcloud.com/resolve/", do
                    url: url
                    client_id: p0ne.SOUNDCLOUD_KEY
            return req
                .fail fail
                .success (d) ->
                    window.mediaLookup.lastData =
                        format:         2
                        data:           d
                        cid:            cid
                        uploader:
                            id:         d.user.id
                            name:       d.user.username
                            image:      d.user.avatar_url
                        image:          d.artwork_url
                        title:          d.title
                        uploadDate:     d.created_at
                        url:            d.permalink_url
                        description:    d.description
                        duration:       d.duration # in s

                        download:       d.download_url + "?client_id=#{p0ne.SOUNDCLOUD_KEY}"
                        downloadSize:   d.original_content_size
                        downloadFormat: d.original_format
                    success window.mediaLookup.lastData
        else
            return $.Deferred()
                .fail fail
                .rejectWith"unsupported format"

    mediaDownload: ({format, cid, id}:media, cb) ->
        if cb
            {success, fail} = cb
        else
            success = logger \mediaDownload
            error = logger \mediaDownloadError
        # success(downloadURL, downloadSize)
        cid ||= id
        if format == 1 # youtube
            $.ajax do
                url: p0ne.proxy "https://www.youtube.com/get_video_info?video_id=#cid"
                fail: fail
                success: (d) ->
                    if d.match(/url_encoded_fmt_stream_map=.*url%3D(.*?)%26/)
                        success? unescape(unescape(that.1))
                    else
                        fail? "unkown error"
        else if format == 2
            mediaLookup media
                .then (d) ->
                    success? d.download, d.downloadSize, downloadFormat
                .fail ->
                    fail? ...

    mediaSearch: (query) ->
        $ '#playlist-button .icon-playlist'
            .click! # will silently fail if playlist is already open
        $ \#search-input-field
            .val query
            .trigger do
                type: \keyup
                which: 13 # Enter
        /*app.footer.playlist.onBarClick!
        app.footer.playlist.playlist.search.searchInput.value = query
        app.footer.playlist.playlist.search.onSubmitSearch!
        */

    httpsify: (url) ->
        if url.startsWith("http:")
            return p0ne.proxy url
        else
            return url

    getChatText: (cid) ->
        return $! if not cid
        # if cid is undefined, it will return the last .cid-undefined (e.g. on .moderations, etc)
        return $cm! .find ".cid-#cid" .last!
    getChat: (cid) ->
        return getChatText cid .parent! .parent!
    #ToDo test this
    getMentions: (data) ->
        names = []; l=0
        data.message.replace /@(\w+)/g, (_, name, i) ->
            helper = (name) ->
                possibleMatches = [username for {username} in API.getUsers! when username.indexOf(name) == 0]
                switch possibleMatches.length
                | 0 =>
                | 1 => if data.message.substr(i + 1, possibleMatches.0.length) == possibleMatches.0
                    names[l++] = possibleMatches.0
                | otherwise =>
                    return helper(data.message.substr(i + 1, _.length))
                return _
            return helper(name)

        if not names.length
            names = [data.un]
        else
            names = $.unique names

        names.toString = -> return humanList this
        return names


    htmlEscapeMap: {sp: 32, blank: 32, excl: 33, quot: 34, num: 35, dollar: 36, percnt: 37, amp: 38, apos: 39, lpar: 40, rpar: 41, ast: 42, plus: 43, comma: 44, hyphen: 45, dash: 45, period: 46, sol: 47, colon: 58, semi: 59, lt: 60, equals: 61, gt: 62, quest: 63, commat: 64, lsqb: 91, bsol: 92, rsqb: 93, caret: 94, lowbar: 95, lcub: 123, verbar: 124, rcub: 125, tilde: 126, sim: 126, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brkbar: 166, sect: 167, uml: 168, die: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, hibar: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, half: 189, frac34: 190, iquest: 191}
    htmlEscape: (str) ->
        return $dummy .text str .html!
        /*
        if not window.htmlEscapeRegexp
            window.htmlEscapeRegexp = []; l=0; window.htmlEscapeMap_reversed = {}
            for k,v of htmlEscapeMap when v != 32 #spaces
                window.htmlEscapeMap_reversed[v] = k
                v .= toString 16
                if v.length <= 2
                    v = "0#v"
                window.htmlEscapeRegexp[l++] = "\\u0#v"
        return str.replace //#{window.htmlEscapeRegexp .join "|"}//g, (c) -> return "&#{window.htmlEscapeMap_reversed[c.charCodeAt 0]};"
        */

    htmlUnescape: (html) ->
        return html.replace /&(\w+);|&#(\d+);|&#x([a-fA-F0-9]+);/g, (_,a,b,c) ->
            return String.fromCharCode(+b or htmlEscapeMap[a] or parseInt(c, 16)) or _
    stripHTML: (msg) ->
        return msg .replace(/<.*?>/g, '')
    unemotify: (str) ->
        map = window.emoticons?.map
        return str if not map
        str .replace /<span class="emoji-glow"><span class="emoji emoji-(\w+)"><\/span><\/span>/g, (_, emoteID) ->
            if emoticons.reverseMap[emoteID]
                return ":#that:"
            else
                return _

    formatPlainText: (text) -> # used for song-notif and song-info
        lvl = 0
        text .= replace /([\s\S]*?)($|https?:(?:\([^\s\]\)]*\)|\[[^\s\)\]]*\]|[^\s\)\]]+))+([\.\?\!\,])?/g, (,pre,url,post) ->
            pre = pre
                .replace /(\s)(".*?")(\s)/g, "$1<i class='song-description-string'>$2</i>$3"
                .replace /(\s)(\*\w+\*)(\s)/g, "$1<b>$2</b>$3"
                .replace /(lyrics|download|original|re-?upload)/gi, "<b>$1</b>"
                .replace /(\s)((?:0x|#)[0-9a-fA-F]+|\d+)(\w*|%|\+)?(\s)/g, "$1<b class='song-description-number'>$2</b><i class='song-description-comment'>$3</i>$4"
                .replace /^={5,}$/mg, "<hr class='song-description-hr-double' />"
                .replace /^[\-~_]{5,}$/mg, "<hr class='song-description-hr' />"
                .replace /^[\[\-=~_]+.*?[\-=~_\]]+$/mg, "<b class='song-description-heading'>$&</b>"
                .replace /(.?)([\(\)])(.?)/g, (x,a,b,c) ->
                    if "=^".indexOf(x) == -1 or a == ":"
                        return x
                    else if b == \(
                        lvl++
                        return "#a<i class='song-description-comment'>(#c" if lvl == 1
                    else if lvl
                            lvl--
                            return "#a)</i>#c" if lvl == 0
                    return x
            return pre if not url
            return "#pre<a href='#url' target=_blank>#url</a>#{post||''}"
        text += "</i>" if lvl
        return text .replace /\n/g, \<br>

    #== RTL emulator ==
    # str = "abc\u202edef\u202dghi"
    # [str, resolveRTL(str)]
    resolveRTL: (str, dontJoin) ->
        a = b = ""
        isRTLoverridden = false
        "#str\u202d".replace /(.*?)(\u202e|\u202d)/g, (_,pre,c) ->
            if isRTLoverridden
                b += pre.reverse!
            else
                a += pre
            isRTLoverridden := (c == \\u202e)
            return _
        if dontJoin
            return [a,b]
        else
            return a+b
    cleanMessage: (str) -> return str |> unemotify |> stripHTML |> htmlUnescape |> resolveRTL


    colorKeywords: do ->
        <[ %undefined% black silver gray white maroon red purple fuchsia green lime olive yellow navy blue teal aqua orange aliceblue antiquewhite aquamarine azure beige bisque blanchedalmond blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen gainsboro ghostwhite gold goldenrod greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow limegreen linen mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite oldlace olivedrab orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna skyblue slateblue slategray slategrey snow springgreen steelblue tan thistle tomato turquoise violet wheat whitesmoke yellowgreen rebeccapurple ]>
            ..0 = void
            return ..
    isColor: (str) ->
        str = (~~str).toString(16) if typeof str == \number
        return false if typeof str != \string
        str .= trim!
        tmp = /^(?:#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})|(?:rgb|hsl)a?\([\d,]+\)|currentColor|(\w+))$/.exec(str)
        if tmp and tmp.1 in window.colorKeywords
            return str
        else
            return false

    isURL: (str) ->
        return false if typeof str != \string
        str.trim!
        if parseURL().host != location.host
            return str
        else
            return false


    humanList: (arr) ->
        return "" if not arr.length
        arr = []<<<<arr
        if arr.length > 1
            arr[*-2] += " and\xa0#{arr.pop!}" # \xa0 is NBSP
        return arr.join ", "

    plural: (num, singular, plural=singular+'s') ->
        # for further functionality, see
        # * http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html
        # * http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
        # * https://developer.mozilla.org/en-US/docs/Localization_and_Plurals
        if num == 1 # note: 0 will cause an s at the end, too
            return "#num\xa0#singular" # \xa0 is NBSP
        else
            return "#num\xa0#plural"


    # formatting
    getTime: (t = new Date) ->
        return t.toISOString! .replace(/.+?T|\..+/g, '')
    getISOTime: (t = new Date)->
        return t.toISOString! .replace(/T|\..+/g, " ")
    # show a timespan (in ms) in a human friendly format (e.g. "2 hours")
    humanTime: (diff) ->
        return "-#{humanTime -diff}" if diff < 0
        b=[60to_min, 60to_h, 24to_days, 360.25to_years]; c=0
        diff /= 1000to_s
        while diff > 2*b[c] then diff /= b[c++]
        return plural ~~diff, <[ second minute hour day ]>[c]
    # show a timespan (in s) in a format like "mm:ss" or "hh:mm:ss" etc
    mediaTime: (~~dur) ->
        return "-#{mediaTime -dur}" if dur < 0
        b=[60to_min, 60to_h, 24to_days, 360.25to_years]; c=0
        res = pad dur%60
        while dur = ~~(dur / b[c++])
            res = "#{pad dur % b[c]}:#res"
        if res.length == 2
            return "00:#res"
        else
            return res

    # create string saying how long ago a given timestamp (in ms since epoche) is
    ago: (d) ->
        return "#{humanTime (Date.now! - d)} ago"

    lssize: (sizeWhenDecompressed) ->
        size = 0mb
        for ,x of localStorage
            x = decompress x if sizeWhenDecompressed
            size += x.length / 524288to_mb # x.length * 16bits / 8to_b / 1024to_kb / 1024to_mb
        return size
    formatMB: ->
        return "#{it.toFixed(2)}MB"

    getRank: (user) -> # returns the name of a rank of a user
        if typeof user == \number and user > 10_000
            user = users.get(user)
        if user.gRole || user.get?(\gRole)
            if that == 5
                return \admin
            else
                return \BA
        return <[ user RDJ bouncer manager co-host host ]>[user.role || user.get?(\role) || 0]

    parseURL: (href) ->
        $dummy.0.href = href
        return $dummy.0{hash, host, hostname, href, pathname, port, protocol, search}




    # variables
    disabled: false
    userID: API?.getUser!.id
    user: API?.getUser! # for usage with things that should not change, like userID, joindate, …
    getRoomSlug: ->
        return room?.get?(\slug) || decodeURIComponent location.pathname.substr(1)





/*####################################
#          REQUIRE MODULES           #
####################################*/
#= _$context =
requireHelper \_$context, (._events?['chat:receive']), do
    fallback: {_events: {}}
    onfail: ->
        console.error "[p0ne require] couldn't load '_$context'. Some modules might not work"
window._$context.onEarly = (type, callback, context) ->
    this._events[][type] .unshift({callback, context, ctx: context || this})
        # ctx:  used for .trigger in Backbone
        # context:  used for .off in Backbone
    return this

#= app =
window.app = null if window.app?.nodeType
<-   (cb) ->
    return cb! if window.app

    requireHelper \App, (.::?.el == \body)
    if App
        App::animate = let animate_ = App::animate then !->
            console.log "[p0ne] got `app`"
            export p0ne.app = this
            App::animate = animate_ # restore App::animate
            animate_ ...
            cb!
    else
        cb!

# continue only after `app` was loaded
#= room =
requireHelper \user_, (.canModChat) #(._events?.'change:username')
window.users = user_.collection if user_

requireHelper \room, (.attributes?.hostID?)
requireHelper \Curate, (.::?execute?.toString!.has("/media/insert"))
requireHelper \playlists, (.activeMedia)
requireHelper \auxiliaries, (.deserializeMedia)
requireHelper \database, (.settings)
requireHelper \socketEvents, (.ack)
requireHelper \permissions, (.canModChat)
requireHelper \Playback, (.::?id == \playback)
requireHelper \PopoutView, (\_window of)
requireHelper \MediaPanel, (.::?onPlaylistVisible)
requireHelper \PlugAjax, (.::?.hasOwnProperty \permissionAlert)
requireHelper \backbone, (.Events), id: \backbone
requireHelper \roomLoader, (.onVideoResize)
requireHelper \Layout, (.getSize)
requireHelper \RoomUserRow, (.::?.vote)
requireHelper \DialogAlert, (.::?id == \dialog-alert)
requireHelper \popMenu, (.className == \pop-menu)

requireHelper \emoticons, (.emojify)
emoticons.reverseMap = {[v, k] for k,v of emoticons.map} if window.emoticons

requireHelper \FriendsList, (.::?className == \friends)
window.friendsList = app.room.friends


# chat
if not window.chat = app.room.chat
    for e in _$context?._events[\chat:receive] || [] when e.context?.cid
        window.chat = e.context
        break

if chat
    window <<<<
        $cm: ->
            if window.saveChat
                return saveChat.$cm
            else
                return chat.$chatMessages

        playChatSound: (isMention) ->
            if isMention
                chat.playSound \mention
            else if $ \.icon-chat-sound-on .length > 0
                chat.playSound \chat
else
    cm = $ \#chat-messages
    window <<<<
        $cm: ->
            return cm
        playChatSound: (isMention) ->

window <<<<
    appendChat: (div, wasAtBottom) ->
        wasAtBottom ?= chatIsAtBottom!
        if window.saveChat
            window.saveChat.$cChunk.append div
        else
            $cm!.append div
        chatScrollDown! if wasAtBottom
        chat.lastID = -1 # avoid message merging above the appended div
        return div

        #playChatSound isMention

    chatIsAtBottom: ->
        cm = $cm!
        return cm.scrollTop! > cm.0 .scrollHeight - cm.height! - 20
    chatScrollDown: ->
        cm = $cm!
        cm.scrollTop( cm.0 .scrollHeight )


/*####################################
#           extend jQuery            #
####################################*/
# add .timeout(time, fn) to Deferreds and Promises
replace jQuery, \Deferred, (Deferred_) -> return ->
    var timeStarted
    res = Deferred_ ...
    res.timeout = timeout
    promise_ = res.promise
    res.promise = ->
        res = promise_ ...
        res.timeout = timeout; res.timeStarted = timeStarted
        return res
    return res

    function timeout time, callback
        now = Date.now!
        timeStarted ||= Date.now!
        if @state! != \pending
            #console.log "[timeout] already #{@state!}"
            return

        if timeStarted + time <= now
            #console.log "[timeout] running callback now (Deferred started #{ago timeStarted_})"
            callback.call this, this
        else
            #console.log "[timeout] running callback in #{humanTime(timeStarted + time - now)} / #{humanTime time}"
            sleep timeStarted + time - now, ~>
                callback.call this, this if @state! == \pending



/*####################################
#     Listener for other Scripts     #
####################################*/
# plug³
var rR_
onLoaded = ->
    console.info "[p0ne] plugCubed detected"
    rR_ = Math.randomRange

    # wait for plugCubed to finish loading
    requestAnimationFrame waiting = ->
        if window.plugCubed and not window.plugCubed.plug_p0ne
            API.trigger \plugCubedLoaded, window.plugCubed
            $body .addClass \plugCubed
            replace plugCubed, \close, (close_) -> return !->
                $body .removeClass \plugCubed
                close_ ...
                if Math.randomRange != rR_
                    # plugCubed got reloaded
                    onLoaded!
                else
                    window.plugCubed = dummyP3
        else
            requestAnimationFrame waiting
dummyP3 = {close: onLoaded, plug_p0ne: true}
if window.plugCubed and not window.plugCubed.plug_p0ne
    onLoaded!
else
    window.plugCubed = dummyP3

# plugplug
onLoaded = ->
    console.info "[p0ne] plugplug detected"
    API.trigger \plugplugLoaded, window.plugplug
    sleep 5_000ms, -> ppStop = onLoaded
if window.ppSaved
    onLoaded!
else
    export ppStop = onLoaded

/*####################################
#          GET PLUG³ VERSION         #
####################################*/
window.getPlugCubedVersion = ->
    if not plugCubed?.init
        return null
    else if plugCubed.version
        return plugCubed.version
    else if v = $ '#p3-settings .version' .text!
        void
    else # plug³ alpha
        v = requireHelper \plugCubedVersion, (.major)
        return v if v

        # alternative methode (40x slower)
        $ \plugcubed .click!
        v = $ \#p3-settings
            .stop!
            .css left: -500px
            .find \.version .text!


    if typeof v == \string
        if v .match /^(\d+)\.(\d+)\.(\d+)(?:-(\w+))?(_min)? \(Build (\d+)\)$/
            v := that{major, minor, patch, prerelease, minified, build}
            v.toString = ->
                return "#{@major}.#{@minor}.#{@patch}#{@prerelease && '-'+@prerelease}#{@minified && '_min' || ''} (Build #{@build})"
    return plugCubed.version = v



# draws an image in the log
# `src` can be any url, that is valid in CSS (thus data urls etc, too)
# the optional parameter `customWidth` and `customHeight` need to be in px (of the type Number; e.g. `316` for 316px)
#note: if either the width or the height is not defined, the console.log entry will be asynchron because the image has to be loaded first to get the image's width and height
# returns a promise, so you can attach a callback for asynchronious loading with `console.logImg(...).then(function (img){ ...callback... } )`
# an HTML img-node with the picture will be passed to the callback(s)
#var pending = console && console.logImg && console.logImg.pending
console.logImg = (src, customWidth, customHeight) ->
    promise = do
        then: (cb) ->
            this._callbacksAfter ++= cb
            return this

        before: ->
            this._callbacksBefore ++= cb
            return this
        _callbacksAfter: []
        _callbacksBefore: []
        abort: ->
            this._aborted = true
            this.before = this.then = ->
            return this
        _aborted: false

    var img
    logImg = arguments.callee
    logImgLoader = ->
        if promise._aborted
            return

        if promise._callbacksBefore.length
            for cb in promise._callbacksBefore
                cb img
        promise.before = -> it img

        #console.log("height: "+(+customHeight || img.height)+"px; ", "width: "+(+customWidth || img.width)+"px")
        if window.chrome
            console.log "%c\u200B", "color: transparent; font-size: #{(+customHeight || img.height)*0.854}px !important;
                background: url(#src);display:block;
                border-right: #{+customWidth || img.width}px solid transparent
            "
        else
            console.log "%c", "background: url(#src) no-repeat; display: block;
                width: #{customWidth || img.width}px; height: #{customHeight || img.height}px;
            "
        if promise._callbacksAfter.length
            for cb in promise._callbacksAfter
                cb img
        promise.before = promise.then = -> it img

    if +customWidth && +customHeight
        logImgLoader!
    else
        #logImg.pending = logImg.pending || []
        #pendingPos = logImg.pending.push({src: src, customWidth: +customWidth, +customHeight: customHeight, time: new Date(), _aborted: false})
        img = new Image
            ..onload = logImgLoader
            ..onerror = ->
                #if(logImg.pending && logImg.pending.constructor == Array)
                #   logImg.pending.splice(pendingPos-1, 1)
                console.log "[couldn't load image %s]", src
            ..src = src

    return promise

/*@source p0ne.module.ls */
/**
 * Module script for loading disable-able chunks of code
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
window.module = (name, data) ->
    try
        # setup(helperFNs, module, args)
        # update(helperFNs, module, args, oldModule)
        # disable(helperFNs, module, args)
        if typeof name != \string
            data = name
        else
            data.name = name
        data = {setup: data} if typeof data == \function

        # set defaults here so that modifying their local variables will also modify them inside `module`
        data.persistent ||= {}
        {name, require, optional, callback,  setup, update, persistent, enable, disable, module, settings, displayName} = data
        data.callbacks[*] = callback if callback
        if module
            if typeof module == \function
                fn = module
                module = ->
                    fn.apply module, arguments
                module <<<< data
            else if typeof module == \object
                module <<<< data
            else
                console.warn "[#name] TypeError when initializing. `module` needs to be either an Object or a Function but is #{typeof module}"
                module = data
        else
            module = data


        module.displayName = displayName || name
        # sanitize module name (to alphanum-only camel case)
        # UPDATE: the developers should be able to do this for themselves >_>
        #dataName = name
        #    .replace(/^[A-Z]/, (.toLowerCase!)) # first letter is to be lowercase
        #    .replace(/^[^a-z_]/,"_$&") # first letter is to be a letter or a lowdash
        #    .replace(/(\w)?\W+(\w)?/g, (,a,b) -> return "#{a||''}#{(b||'').toUpperCase!}")

        cbs = module._cbs = {}

        arrEqual = (a, b) ->
            return false if not a or not b or a.length != b.length
            for ,i in a
                return false if a[i] != b[i]
            return true
        objEqual = (a, b) ->
            return true if a == b
            return false if !a or !b #or not arrEqual Object.keys(a), Object.keys(b)
            for k of a
                return false if a[k] != b[k]
            return true

        helperFNs =
            addListener: (target, ...args) ->
                if target == \early
                    early = true
                    [target, ...args] = args
                cbs.[]listeners[*] = {target, args}
                if not early
                    return target.on .apply target, args
                else if not target.onEarly
                    console.warn "[#name] cannot use .onEarly on", target
                else
                    return target.onEarly .apply target, args

            replace: (target, attr, repl) ->
                cbs.[]replacements[*] = [target, attr, repl]
                target["#{attr}_"] ||= target[attr]
                target[attr] = repl(target["#{attr}_"])

            replace_$Listener: (type, callback) ->
                if not window._$context
                    console.error "[ERROR] unable to replace listener in _$context._events['#type'] (no _$context)"
                    return false
                if not evts = _$context._events[type]
                    console.error "[ERROR] unable to replace listener in _$context._events['#type'] (no such event)"
                    return false
                for e in evts when e.context?.cid
                    return @replace e, \callback, callback

                console.error "[ERROR] unable to replace listener in _$context._events['#type'] (no vanilla callback found)"
                return false

            add: (target, callback, options) ->
                d = [target, callback, options]
                callback .= bind module if options?.bound
                d.index = target.length # not part of the Array, so arrEqual ignores it
                target[d.index] = callback
                cbs.[]adds[*] = d

            $create: (html) ->
                return cbs.[]$elements[*] = $ html
            $createPersistent: (html) ->
                return cbs.[]$elementsPersistent[*] = $ html
            css: (name, str) ->
                p0neCSS.css name, str
                cbs.{}css[name] = str
            loadStyle: (url) ->
                return if p0neCSS.$el.filter "[href='#url']" .length
                p0neCSS.loadStyle url
                cbs.{}loadedStyles[url] = true

            toggle: ->
                if @disabled
                    @enable!
                    return true
                else
                    @disable!
                    return false
            enable: ->
                return if not @disabled
                @disabled = false
                setup?.call module, helperFNs, module, data, module_
                API.trigger \p0neModuleEnabled, module
                console.info "[#name] enabled"
            disable: (newModule) ->
                return if module.disabled
                try
                    module.disabled = true
                    disable?.call module, helperFNs, newModule, data
                    for {target, args} in cbs.listeners ||[]
                        target.off .apply target, args
                    for [target, attr /*, repl*/] in cbs.replacements ||[]
                        target[attr] = target["#{attr}_"]
                    for [target /*, callback, options*/]:d in cbs.adds ||[]
                        target .remove d.index
                        d.index = -1
                    for style of cbs.css
                        p0neCSS.css style, "/* disabled */"
                    for url of cbs.loadedStyles
                        p0neCSS.unloadStyle url
                    for m in p0ne.dependencies[name] ||[]
                        m.disable!
                    for $el in cbs.$elements ||[]
                        $el .remove!
                    if not newModule
                        for $el in cbs.$elementsPersistent ||[]
                            $el .remove!
                        API.trigger \p0neModuleDisabled, module
                        console.info "[#name] disabled"
                    delete [cbs.listeners, cbs.replacements, cbs.adds, cbs.css, cbs.loadedStyles, cbs.$elements]
                catch err
                    console.error "[module] failed to disable '#name' cleanly", err.stack
                    delete window[name]
                delete p0ne.dependencies[name]

        module.disable = helperFNs.disable
        module.enable = helperFNs.enable
        if module_ = window[name]
            if persistent
                for k in persistent ||[]
                    module[k] = module_[k]
            module_.disable? module
        failedRequirements = []; l=0
        for r in require ||[]
            if !r
                failedRequirements[l++] = r
            else if (typeof r == \string and not window[r])
                p0ne.dependencies[][r][*] = this
                failedRequirements[l++] = r
        if failedRequirements.length
            console.error "[#name] didn't initialize (#{humanList failedRequirements} #{if failedRequirements.length > 1 then 'are' else 'is'} required)"
            return module
        optionalRequirements = [r for r in optional ||[] when !r or (typeof r == \string and not window[r])]
        if optionalRequirements.length
            console.warn "[#name] couldn't load optional requirement#{optionalRequirements.length>1 && 's' || ''}: #{humanList optionalRequirements}. This module may only run with limited functionality"

        try
            window[name] = module

            # set up Help and Settings
            module.help? .= replace /\n/g, "<br>\n"

            # initialize module
            if not module.disabled
                setup?.call module, helperFNs, module, data, module_

            p0ne.modules[*] = module
            if module_
                API.trigger \p0neModuleUpdated, module
                console.info "[#name] updated"
            else
                API.trigger \p0neModuleLoaded, module
                console.info "[#name] initialized"
        catch e
            console.error "[#name] error initializing", e.stack

        return module
    catch e
        console.error "[module] error initializing '#name':", e.message

/*@source p0ne.auxiliary-modules.ls */
/**
 * Auxiliary plug_p0ne modules
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */


/*####################################
#            AUXILIARIES             #
####################################*/
module \updateUserObj, do
    require: <[ user_ ]>
    setup: ({addListener}) ->
        addListener window.user_, \change:username, ->
            user.username = window.user_.get \username

module \PopoutListener, do
    require: <[ PopoutView ]>
    optional: <[ _$context chat ]>
    setup: ({replace}) ->
        # also works with chatDomEvents.on \click, \.un, -> example!
        # even thought cb.callback becomes \.un and cb.context becomes -> example!
        replace PopoutView, \render, (r_) -> return ->
            r_ ...
            _$context?.trigger \popout:open, PopoutView._window, PopoutView
            API.trigger \popout:open, PopoutView._window, PopoutView

module \chatDomEvents, do
    require: <[ backbone ]>
    optional: <[ PopoutView PopoutListener ]>
    persistent: <[ _events ]>
    setup: ({addListener}) ->
        @ <<<< backbone.Events
        @one = @once
        cm = $cm!
        on_ = @on; @on = ->
            on_ ...
            cm.on .apply cm, arguments
        off_ = @off; @off = ->
            off_ ...
            cm.off .apply cm, arguments

        patchCM = ~>
            PopoutListener.chat
            for event, callbacks of @_events
                for cb in callbacks
                    #cm .off event, cb.callback, cb.context #ToDo test if this is necessary
                    cm .on event, cb.callback, cb.context
        addListener API, \popout:open, patchCM

module \grabMedia, do
    require: <[ playlists ]>
    optional: <[ _$context ]>
    module: (playlistIDOrName, media, appendToEnd) ->
        currentPlaylist = playlists.get(playlists.getActiveID!)
        # get playlist
        if typeof playlistIDOrName == \string and not playlistIDOrName .startsWith \http
            for pl in playlists.models when playlistIDOrName == pl.get \name
                playlist = pl; break
        else if id = +playlistIDOrName
            playlist = playlists.get(playlistIDOrName)
        else
            playlist = currentPlaylist # default to current playlist
            appendToEnd = media; media = playlistIDOrName
        if not playlist
            console.error "[grabMedia] could not find playlist", arguments
            return

        # get media
        if not media # default to current song
            addMedia API.getMedia!
        else
            mediaLookup media, do
                success: addMedia
                fail: (err) ->
                    console.error "[grabMedia] couldn't grab", err

        # add media to playlist
        function addMedia media
            console.log "[grabMedia] add '#{media.author} - #{media.title}' to playlist: #playlist"
            playlist.set \syncing, true
            ajax \POST, "playlists/#{playlist.id}/media/insert", media: [media], append: !!appendToEnd
                .then (e) ->
                    if playlist.id != e.id
                        playlist.set \syncing, false
                        playlist := playlists.get(e.id)
                    playlist.set \count, e.count
                    if playlist.id == currentPlaylist.id
                        _$context? .trigger \PlaylistActionEvent:load, playlist.id, do
                            playlists.getActiveID! != playlists.getVisibleID! && playlist.toArray!
                    # update local playlist
                    playlist.set \syncing, false
                    console.info "[grabMedia] successfully added to playlist"
                .fail ->
                    console.error "[grabMedia] error adding song to the playlist"



/*####################################
#             CUSTOM CSS             #
####################################*/
module \p0neCSS, do
    optional: <[ PopoutListener PopoutView ]>
    $popoutEl: $!
    styles: {}
    persistent: <[ styles ]>
    setup: ({addListener, $create}) ->
        @$el = $create \<style> .appendTo \head
        {$el, $popoutEl, styles} = this
        addListener API, \popout:open, (_window) ->
            $popoutEl := $el .clone! .appendTo _window.document.head
        PopoutView.render! if PopoutView?._window

        export @getCustomCSS = (inclExternal) ->
            if inclExternal
                return [el.outerHTML for el in $el] .join '\n'
            else
                return $el .first! .text!

        throttled = false
        export @css = (name, css) ->
            return styles[name] if not css?

            styles[name] = css
            res = ""
            for n,css of styles
                res += "/* #n */\n#css\n\n"

            if not throttled
                throttled := true
                requestAnimationFrame ->
                    throttled := false
                    $el       .first! .text res
                    $popoutEl .first! .text res

        export @loadStyle = (url) ->
            console.log "[loadStyle]", url
            s = $ "<link rel='stylesheet' >"
                .attr \href, url
                .appendTo document.head
            $el       .push s.0

            if PopoutView?._window
                $popoutEl .push do
                    s.clone!
                        .appendTo PopoutView?._window.document.head

        export @unloadStyle = (url) ->
            $el       .find "[href='#url']" .remove!
            $popoutEl .find "[href='#url']" .remove!
                        .0
        @disable = ->
            $el       .remove!
            $popoutEl .remove!


module \_$contextUpdateEvent, do
    require: <[ _$context ]>
    setup: ({replace}) ->
        for fn in <[ on off onEarly ]>
            replace _$context, fn,  (fn_) -> return (type, cb, context) ->
                fn_ ...
                _$context .trigger \context:update, type, cb, context



module \login, do
    settings: false
    persistent: <[ showLogin ]>
    module: ->
        if @showLogin
            @showLogin!
        else if not @loading
            @loading = true
            $.getScript "#{p0ne.host}/plug_p0ne.login.js"

/*@source p0ne.perf.ls */
/**
 * performance enhancements for plug.dj
 * the perfEmojify module also adds custom emoticons
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
module \jQueryPerf, do
    setup: ({replace}) ->
        core_rnotwhite = /\S+/g
        if \classList of document.body #ToDo is document.body.classList more performant?
            replace jQuery.fn, \addClass, -> return (value) ->
                /* performance improvements */
                if jQuery.isFunction(value)
                    for j in this
                        jQuery(this).addClass value.call(this, j, this.className)

                else if typeof value == \string and value
                    classes = value.match(core_rnotwhite) || []

                    i = 0
                    while elem = this[i++] when (not elem && console.error(\missingElem, \addClass, this) || !0) and elem.nodeType == 1
                        j = 0
                        while clazz = classes[j++]
                            elem.classList.add clazz
                return this

            replace jQuery.fn, \removeClass, -> return (value) ->
                /* performance improvements */
                if jQuery.isFunction(value)
                    for j in this
                        jQuery(this).removeClass value.call(this, j, this.className)

                else if value ~= null
                    i = 0
                    while elem = this[i++] when (not elem && console.error(\missingElem, \removeClass, this) || !0) and elem.nodeType == 1
                        j = elem.classList .length
                        while clazz = elem.classList[--j]
                            elem.classList.remove clazz
                else if typeof value == \string and value
                    classes = value.match(core_rnotwhite) || []

                    i = 0
                    while elem = this[i++] when (not elem && console.error(\missingElem, \removeClass, this) || !0) and elem.nodeType == 1
                        j = 0
                        while clazz = classes[j++]
                            elem.classList.remove clazz
                return this

            replace jQuery.fn, \hasClass, -> return (className) ->
                /* performance improvements */
                i = 0
                while elem = this[i++] when (not elem && console.error(\missingElem, \hasClass, this) || !0) and elem.nodeType == 1 and elem.classList.contains className
                        return true
                return false


module \perfEmojify, do
    require: <[ emoticons ]>
    setup: ({replace}) ->
        # improves .emojify performance by 135% https://i.imgur.com/iBNICkX.png
        escapeReg = (e) ->
            return e .replace /([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1"

        autoEmoteMap =
            \>:( : \angry
            \>XD : \astonished
            \:DX : \bowtie
            \</3 : \broken_heart
            \:$ : \confused
            X$: \confounded
            \:~( : \cry
            \:[ : \disappointed
            \:~[ : \disappointed_relieved
            XO: \dizzy_face
            \:| : \expressionless
            \8| : \flushed
            \:( : \frowning
            \:# : \grimacing
            \:D : \grinning
            \<3 : \heart
            "<3)": \heart_eyes
            "O:)": \innocent
            ":~)": \joy
            \:* : \kissing
            \:<3 : \kissing_heart
            \X<3 : \kissing_closed_eyes
            XD: \laughing
            \:O : \open_mouth
            \Z:| : \sleeping
            ":)": \smiley
            \:/ : \smirk
            T_T: \sob
            \:P : \stuck_out_tongue
            \X-P : \stuck_out_tongue_closed_eyes
            \;P : \stuck_out_tongue_winking_eye
            "B-)": \sunglasses
            \~:( : \sweat
            "~:)": \sweat_smile
            XC: \tired_face
            \>:/ : \unamused
            ";)": \wink
        autoEmoteMap <<<< emoticons.autoEmoteMap
        emoticons.autoEmoteMap = autoEmoteMap

        emoticons.update = ->
            # create reverse emoticon map
            @reverseMap = {}

            # create hashes (ternary tree)
            @hashes = {}
            for k,v of @map
                continue if @reverseMap[v]
                @reverseMap[v] = k
                h = @hashes
                for letter, i in k
                    l = h[letter]
                    if typeof h[letter] == \string
                        h[letter] = {_list: [l]}
                        h[letter][l[i+1]] = l if l.length > i
                    if l
                        h[letter] ||= {_list: []}
                    else
                        h[letter] = k
                        break
                    h[letter]._list = (h[letter]._list ++ k).sort!
                    h = h[letter]

            # fix autoEmote
            for k,v of @autoEmoteMap
                tmp = k .replace "<", "&LT;" .replace ">", "&GT;"
                if tmp != k
                    @autoEmoteMap[tmp] = v
                    delete @autoEmoteMap[k]

            # create regexp for autoEmote
            @regAutoEmote = //(^|\s|&nbsp;)(#{Object.keys(@autoEmoteMap) .map escapeReg .join "|"})(?=\s|$)//gi

        emoticons.update!
        replace emoticons, \emojify, -> return (str) ->
            return str
                .replace @regAutoEmote, (,pre,emote) ~> return "#pre:#{@autoEmoteMap[emote .toUpperCase!]}:"
                .replace /:(.*?):/g, (_, emote) ~>
                    if @map[emote]
                        return "<span class='emoji-glow'><span class='emoji emoji-#{@map[emote]}'></span></span>"
                    else
                        return _
        replace emoticons, \lookup, -> return (str) ->
            h = @hashes
            var res
            for letter, i in str
                h = h[letter]
                switch typeof h
                | \undefined
                    return []
                | \string
                    for i from i+1 til str.length when str[i] != h[i]
                        return []
                    return [h]
            return h._list

/*@source p0ne.sjs.ls */
/**
 * propagate Socket Events to the API Event Emitter for custom event listeners
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
#== patch socket ==
module \socketListeners, do
    require: <[ socketEvents SockJS ]>
    optional: <[ _$context auxiliaries ]>
    setup: ({replace}) ->
        onRoomJoinQueue2 = []
        for let event in <[ send dispatchEvent ]>
            replace SockJS::, event, (e_) -> return ->
                e_ ...

                if window.socket != this and this._base_url == "https://shalamar.plug.dj:443/socket"
                    # patch
                    replace window, \socket, ~> return this
                    replace this, \onmessage, (msg_) -> return (t) ->
                        for el in t.data || []
                            _$context.trigger "socket:#{el.a}", el
                            API.trigger "socket:#{el.a}", el

                        type = t.data?.0?.a
                        console.warn "[SOCKET:WARNING] socket message format changed", t if not type

                        msg_ ...
                    _$context .on \room:joined, ->
                        while onRoomJoinQueue2.length
                            forEach onRoomJoinQueue2.shift!

                    socket.emit = (e, t, n) ->
                        #if e != \chat
                        #   console.log "[socket:#e]", t, n || ""
                        socket.send JSON.stringify do
                            a: e
                            p: t
                            t: auxiliaries?.getServerEpoch!
                            d: n

                    console.info "[Socket] socket patched (using .#event)", this



        function onMessage  t
            if room.get \joined
                forEach( t.data )
            else
                n = []; r = []
                for e in t.data
                    if e.s == \dashboard
                        n[*] = e
                    else
                        r[*] = e
                forEach( n )
                onRoomJoinQueue2.push( r )

        function forEach  t
            for el in t || []
                if socketEvents[ el.a ]
                    try
                        socketEvents[ el.a ]( el.p )
                    catch err
                        console.error "#{getTime!} [Socket] failed triggering '#{el.a}'", err.stack
                _$context.trigger "socket:#{el.a}", el
                API.trigger "socket:#{el.a}", el

/*
# from app.8cf130d413df133d47c418a818ee8cd60e05a2a0.js (2014-11-25)
# with minor improvements
define \plug_p0ne/socket, [ "underscore", "sockjs", "da676/df0c1/b4fa4", "da676/df0c1/fe7d6", "da676/ae6e4/a8215", "da676/ae6e4/fee3c", "da676/ae6e4/ac243", "da676/cba08/ee33b", "da676/cba08/f7bde", "da676/e0fc4/b75b7", "da676/eb13a/cd12f/d3fee", "da676/b0e2b/e9c55", "lang/Lang" ], ( _, SockJS,, context, AlertEvent, RoomEvent, UserEvent, room, user, socketEvents, AuthReq, auxiliaries, lang ) ->
        var socketURL, retries, sessionWasKilled, socket, onRoomJoinQueue
        if window._sjs
            init window._sjs
            context.on \socket:connect, connectedOrTimeout
        # window._sjs = undefined
        # delete window._sjs

        function init  e
            socketURL := e
            retries := 0
            sessionWasKilled := false
            context
                .on \chat:send, sendChat
                .on \room:joined, roomJoined
                .on \session:kill, sessionKilled

        function connectedOrTimeout
            if not socket
                context.off \socket:connect, connectedOrTimeout
            #socketEvents := _.clone socketEvents
            else
                socket.onopen = socket.onclose = socket.onmessage = socket := void
            debugLog \connecting, socketURL
            window.socket = socket := new SockJS( socketURL )
                ..onopen = connected
                ..onclose = disconnected
                ..onmessage = onMessage
            onRoomJoinQueue := []

        function connected
            debugLog \connected
            retries := 0
            if window._jm
                emit \auth, window._jm
                #delete window._jm
            else
                new AuthReq
                    .on \success, authenticated
                    .on \error, authenFailed


        function authenticated  e
            context
                .trigger \sjs:reconnected
                .on \ack, ->
                    context.off \ack
                        .dispatch new UserEvent( UserEvent.ME )
                    if room.get \joined
                        context.dispatch new RoomEvent( RoomEvent.STATE, room.get \slug )
            emit \auth, e

        function sessionKilled
            debugLog( \kill )
            sessionWasKilled := true

        function disconnected  t
            debugLog \disconnect, t
            if t?.wasClean and sessionWasKilled
                authenFailed!
            else
                if ++retries >= 0xFF #5
                    dcAlertEvent lang.alerts.connectionError, lang.alerts.connectionErrorMessage
                else
                    debugLog \reconnect, retries
                    context.trigger \sjs:reconnecting
                    _.delay connectedOrTimeout, Math.pow( 2, retries ) * 1_000ms

        function sendChat  e
            emit \chat, e

        function emit e, t, n
            if e != \chat
                debugLog \send, e, t, n || ""
            socket.send JSON.stringify do
                a: e
                p: t
                t: auxiliaries.getServerEpoch!
                d: n

        function onMessage  t
            if room.get \joined
                forEach( t.data )
            else
                n = _.filter t.data, (e) ->
                    return e.s == \dashboard
                r = _.filter t.data, ( e ) ->
                    return e.s != \dashboard
                forEach( n )
                onRoomJoinQueue.push( r )

        function forEach  t
            return if not t or not _.isArray( t )
            n = t.length
            for user in t
                if user.s != \dashboard and user.s != room.get \slug
                    debugLog "mismatch :: slug=#{room.get \slug}, message=", user
                    return
                i = user.a
                s = user.socketURL
                if i != \chat
                    debugLog i, s
                if socketEvents[ i ]
                    try
                        socketEvents[ i ]( s )

        function roomJoined
            while onRoomJoinQueue.length
                forEach onRoomJoinQueue.shift!

        function authenFailed
            context.dispatch( new AlertEvent( AlertEvent.ALERT, lang.alerts.sessionExpired, lang.alerts.sessionExpiredMessage, auxiliaries.forceRefresh, auxiliaries ), true )

        function debugLog
            if 5 == user.get \gRole # if client is admin
                e = <[ [sjs] ]>
                for arg, i in arguments
                    e[i] = arg
                console.info.apply ...e
*/


/*@source p0ne.fixes.ls */
/**
 * Fixes for plug.dj bugs
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */


/*####################################
#                FIXES               #
####################################*/
module \simpleFixes, do
    setup: ({replace}) ->
        # hide social-menu (because personally, i only accidentally click on it. it's just badly positioned)
        @$sm = $ \.social-menu .remove!

        # add tab-index to chat-input
        $ \#chat-input-field .prop \tabIndex, 1
    disable: ->
        @$sm .insertAfter \#playlist-panel
        $ \#chat-input-field .prop \tabIndex, null

module \soundCloudThumbnailFix, do
    require: <[ auxiliaries ]>
    help: '''
        Plug.dj changed the Soundcloud thumbnail file location several times, but never updated the paths in their song database, so many songs have broken thumbnail images.
        This module fixes this issue.
    '''
    setup: ({replace, $create}) ->
        replace auxiliaries, \deserializeMedia, -> return (e) !->
            e.author = this.h2t( e.author )
            e.title = this.h2t( e.title )
            if e.image
                if e.format == 2 # SoundCloud
                    if parseURL(e.image).host in <[ plug.dj cdn.plug.dj ]>
                        e.image = "https://i.imgur.com/41EAJBO.png"
                        #"https://cdn.plug.dj/_/static/images/soundcloud_thumbnail.c6d6487d52fe2e928a3a45514aa1340f4fed3032.png" # 2014-12-22
                else if e.image.startsWith("http:") or e.0 == e.1 == '/'
                    e.image = "https:#{e.image.substr(5)}"


module \fixGhosting, do
    displayName: 'Fix Ghosting'
    require: <[ PlugAjax ]>
    optional: <[ login ]>
    settings: -> return $ '<toggle val=warnings>Show Warnings</toggle>'
    help: '''
        Plug.dj sometimes marks you internally as "not in any room" even though you still are. This is also called "ghosting" because you can chat in a room that technically you are not in anymore. While ghosting you can still chat, but not join the waitlist or moderate. If others want to @mention you, you don't show up in the autocomplete.

        tl;dr this module automatically rejoins the room when you are ghosting
    '''
    _settings:
        warnings: true
    setup: ({replace, addListener}) ->
        _settings = @_settings
        rejoining = false
        queue = []

        addListener API, \socket:userLeave, ({p}) -> if p == userID
            rejoinRoom 'you left the room'

        replace PlugAjax::, \onError, (oE_) -> return (status, data) ->
            if status == \notInRoom
                #or status == \notFound # note: notFound is only returned for valid URLs, actually requesting not existing files returns a 404 error instead; update: TOO RISKY!
                queue[*] = this
                rejoinRoom "got 'notInRoom' error from plug", true
            else
                oE_ ...

        export rejoinRoom = (reason, throttled) ->
                if rejoining and throttled
                    console.warn "[fixGhosting] You are still ghosting, retrying to connect."
                else
                    console.warn "[fixGhosting] You are ghosting!", "Reason: #reason"
                    rejoining := true
                    ajax \POST, \rooms/join, slug: getRoomSlug!, do
                        success: (data) ~>
                            if data.responseText?.0 == "<" # indicator for IP/user ban
                                if data.responseText .has "You have been permanently banned from plug.dj"
                                    # for whatever reason this responds with a status code 200
                                    API.chatLog "your account got permanently banned. RIP", true
                                else
                                    API.chatLog "[fixGhosting] cannot rejoin the room. Plug is acting weird, maybe it is in maintenance mode or you got IP banned?", true
                            else
                                API.chatLog "[fixGhosting] reconnected to the room", true if _settings.warnings
                                for req in queue
                                    req.execute! # re-attempt whatever ajax requests just failed
                                rejoining := false
                        error: ({statusCode, responseJSON}:data) ~>
                            status = responseJSON?.status
                            switch status
                            | \ban =>
                                API.chatLog "you are banned from this community", true
                            | \roomCapacity =>
                                API.chatLog "the room capacity is reached :/", true
                            | \notAuthorized =>
                                API.chatLog "you got logged out", true
                                login?!
                            | otherwise =>
                                switch statusCode
                                | 401 =>
                                    API.chatLog "[fixGhosting] unexpected permission error while rejoining the room.", true
                                    #ToDo is an IP ban responding with status 401?
                                | 503 =>
                                    API.chatLog "plug.dj is in mainenance mode. nothing we can do here"
                                | 521, 522, 524 =>
                                    API.chatLog "plug.dj is currently completly down"
                                | otherwise =>
                                    API.chatLog "[fixGhosting] cannot rejoin the room, unexpected error #{statusCode} (#{datastatus})", true
                            # don't try again for the next 10min
                            sleep 10 *min_to_ms, ->
                                rejoining := false

module \fixOthersGhosting, do
    require: <[ users socketEvents ]>
    displayName: "Fix Other Users Ghosting"
    settings: -> return $ '<toggle val=warnings>Show Warnings</toggle>'
    help: '''
        Sometimes plug.dj does not properly emit join notifications, so that clients don't know another user joined a room. Thus they appear as "ghosts", as if they were not in the room but still can chat

        This module detects "ghost" users and force-adds them to the room.
    '''
    _settings:
        warnings: true
    setup: ({addListener, css}) ->
        addListener API, \chat, (d) ~> if d.uid and not users.get(d.uid)
            console.info "[fixOthersGhosting] seems like '#{d.un}' (#{d.uid}) is ghosting"

            #ajax \GET, "users/#{d.uid}", (status, data) ~>
            ajax \GET, "rooms/state"
                .then (data) ~>
                    # "manually" trigger socket event for DJ advance
                    for u, i in data.0.users when not users.get(u.id)
                        socketEvents.userJoin u
                        API.chatLog "[p0ne] force-joined ##i #{d.un} (#{d.uid}) to the room", true if @_settings.warnings
                    else
                        ajax \GET "users/#{d.uid}", (data) ~>
                            data.role = -1
                            socketEvents.userJoin data
                            API.chatLog "[p0ne] #{d.un} (#{d.uid}) is ghosting", true if @_settings.warnings
                .fail ->
                    console.error "[fixOthersGhosting] cannot load room data:", status, data
                    console.error "[fixOthersGhosting] cannot load user data:", status, data

module \fixStuckDJ, do
    require: <[ Playback socketEvents ]>
    displayName: "Fix Stuck Advance"
    settings: -> return $ '<toggle val=warnings>Show Warnings</toggle>'
    help: '''
        Sometimes plug.dj does not automatically start playing the next song. Usually you would have to reload the page to fix this bug.

        This module detects stuck advances and automatically force-loads the next song.
    '''
    _settings:
        warnings: true
    setup: ({replace, addListener}) ->
        _settings = @_settings
        fixStuckDJ = this
        fixStuckDJ.timer := sleep 15s *s_to_ms, fixStuckDJ if API.getTimeRemaining! == 0s
        replace Playback::, \playbackComplete, (pC_) -> return ->
            args = arguments
            replace Playback::, \playbackComplete, ~>
                fn = ->
                    # wait 5s before checking if advance is stuck
                    fixStuckDJ.timer := sleep 15s *s_to_ms, fixStuckDJ
                    clearTimeout fixStuckDJ.timer
                    pC_ ...
                fn.apply this, args
                return fn

        addListener API, \advance, ~>
            clearTimeout @timer
    module: ->
        # no new song played yet (otherwise this change:media would have cancelled this)
        fixStuckDJ = this
        console.warn "[fixNoAdvance] song seems to be stuck, trying to fix…"
        ajax \GET, \rooms/state, (data) ~>
            if not status == 200
                console.error "[fixNoAdvance] cannot load room data:", status, data
                @timer := sleep 5s *s_to_ms, fixStuckDJ
            else
                # "manually" trigger socket event for DJ advance
                socketEvents.advance do
                    c: data.0.booth.currentDJ
                    d: data.0.booth.waitingDJs
                    h: data.0.playback.historyID
                    m: data.0.playback.media
                    t: data.0.playback.startTime
                    p: data.0.playback.playlistID

                API.chatLog "[p0ne] fixed DJ not advancing", true if @_settings.warnings

module \fixNoPlaylistCycle, do
    require: <[ NOT_FINISHED ]>
    displayName: "Fix No Playlist Cycle"
    settings: -> return $ '<toggle val=warnings>Show Warnings</toggle>'
    help: '''
        Sometimes after DJing, plug.dj does not move the played song to the bottom of the playlist.

        This module automatically detects this bug and moves the song to the bottom.
    '''
    _settings:
        warnings: true
    setup: ({addListener}) ->
        addListener API, \advance, ({dj, lastPlay}) ~>
            #ToDo check if spelling is correctly
            #ToDo get currentPlaylist
            if dj?.id == userID and lastPlay.media.id == currentPlaylist.song.id
                #_$context .trigger \MediaMoveEvent:move
                ajax \PUT, "playlists/#{currentPlaylist.id}/media/move", ids: [lastPlay.media.id], beforeID: 0
                API.chatLog "[p0ne] fixed playlist not cycling", true if @_settings.warnings



module \zalgoFix, do
    settings: true
    displayName: 'Fix Zalgo Messages'
    setup: ({css}) ->
        css \zalgoFix, '
            .message {
                overflow: hidden;
            }
        '

module \fixWinterThumbnails, do
    setup: ({css}) ->
        avis = [".thumb .avi-2014winter#{pad i}" for i from 1 to 10].join(', ')
        css \fixWinterThumbnails, "
            #{avis} {
                background-position-y: 0 !important;
            }
        "


/*@source p0ne.base.ls */
/**
 * Base plug_p0ne modules
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */

/*####################################
#           DISABLE/STATUS           #
####################################*/
module \disableCommand, do
    modules: <[ autojoin ]> # autorespond 
    setup: ({addListener}) ->
        addListener API, \chat, (data) ~>
            if data.message.has("!disable") and data.message.has("@#{user.username}") and API.hasPermission(data.uid, API.ROLE.BOUNCER)
                console.warn "[DISABLE] '#status'"
                enabledModules = []
                for m in @modules
                    if window[m] and not window[m].disabled
                        enabledModules[*] = m
                        window[m].disable!
                    else
                        disabledModules[*] = m
                response = "#{data.un} - "
                if enabledModules.length
                    response += "disabled #{humanList enabledModules}."
                if disabledModules.length
                    response += " #{humanList enabledModules} were already disabled."
                API.sendChat response

module \getStatus, do
    module: ->
        status = "Running plug_p0ne v#{p0ne.version}"
        status += " (incl. chat script)" if window.p0ne_chat
        status += "\tand plug³ v#{getPlugCubedVersion!}" if window.plugCubed
        status += "\tand plugplug #{window.getVersionShort!}" if window.ppSaved
        status += ".\tStarted #{ago p0ne.started}."
        modules = [m for m in disableCommand.modules when window[m] and not window[m].disabled]
        status += ".\t#{humanList} are enabled" if modules

module \statusCommand, do
    timeout: false
    setup: ({addListener}) ->
        addListener API, \chat, (data) ~> if not @timeout
            if data.message.has( \!status ) and data.message.has("@#{user.username}") and API.hasPermission(data.uid, API.ROLE.BOUNCER)
                @timeout = true
                status = "#{getStatus!}"
                console.info "[AUTORESPOND] status: '#status'", data.uid, data.un
                API.sendChat status, data
                sleep 30min *60_000to_ms, ->
                    @timeout = false
                    console.info "[status] timeout reset"


/*####################################
#             YELLOW MOD             #
####################################*/
module \yellowMod, do
    settings: true
    displayName: 'Have yellow name as mod'
    setup: ({css}) ->
        id = API.getUser! .id
        css \yellowMod, "
            \#chat .from-#id .from,
            \#chat .fromID-#id .from,
            \#chat .fromID-#id .un {
                color: \#ffdd6f !important;
            }
        "


/*####################################
#         08/15 PLUG SCRIPTS         #
####################################*/
module \autojoin, do
    settings: true
    setup: ({addListener}) ->
        addListener API, \advance, ->
            if join!
                console.log "[autojoin] joined waitlist", API.getWaitListPosition!




# adds a user-rollover to the FriendsList when clicking someone's name
module \friendslistUserPopup, do
    require: <[ friendsList FriendsList chat ]>
    setup: ({addListener}) ->
        addListener $(\.friends), \click, '.name, .image', (e) ->
            id = friendsList.rows[$ this.closest \.row .index!] ?.model.id
            user = users.get(id) if id
            data = x: $body.width! - 353px, y: e.screenY - 90px
            if user
                chat.onShowChatUser user, data
            else if id
                chat.getExternalUser id, data, (user) ->
                    chat.onShowChatUser user, data
        #replace friendsList, \drawBind, -> return _.bind friendsList.drawRow, friendsList

module \titleCurrentSong, do
    disable: ->
        $ \#now-playing-media .prop \title, ""
    setup: ({addListener}) ->
        addListener API, \advance, (d) ->
            if d
                $ \#now-playing-media .prop \title, "#{d.media.author} - #{d.media.title}"
            else
                $ \#now-playing-media .prop \title, null


/*####################################
#       MEH-ICON IN USERLIST         #
####################################*/
module \userlistMehIcon, do
    require: <[ RoomUserRow ]>
    setup: ({replace})  ->
        replace RoomUserRow::, \vote, -> return ->
            vote = @model.get \vote
            if vote != 0
                @$icon ||= $ \<i>
                @$icon
                    .removeClass!
                    .addClass \icon
                    .appendTo @$el

                if vote == -1
                    @$icon.addClass \icon-meh
                else if @model.get \grab
                    @$icon.addClass \icon-grab
                else
                    @$icon.addClass \icon-woot

            else if @$icon
                @$icon .remove!
                delete @$icon

/*####################################
#      DISABLE MESSAGE DELETE        #
####################################*/
module \disableChatDelete, do
    require: <[ _$context ]>
    optional: <[ socketListeners ]>
    settings: true
    displayName: 'Show deleted messages'
    setup: ({replace_$Listener, addListener, $create, css}) ->
        $body .addClass \p0ne_showDeletedMessages
        css \disableChatDelete, '
            .deleted {
                border-left: 2px solid red;
                display: none;
            }
            .p0ne_showDeletedMessages .deleted {
                display: block;
            }
            .deleted-message {
                display: block;
                text-align: right;
                color: red;
                font-family: monospace;
            }
        '

        replace_$Listener \chat:delete, -> return (cid) ->
            if not window.socket
                markAsDeleted(cid)
        addListener _$context, \socket:chatDelete, ({{c,mi}:p}) ->
            markAsDeleted(c, users.get(mi)?.get(\username) || mi)

        function markAsDeleted cid, moderator
            $msg = getChat cid
            console.log "[Chat Delete]", cid, $msg.text!
            t  = getISOTime!
            t += " by #moderator" if moderator
            try
                wasAtBottom = isChatAtBottom?!
                $msg
                    .addClass \deleted
                d = $create \<time>
                    .addClass \deleted-message
                    .attr \datetime, t
                    .text t
                    .appendTo $msg
                #cm = $cm!
                #cm.scrollTop cm.scrollTop! + d.height!
                scrollChatDown?! if wasAtBottom

    disable: ->
        $body .removeClass \p0ne_showDeletedMessages



/*####################################
#        DBLCLICK to @MENTION        #
####################################*/
module \chatDblclick2Mention, do
    require: <[ chat ]>
    optional: <[ PopoutListener ]>
    settings: true
    displayName: 'DblClick username to Mention'
    setup: ({replace}) ->
        newFromClick = (e) ~>
            if not @timer # single click
                @timer = sleep 200ms, ~> if @timer
                    @timer = 0
                    chat.onFromClick e
            else # double click
                clearTimeout @timer
                @timer = 0
                chat.onInputMention e.target.textContent
            e .stopPropagation!; e .preventDefault!
        replace chat, \fromClick, ~> return newFromClick
        replace chat, \fromClickBind, ~> return newFromClick



/*####################################
#           CHAT COMMANDS            #
####################################*/
module \chatCommands, do
    setup: ({addListener}) ->
        addListener API, \chatCommand, (c) ->
            switch /\/\w+/.exec(c)?.0
            | \/avail, \/available =>
                API.setStatus 0
            | \/afk, \/away =>
                API.setStatus 1
            | \/work, \/busy =>
                API.setStatus 2
            | \/gaming, \/ingame, \/game =>
                API.setStatus 3
            | \/join =>
                join!
            | \/leave =>
                leave!
            | \/mute =>
                mute!
            | \/muteonce, \/onemute =>
                muteonce!
            | \/unmute =>
                unmute!
            | \/automute =>
                muteonce!
                if not automute?
                    API.chatLog "automute is not yet implemented", true
                else
                    media = API.getMedia!
                    if media.id not in automute.songlist
                        automute.songlist[*] = media.id
                        API.chat "'#{media.author} - #{media.title}' added to automute list."
                    else
                        automute.songlist.removeItem media.id
                        API.chat "'#{media.author} - #{media.title}' removed from the automute list."

/*####################################
#              AUTOMUTE              #
####################################*/
module \automute, do
    setup: ({addListener}) ->
        @automutelist = dataLoad \automute, []
        isAutomuted = false
        addListener API, \advance, ({media}) ~>
            wasAutomuted = isAutomuted
            isAutomuted := false
            if media and media.id in @automutelist
                isAutomuted := true
            if isAutomuted
                mute!
            else if wasAutomuted
                unmute!



/*####################################
#      JOIN/LEAVE NOTIFICATION       #
####################################*/
module \joinLeaveNotif, do
    optional: <[ chatDomEvents chat ]>
    setup: ({addListener, css},,,update) ->
        css \joinNotif, '
            .p0ne-joinLeave-notif {
                color: rgb(51, 102, 255);
                font-weight: bold;
            }
        '

        if update
            lastMsg = $cm! .children! .last!
            if lastMsg .hasClass \p0ne-joinLeave-notif
                $lastNotif = lastMsg

        verbRefreshed = 'refreshed'
        usersInRoom = {}
        for let event, verb_ of {userJoin: 'joined', userLeave: 'left'}
            addListener API, event, (user) ->
                verb = verb_
                if event == \userJoin
                    if usersInRoom[user.id]
                        verb = verbRefreshed
                    else
                        usersInRoom[user.id] = Date.now!
                else
                    delete usersInRoom[user.id]
                $msg = $ "<span data-uid=#{user.id}>"
                        .append document.createTextNode "#{if event == \userJoin then '+ ' else '- '}"
                        .append $ "<span class=from>#{user.username}</span>" .text user.username
                        .append document.createTextNode " just #verb the room"
                if false #chat?.lastType == \joinLeave
                    $lastNotif .append $msg
                else
                    $lastNotif := $ "<div class='cm update p0ne-joinLeave-notif'></div>"
                        .append $msg
                    appendChat $lastNotif
                    if chat?
                        $lastNotif .= find \.message
                        chat.lastType = \joinLeave
        if chat? and chatDomEvents?
            addListener chatDomEvents, \click, '.p0ne-join-notif, .p0ne-leave-notif', (e) ->
                chat.fromClick e

        if not update
            d = Date.now!
            for user in API.getUsers!
                usersInRoom[user.id] = -1




/*####################################
#      UNREAD CHAT NOTIFICAITON      #
####################################*/
module \unreadChatNotif, do
    require: <[ _$context chatDomEvents ]>
    bottomMsg: $!
    setup: ({addListener}) ->
        @bottomMsg = $cm! .children! .last!
        addListener \early, _$context, \chat:receive, (message) ->
            message.wasAtBottom ?= chatIsAtBottom!
            if message.wasAtBottom
                @bottomMsg = message.cid
            else
                delete @bottomMsg
                cm = $cm!
                cm .addClass \has-unread
                message.unread = true
                message.type += " unread"
        @throttled = false
        addListener chatDomEvents, \scroll, ~>
            return if @throttled
            @throttled := true
            sleep 200ms, ~>
                try
                    cm = $cm!
                    cmHeight = cm .height!
                    lastMsg = msg = @bottomMsg
                    $readMsgs = $!; l=0
                    while ( msg .=next! ).length
                        if msg .position!.top > cmHeight
                            @bottomMsg = lastMsg
                            break
                        else if msg.hasClass \unread
                            $readMsgs[l++] = msg.0
                        lastMsg = msg
                    if l
                        unread = cm.find \.unread
                        sleep 1_500ms, ~>
                            $readMsgs.removeClass \unread
                            if (unread .= filter \.unread) .length
                                @bottomMsg = unread .removeClass \unread .last!
                    if not msg.length
                        cm .removeClass \has-unread
                @throttled := false
    fix: ->
        @throttled = false
        cm = $cm!
        cm
            .removeClass \has-unread
            .find \.unread .removeClass \unread
        @bottomMsg = cm.children!.last!
    disable: ->
        $cm!
            .removeClass \has-unread
            .find \.unread .removeClass \unread
 

/*@source p0ne.chat.ls */
/*@author jtbrinkmann aka. Brinkie Pie */
/*@license https://creativecommons.org/licenses/by-nc/4.0/ */

/*
 * missing chat inline image plugins:
 * Derpibooru
 * imgur.com/a/
 * tumblr
 * deviantart
 * e621.net
 * paheal.net
 * gfycat.com
 * cloud-4.steampowered.com … .resizedimage
 */


chatWidth = 328px
roles = <[ none dj bouncer manager cohost host ambassador ambassador ambassador admin ]>


window.imgError = (elem) ->
    console.warn "[inline-img] converting image back to link", elem.alt, elem, elem.outerHTML
    $ elem .parent!
        ..text ..attr \href
        ..addClass \p0ne_img_failed


module \p0ne_chat_input, do
    require: <[ chat user ]>
    optional: <[ user_ _$context PopoutListener ]>
    displayName: "Better Chat Input"
    settings: true
    setup: ({addListener, css, $create}) ->
        # apply styles
        css \p0ne_chat_input, '
            #chat-input {
                bottom: 7px;
                height: auto;
                background: transparent !important;
                min-height: 30px;
            }
            #chat-input-field {
                position: static;
                resize: none;
                overflow: hidden;
                margin-left: 8px;
                color: #eee;
                background: rgba(0, 24, 33, .7);
                box-shadow: inset 0 0 0 1px transparent;
                transition: box-shadow .2s ease-out;
                height: 16px; /* default before first resize */
            }
            #chat-input-field:focus {
                box-shadow: inset 0 0 0 1px #009cdd !important;
            }
            .muted .chat-input-name {
                display: none;
            }

            .autoresize_helper {
                display: none;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            #chat-input-field, .autoresize_helper {
                width: 295px;
                padding: 8px 10px 5px 10px;
                font-weight: 400;
                font-size: 12px;
                font-family: Roboto,sans-serif;
            }
            .chat-input-name {
                position: absolute;
                top: 8px;
                left: 18px;
                font-weight: 700;
                font-size: 12px;
                font-family: Roboto,sans-serif;
                color: #666;
                transition: color .2s ease-out;
                pointer-events:none;
            }
            #chat-input-field:focus + .chat-input-name {
                color: #ffdd6f !important;
            }
            /*fix chat-messages size*/
            #chat-messages {
                height: auto !important;
                bottom: 45px;
            }
        '

        var $form, $name, $autoresize_helper, chat
        chat = PopoutView.chat || window.chat

        # back up elements that are to be removed
        @cIF_ = chat.$chatInputField.0


        # fix permanent focus class
        chat.$chatInput.removeClass \focused

        # use $name's width to add proper indent to the input field
        @fixIndent = -> requestAnimationFrame -> # wait an animation frame so $name is properly added to the DOM
            indent = 6px + $name.width!
            chat.$chatInputField .css textIndent: indent
            $autoresize_helper   .css textIndent: indent

        # add new input text-area
        addListener API, \popout:open, patchInput = ~>

            chat := PopoutView.chat || window.chat
            $form := chat.$chatInputField.parent!
            chat.$chatInputField.remove!
            chat.$chatInputField.0 = chat.chatInput = $create "<textarea id='chat-input-field' maxlength=256>"
                .prop \tabIndex, 1
                # add DOM event Listeners from original input field (not using .bind to allow custom chat.onKey* functions)
                .on \keydown, (e) ->
                    chat.onKeyDown e
                .on \keyup, (e) ->
                    chat.onKeyUp e
                #.on \focus, _.bind(chat.onFocus, chat)
                #.on \blur, _.bind(chat.onBlur, chat)

                # add event listeners for autoresizing
                .on 'input', ->
                    content = chat.$chatInputField .val!
                    if (content2 = content.replace(/\n/g, "")) != content
                        chat.$chatInputField .val (content=content2)
                    $autoresize_helper.html(content + \<br>)
                    oldHeight = chat.$chatInputField .height!
                    newHeight = $autoresize_helper .height!
                    return if oldHeight == newHeight
                    console.log "[chat input] adjusting height"
                    scrollTop = chat.$chatMessages.scrollTop!
                    chat.$chatInputField
                        .css height: newHeight
                    chat.$chatMessages
                        .css bottom: newHeight + 30px
                        .scrollTop scrollTop + newHeight - oldHeight
                .appendTo $form
                .after do
                    $autoresize_helper := $create \<div> .addClass \autoresize_helper
                .0

            # username field
            $name := $create \<span>
                .addClass \chat-input-name
                .text "#{user.username} "
                .insertAfter chat.$chatInputField

            @fixIndent!

        patchInput!
        sleep 2s *s_to_ms, @fixIndent

        if _$context
            addListener _$context, \chat:send, ->
                chat.$chatInputField .trigger \input

        if user_?
            addListener user_, \change:username, @fixIndent


    disable: ->
        chat.$chatInputField = $ @cIF_
            .appendTo $cm!.parent!.find \.chat-input-form

module \chatPlugin, do
    require: <[ _$context ]>
    setup: ->
        p0ne.chatMessagePlugins ||= []
        p0ne.chatLinkPlugins ||= []
        _$context .onEarly \chat:receive, @cb
    disable: ->
        _$context .off \chat:receive, @cb
    cb: (msg) -> # run plugins that modify chat msgs
        msg.wasAtBottom ?= chatIsAtBottom! # p0ne.saveChat also sets this

        _$context .trigger \chat:plugin, msg
        API .trigger \chat:plugin, msg

        for plugin in p0ne.chatMessagePlugins
            try
                msg.message = that if plugin(msg.message, msg)
            catch err
                console.error "[p0ne] error while processing chat link plugin", plugin, err

        # p0ne.chatLinkPlugins
        if msg.wasAtBottom
            onload = 'onload="chatScrollDown()"'
        else
            onload = ''
        msg.message .= replace /<a (.+?)>((https?:\/\/)(?:www\.)?(([^\/]+).+?))<\/a>/, (all,pre,completeURL,protocol,domain,url)->
            &6 = onload
            &7 = msg
            for plugin in p0ne.chatLinkPlugins
                try
                    return that if plugin ...
                catch err
                    console.error "[p0ne] error while processing chat link plugin", plugin, err
            return all


/*####################################
#          MESSAGE CLASSES           #
####################################*/
module \chatMessageClasses, do
    optional: <[ users ]>
    require: <[ chatPlugin ]>
    setup: ({addListener}) ->
        $cm?! .children! .each ->
            if uid = this.dataset.cid
                uid .= substr(0, 7)
                if fromUser = getUser uid and fromUser.role != -1
                    fromRole = roles[if fromUser.gRole then fromUser.gRole * 5 else fromUser.role]
                else
                    fromRole = \ghost

                $ this
                    .addClass "fromID-#{uid}"
                    .addClass "from-#{fromRole}"

        addListener _$context, \chat:plugin, ({uid}:message) ->
            fromUser = getUser uid
            if fromUser
                fromRole = roles[if fromUser.gRole then fromUser.gRole * 5 else fromUser.role]
            else
                fromRole = \ghost
            message.type += " fromID-#{uid} from-#{fromRole}"

# inline chat images & YT preview
/*####################################
#           INLINE  IMAGES           #
#             YT PREVIEW             #
####################################*/
chatWidth = 500px
module \chatInlineImages, do
    require: <[ chatPlugin ]>
    setup: ({add}) ->
        add p0ne.chatLinkPlugins, (all,pre,completeURL,protocol,domain,url, onload) ~>
            # images
            if @imgRegx[domain]
                [rgx, repl] = that
                img = url.replace(rgx, repl)
                if img != url
                    console.log "[inline-img]", "[#plugin] #protocol#url ==> #protocol#img"
                    return "<a #pre><img src='#protocol#img' class=p0ne_img #onload onerror='imgError(this)'></a>"

            # direct images
            if /^[^\#\?]+(?:\.(?:jpg|jpeg|gif|png|webp|apng)(?:@\dx)?|image\.php)(?:\?.*|\#.*)?$/i .test url
                console.log "[inline-img]", "[direct] #url"
                return "<a #pre><img src='#url' class=p0ne_img #onload onerror='imgError(this)'></a>"

            console.log "[inline-img]", "NO MATCH FOR #url (probably isn't an image)"
            return false

    imgRegx:
        \imgur.com :       [/^imgur.com\/(?:r\/\w+\/)?(\w\w\w+)/g, "i.imgur.com/$1.gif"]
        \prntscrn.com :    [/^(prntscr.com\/\w+)(?:\/direct\/)?/g, "$1/direct"]
        \gyazo.com :       [/^gyazo.com\/\w+/g, "i.$&/direct"]
        \dropbox.com :     [/^dropbox.com(\/s\/[a-z0-9]*?\/[^\/\?#]*\.(?:jpg|jpeg|gif|png|webp|apng))/g, "dl.dropboxusercontent.com$1"]
        \pbs.twitter.com : [/^(pbs.twimg.com\/media\/\w+\.(?:jpg|jpeg|gif|png|webp|apng))(?:\:large|\:small)?/g, "$1:small"]
        \googleImg.com :   [/^google\.com\/imgres\?imgurl=(.+?)(?:&|$)/g, (,src) -> return decodeURIComponent url]
        \imageshack.com :  [/^imageshack\.com\/[fi]\/(\w\w)(\w+?)(\w)(?:\W|$)/, -> chatInlineImages.imageshackPlugin ...]
        \imageshack.us :   [/^imageshack\.us\/[fi]\/(\w\w)(\w+?)(\w)(?:\W|$)/, -> chatInlineImages.imageshackPlugin ...]

        /* meme-plugins inspired by http://userscripts.org/scripts/show/154915.html (mirror: http://userscripts-mirror.org/scripts/show/154915.html while userscripts.org is down) */
        \quickmeme.com :     [/^(?:m\.)?quickmeme\.com\/meme\/(\w+)/, "i.qkme.me/$1.jpg"]
        \qkme.me :           [/^(?:m\.)?qkme\.me\/(\w+)/, "i.qkme.me/$1.jpg"]
        \memegenerator.net : [/^memegenerator\.net\/instance\/(\d+)/, "http://cdn.memegenerator.net/instances/#{chatWidth}x/$1.jpg"]
        \imageflip.com :     [/^imgflip.com\/i\/(.+)/, "i.imgflip.com/$1.jpg"]
        \livememe.com :      [/^livememe.com\/(\w+)/, "i.lvme.me/$1.jpg"]
        \memedad.com :       [/^memedad.com\/meme\/(\d+)/, "memedad.com/memes/$1.jpg"]
        \makeameme.org :     [/^makeameme.org\/meme\/(.+)/, "makeameme.org/media/created/$1.jpg"]

    imageshackPlugin: (,host,img,ext) ->
        ext = {j: \jpg, p: \png, g: \gif, b: \bmp, t: \tiff}[ext]
        return "https://imagizer.imageshack.us/a/img#{parseInt(host,36)}/#{~~(Math.random!*1000)}/#img.#ext"


# /* image plugins using plugCubed API (credits go to TATDK / plugCubed) */
# module \chatInlineImages_plugCubedAPI, do
#    require: <[ chatInlineImages ]>
#    setup: ->
#        chatInlineImages.imgRegx <<<< @imgRegx
#    imgRegx:
#        \deviantart.com :    [/^[\w\-\.]+\.deviantart.com\/(?:art\/|[\w:\-]+#\/)[\w:\-]+/, "https://api.plugCubed.net/redirect/da/$&"]
#        \fav.me :            [/^fav.me\/[\w:\-]+/, "https://api.plugCubed.net/redirect/da/$&"]
#        \sta.sh :            [/^sta.sh\/[\w:\-]+/, "https://api.plugCubed.net/redirect/da/$&"]
#        \gfycat.com :        [/^gfycat.com\/(.+)/, "https://api.plugCubed.net/redirect/gfycat/$1"]


module \chatYoutubeThumbnails, do
    setup: ({add, addListener}) ->
        add p0ne.chatLinkPlugins, @plugin
        addListener $(\#chat), 'mouseenter mouseleave', \.p0ne_yt_img, (e) ~>
            clearInterval @interval
            # assuming that `e.target` always refers to the .p0ne_yt_img
            id = e.parentElement.dataset.ytCid
            img = e.target
            if e.type == \mouseenter
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
            else
                img.style.backgroundImage = "url(http://i.ytimg.com/vi/#id/0.jpg)"
                console.log "[p0ne_yt_preview]", "stopped"
                #ToDo hide YT-options
    plugin: (all,pre,completeURL,protocol,domain,url, onload) ->
        yt = YT_REGEX .exec(url)
        if yt and (yt = yt.1)
            console.log "[inline-img]", "[YouTube #yt] #url ==> http://i.ytimg.com/vi/#yt/0.jpg"
            return "
                <a class=p0ne_yt data-yt-cid='#yt' #pre>
                    <div class=p0ne_yt_icon></div>
                    <div class=p0ne_yt_img #onload style='background-image:url(http://i.ytimg.com/vi/#yt/0.jpg)'></div>
                    #url
                </a>
            " # no `onerror` on purpose # when updating the HTML, check if it breaks the animation callback
            # default.jpg for smaller thumbnail; 0.jpg for big thumbnail; 1.jpg, 2.jpg, 3.jpg for previews
        return false
    interval: -1
    frame: 1
    lastID: ''


/*@source p0ne.look-and-feel.ls */
/**
 * plug_p0ne modules to add styles.
 * This needs to be kept in sync with plug_pony.css
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */


loadStyle "#{p0ne.host}/css/plug_p0ne.css?v=1.2"

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
module \fimplugTheme, do
    settings: true
    displayName: "Brinkie's fimplug Theme"
    module: -> @toggle!
    setup: ({loadStyle}) ->
        loadStyle "#{p0ne.host}/css/fimplug.css"

/*####################################
#          ANIMATED DIALOGS          #
####################################*/
module \animatedUI, do
    require: <[ DialogAlert ]>
    module: -> @toggle!
    setup: ({replace}) ->
        $ \.dialog .addClass \opaque
        # animate dialogs
        Dialog = DialogAlert.__super__

        replace Dialog, \render, -> return ->
            @show!
            sleep 0ms, ~> @$el.addClass \opaque
            return this

        replace Dialog, \close, (close_) -> return ->
            @$el.removeClass \opaque
            sleep 200ms, ~> close_.call this
            return this


/*####################################
#         PLAYLIST ICON VIEW         #
####################################*/
# fix drag'n'drop styles for playlist icon view
module \playlistIconView, do
    displayName: "Playlist Icon View"
    help: '''
        Shows songs in the playlist and history panel in an icon view instead of the default list view.
    '''
    settings: true
    module: -> @toggle!
    setup: ({addListener, replace, $create}, playlistIconView,, isUpdate) ->
        $body .addClass \playlist-icon-view if not isUpdate
        $hovered = $!
        $mediaPanel = $ \#media-panel
        addListener $mediaPanel , \mouseover, \.row, ->
            $hovered.removeClass \hover
            $hovered := $ this
            $hovered.addClass \hover if not $hovered.hasClass \selected
        addListener $mediaPanel, \mouseout, \.hover, ->
            $hovered.removeClass \hover

        replace MediaPanel::, \show, (s_) -> return ->
            s_ ...
            this.header.$el .append do
                $create '<div class="button playlist-view-button"><i class="icon icon-playlist"></i></div>'
                    .on \click, playlistIconView
    disable: ->
        $body .removeClass \playlist-icon-view


/*####################################
#             LEGACY CHAT            #
####################################*/
module \legacyChat, do
    displayName: "Legacy Chat"
    help: '''
        Shows the chat in the old format, before badges were added to it in December 2014.
    '''
    settings: true
    module: -> @toggle!
    setup: ({addListener},,, isUpdate) ->
        $body .addClass \legacy-chat if not isUpdate
        $cb = $ \#chat-button
        addListener $cb, \dblclick, (e) ~>
            @toggle!
            e.preventDefault!
        addListener chatDomEvents, \dblclick, '.popout .icon-chat', (e) ~>
            @toggle!
            e.preventDefault!
    disable: ->
        $body .removeClass \legacy-chat


module \censor, do
    displayName: "Censor"
    help: '''
        blurs some information like playlist names, counts, EP and Plug Notes.
        Great for taking screenshots
    '''
    disabled: true
    settings: true
    module: -> @toggle!
    setup: ->
        $body .addClass \censored
    disable: ->
        $body .removeClass \censored

/*@source p0ne.room-theme.ls */
/**
 * Room Settings module for plug_p0ne
 * made to be compatible with plugCubes Room Settings
 * so room hosts don't have to bother with mutliple formats
 * that also means, that a lot of inspiration came from and credits go to the PlugCubed team ♥
 * @author jtbrinkmann aka. Brinkie Pie
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
*/

module \roomSettings, do
    optional: <[ _$context ]>
    settings: false
    persistent: <[ _data _room ]>
    setup: ({addListener}) ->
        @_update!
        if _$context?
            addListener _$context, \room:joining, @~_clear
            addListener _$context, \room:joined, @~_update
    _update: ->
        @_listeners = []

        roomslug = getRoomSlug!
        return if @_data and roomslug == @_room

        if not roomDescription = $ '#room-info .description .value' .text!
            return
        url = /@p3=(.*)/i .exec roomDescription
        return if not url
        $.getJSON p0ne.proxy(url.1)
            .then (@_data) ~>
                console.log "[p0ne] loaded p³ compatible Room Settings"
                @_room = roomslug
                @_trigger!
            .fail fail
        function fail
            API.chatLog "[p0ne] cannot load Room Settings", true
    _trigger: ->
        for fn in @_listeners
            fn @_data
    _clear: ->
        @_data = null
        @_trigger
    on: (,fn) ->
        @_listeners[*] = fn
        if @_data
            fn @_data
    off: (,fn) ->
        if -1 != (i = @_listeners .indexOf fn)
            @_listeners .splice i, 1
            return true
        else
            return false

module \roomTheme, do
    displayName: "Room Theme"
    require: <[ roomSettings ]>
    optional: <[ roomLoader ]>
    settings: true
    setup: ({addListener, replace, css, loadStyle}) ->
        roles = <[ residentdj bouncer manager cohost host ambassador admin ]> #TODO
        @$playbackBackground = $ '#playback .background img'
            ..data \_o, ..data(\_o) || ..attr(\src)

        addListener roomSettings, \loaded, (d) ~>
            return if not d or @currentRoom == (roomslug = getRoomSlug!)
            @currentRoom = roomslug
            @clear!
            styles = ""

            /*== colors ==*/
            if d.colors
                for role, color of d.colors.chat when role in roles and isColor(color)
                    styles += """
                    /* #role => #color */
                    \#user-panel:not(.is-none) .user > .icon-chat-#role + .name, \#user-lists .user > .icon-chat-#role + .name, .cm.from-#role ~ .from {
                            color: #color !important;
                    }\n""" #ToDo add custom colors
                colorMap =
                    background: \#app
                    header: \.app-header
                    footer: \#footer
                for k, selector of colorMap when isColor(d.colors[k])
                    styles += "#selector { background-color: #{d.colors[k]} !important }\n"

            /*== CSS ==*/
            if d.css
                for rule,attrs of d.css.rule
                    styles += "#rule {"
                    for k, v of attrs
                        styles += "\n\t#k: #v"
                        styles += ";" if not /;\s*$/.test v
                    styles += "\n}\n"
                for {name, url} in d.css.fonts ||[] when name and url
                    if $.isArray url
                        url = [].join.call(url, ", ")
                    styles += """
                    @font-face {
                        font-family: '#name';
                        src: '#url';
                    }\n"""
                for url in d.css.import ||[]
                    loadStyle url
                #for rank, color of d.colors?.chat ||{}
                #   ...

            /*== images ==*/
            if d.images
                if isURL(d.images.background)
                    styles += "\#app { background-image: url(#{d.images.background}) }\n"
                if isURL(d.images.playback) and roomLoader? and Layout?
                    new Image
                        ..onload ->
                            @$playbackBackground .attr \src, d.images.playback
                            replace roomLoader, \frameHeight,   -> return ..height - 10px
                            replace roomLoader, \frameWidth,    -> return ..width  - 18px
                            roomLoader.onVideoResize Layout.getSize!
                            console.log "[roomTheme] loaded playback frame"
                        ..onerror ->
                            console.error "[roomTheme] failed to load playback frame"
                        ..src = d.images.playback
                    replace roomLoader, \src, -> return d.images.playback
                if isURL(d.images.booth)
                    styles += """
                        \#avatars-container::before {
                            background-image: url(#{d.images.booth});
                        }\n"""
                for role, url of d.images.icons when role in roles
                    styles += """
                        .icon-chat-#role {
                            background-image: url(#url);
                            background-position: 0 0;
                        }\n"""

            /*== text ==*/
            if d.text
                for key, text of d.text.plugDJ
                    for lang of Lang[key]
                        replace Lang[key], lang, -> return text
            css \roomTheme, styles
            @styles = styles

    clear: (skipDisables) ->
        if not skipDisables
            # copied from p0ne.module
            for [target, attr /*, repl*/] in @_cbs.replacements ||[]
                target[attr] = target["#{attr}_"]
            for style of @_cbs.css
                p0neCSS.css style, "/* disabled */"
            for url of @_cbs.loadedStyles
                p0neCSS.unloadStyle url
            delete [@_cbs.replacements, @_cbs.css, @_cbs.loadedStyles]

        if roomLoader? and Layout?
            roomLoader?.onVideoResize Layout.getSize!
        @$playbackBackground
            .attr \src, @$playbackBackground.data(\_o)

    disable: -> @clear true


/*@source p0ne.bpm.ls */
/**
 * BetterPonymotes - a script add ponymotes to the chat on plug.dj
 * based on BetterPonymotes https://ponymotes.net/bpm/
 * for a ponymote tutorial see: http://www.reddit.com/r/mylittlepony/comments/177z8f/how_to_use_default_emotes_like_a_pro_works_for/
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
do ->
    window.bpm?.disable!
    window.emote_map ||= {}
    host = window.p0ne?.host or "https://dl.dropboxusercontent.com/u/4217628/plug_p0ne"

    /*== external sources ==*/
    $.getScript "#host/script/bpm-resources.js" .then ->
        API .trigger \p0ne_emotes_map

    $ \body .append "
        <div id='bpm-resources'>
            <link rel='stylesheet' href='#host/css/bpmotes.css' type='text/css'>
            <link rel='stylesheet' href='#host/css/emote-classes.css' type='text/css'>
            <link rel='stylesheet' href='#host/css/combiners-nsfw.css' type='text/css'>
            <link rel='stylesheet' href='#host/css/gif-animotes.css' type='text/css'>
            <link rel='stylesheet' href='#host/css/extracss-pure.css' type='text/css'>
        </div>
    "
    /*
            <style>
            \#chat-suggestion-items .bpm-emote {
                max-width: 27px;
                max-height: 27px
            }
            </style>
    */

    /*== constants ==*/
    _FLAG_NSFW = 1
    _FLAG_REDIRECT = 2

    /*
     * As a note, this regexp is a little forgiving in some respects and strict in
     * others. It will not permit text in the [] portion, but alt-text quotes don't
     * have to match each other.
     */
    /*                 [](/  <   emote   >   <     alt-text    >  )*/
    emote_regexp = /\[\]\(\/([\w:!#\/\-]+)\s*(?:["']([^"]*)["'])?\)/g


    /*== auxiliaries ==*/
    /*
     * Escapes an emote name (or similar) to match the CSS classes.
     *
     * Must be kept in sync with other copies, and the Python code.
     */
    sanitize_emote = (s) ->
        return s.toLowerCase!.replace("!", "_excl_").replace(":", "_colon_").replace("#", "_hash_").replace("/", "_slash_")


    #== main BPM plugin ==
    lookup_core_emote = (name, altText) ->
        # Refer to bpgen.py:encode() for the details of this encoding
        data = emote_map["/"+name]
        return null if not data

        nameWithSlash = name
        parts = data.split ','
        flag_data = parts.0
        tag_data = parts.1

        flags = parseInt(flag_data.slice(0, 1), 16)     # Hexadecimal
        source_id = parseInt(flag_data.slice(1, 3), 16) # Hexadecimal
        #size = parseInt(flag_data.slice(3, 7), 16)     # Hexadecimal
        is_nsfw = (flags .&. _FLAG_NSFW)
        is_redirect = (flags .&. _FLAG_REDIRECT)

        /*tags = []
        start = 0
        while (str = tag_data.slice(start, start+2)) != ""
            tags.push(parseInt(str, 16)) # Hexadecimal
            start += 2

        if is_redirect
            base = parts.2
        else
            base = name*/

        return
            name: nameWithSlash,
            is_nsfw: !!is_nsfw
            source_id: source_id
            source_name: sr_id2name[source_id]
            #max_size: size

            #tags: tags

            css_class: "bpmote-#{sanitize_emote name}"
            #base: base

            altText: altText

    convert_emote_element = (info, parts) ->
        title = "#{info.name} from #{info.source_name}".replace /"/g, ''
        flags = ""
        for flag,i in parts when i>0
            /* Normalize case, and forbid things that don't look exactly as we expect */
            flag = sanitize_emote flag.toLowerCase!
            flags += " bpflag-#flag" if not /\W/.test flag

        if info.is_nsfw
            title = "[NSFW] #title"
            flags += " bpm-nsfw"

        return "<span class='bpflag-in bpm-emote #{info.css_class} #flags' title='#title'>#{info.altText || ''}</span>"
        # data-bpm_emotename='#{info.name}'
        # data-bpm_srname='#{info.source_name}'


    window.bpm = (str) ->
        return str .replace emote_regexp, (_, parts, altText) ->
            parts .= split '-'
            name = parts.0
            info = lookup_core_emote name, altText
            if not info
                return _
            else
                return convert_emote_element info, parts
    window.bpm.disable = (revertPonimotes) ->
        $ \#bpm-resources .remove!
        if revertPonimotes
            $ \.bpm-emote .replaceAll ->
                return document.createTextNode do
                    this.className
                        .replace /bpflag-in|bpm-emote|^\s+|\s+$/g, ''
                        .replace /\s+/g, '-'
            if window.bpm.callback
                for e, i in window._$context._events.\chat:receive when e == window.bpm.callback
                        window._$context._events.\chat:receive
                            .splice i, 1
                        break
        /*
        # in case it is required to avoid replacing in HTML tags
        # usually though, there shouldn't be ponymotes in links / inline images / converted ponymotes
        if str .has("[](/")
            # avoid replacing emotes in HTML tags
            return "#str" .replace /(.*?)(?:<.*?>)?/, (,nonHTML, html) ->
                nonHTML .= replace emote_regexp, (_, parts, altText) ->
                    parts .= split '-'
                    name = parts.0
                    info = lookup_core_emote name, altText
                    if not info
                        return _
                    else
                        return convert_emote_element info, parts
                return "#nonHTML#html"
        else
            return str
        */

    if window.p0ne?.chatMessagePlugins
        /* add BPM as a p0ne chat plugin */
        window.p0ne.chatMessagePlugins[*] = window.bpm
    else do ->
        /* add BPM as a standalone script */
        if not window._$context
            module = window.require.s.contexts._.defined[\b1b5f/b8d75/c3237] /* ID as of 2014-09-03 */
            if module and module._events?[\chat:receive]
                window._$context = module
            else
                for id, module of require.s.contexts._.defined when module and module._events?[\chat:receive]
                    window._$context = module
                    break

        window._$context._events.\chat:receive .unshift do
            window.bpm.callback = callback: (d) !->
                d.message = bpm(d.message)

    API .once \p0ne_emotes_map, ->
        console.info "[bpm] loaded"
        /* ponify old messages */
        $ '#chat .text' .html ->
            return window.bpm this.innerHTML

        /* add autocomplete if/when plug_p0ne and plug_p0ne.autocomplete are loaded */
        cb = ->
            addAutocompletion? do
                name: "Ponymotes"
                data: Object.keys(emote_map)
                pre: "[]"
                check: (str, pos) ->
                    if !str[pos+2] or str[pos+2] == "(" and (!str[pos+3] or str[pos+3] == "(/")
                        temp = /^\[\]\(\/([\w#\\!\:\/]+)(\s*["'][^"']*["'])?(\))?/.exec(str.substr(pos))
                        if temp
                            @data = temp.2 || ''
                            return true
                    return false
                display: (items) ->
                    return [{value: "[](/#emote)", image: bpm("[](/#emote)")} for emote in items]
                insert: (suggestion) ->
                    return "#{suggestion.substr(0, suggestion.length - 1)}#{@data})"
        if window.addAutocompletion
            cb!
        else
            $(window) .one \p0ne_autocomplete, cb

/*@source p0ne.song-notif.ls */
/**
 * get fancy song notifications in the chat (with preview thumbnail, description, buttons, …)
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */

#ToDo add proper SoundCloud Support
#   $.ajax url: "https://api.soundcloud.com/tracks/#cid.json?client_id=#{p0ne.SOUNDCLOUD_KEY}"
#   => {permalink_url, artwork_url, description, downloadable}

module \songNotif, do
    require: <[ chatDomEvents ]>
    optional: <[ _$context database auxiliaries app popMenu ]>
    settings: \enableDisable
    setup: ({addListener, $create, $createPersistent, css},,,module_) ->
        @callback = (d) ~>
            try
                skipped = false #ToDo
                skipper = reason = "" #ToDo

                media = d.media
                if not media
                    @$playbackImg .hide!
                    return

                $div = $createPersistent "<div class='update song-notif' data-id='#{media.id}' data-cid='#{media.cid}' data-format='#{media.format}'>"
                html = ""
                time = getTime!
                if media.format == 1  # YouTube
                    mediaURL = "http://youtube.com/watch?v=#{media.cid}"
                    image = "https://i.ytimg.com/vi/#{media.cid}/0.jpg"
                else # if media.format == 2 # SoundCloud
                    #ToDo improve this
                    mediaURL = "https://soundcloud.com/search?q=#{encodeURIComponent media.author+' - '+media.title}"
                    image = media.image
                @$playbackImg
                    .css backgroundImage: "url(#image)"
                    .show!

                duration = mediaTime media.duration
                console.logImg media.image.replace(/^\/\//, 'https://') .then ->
                    console.log "#time [DV_ADVANCE] #{d.dj.username} is playing '#{media.author} - #{media.title}' (#duration)", d

                if window.auxiliaries and window.database
                    timestamp = "<div class='timestamp'>#{auxiliaries.getChatTimestamp(database.settings.chatTS == 24)}</div>"
                else
                    timestamp = ""
                html += "
                    <div class='song-thumb-wrapper'>
                        <img class='song-thumb' src='#image' />
                        <span class='song-duration'>#duration</span>
                        <div class='song-add'><i class='icon icon-add'></i></div>
                        <a class='song-open' href='#mediaURL' target='_blank'><i class='icon icon-chat-popout'></i></a>
                    </div>
                    #timestamp
                    <div class='song-dj'></div>
                    <b class='song-title'></b>
                    <span class='song-author'></span>
                    <div class='song-description-btn'>Description</div>
                "
                $div.html html
                $div .find \.song-dj .text d.dj.username
                $div .find \.song-title .text d.media.title .prop \title, d.media.title
                $div .find \.song-author .text d.media.author

                if media.format == 2sc and p0ne.SOUNDCLOUD_KEY # SoundCloud
                    $div .addClass \loading
                    #$.ajax url: "https://api.soundcloud.com/tracks/#{media.id}.json?client_id=#{p0ne.SOUNDCLOUD_KEY}"
                    mediaLookup media, then: (d) ->
                        .then (d) ->
                            $div .removeClass \loading
                            $div .find \.song-open .attr \href, d.url
                            $div .data \description, d.description
                            if d.download
                                $div .find \.song-download
                                    .attr \href, d.download
                                    .attr \title, "#{formatMB(d.downloadSize / 1_000_000to_mb)} #{if d.downloadFormat then '(.'+that+')' else ''}"
                                $div .addClass \downloadable

                appendChat $div
            catch e
                console.error "[p0ne.notif]" e

        addListener API, \advance, @callback
        if _$context
            addListener _$context, \room:joined, ~>
                @callback media: API.getMedia!

        #== apply stylesheets ==
        loadStyle "#{p0ne.host}/css/p0ne.notif.css"

        #== add video thumbnail to #playback ==
        @$playbackImg = $create \<div>
            .addClass \playback-thumb
            .insertBefore $ '#playback .background'

        #== show current song ==
        if not module_ and API.getMedia!
            @callback media: that, dj: API.getDJ!

        # hide non-playable videos
        addListener _$context, \RestrictedSearchEvent:search, ->
            if window.app?.room?.playback?
                that .onSnoozeClick!
            else
                $ '#playback-controls .snooze' .click!

        #== Grab Songs ==        if not popMenu?
        if popMenu?
            addListener chatDomEvents, \click, \.song-add, ->
                $el = $ this
                $notif = $el.closest \.song-notif-next
                id = $notif.data \id
                format = $notif.data \format
                console.log "[add from notif]", $notif, id, format

                msgOffset = $notif.closest \.song-notif .offset!
                $el.offset = -> # to fix position
                    return { left: msgOffset.left + 17px, top: msgOffset.top + 18px }

                obj = { id: id, format: 1yt }
                obj.get = (name) ->
                    return this[name]
                obj.media = obj

                popMenu.isShowing = false
                popMenu.show $el, [obj]
        else
            css \songNotificationsAdd, '.song-add {display:none}'

        #== search for author ==
        addListener chatDomEvents, \click, \.song-author, ->
            mediaSearch @textContent

        #== description ==
        # disable previous listeners (for debugging)
        #$ \#chat-messages .off \click, \.song-description-btn
        #$ \#chat-messages .off \click, \.song-description
        var $description
        addListener chatDomEvents, \click, \.song-description-btn, (e) ->
            try
                if $description
                    hideDescription! # close already open description

                #== Show Description ==
                $description := $ this
                $notif = $description .closest \.song-notif
                cid    = $notif .data \cid
                format = $notif .data \format
                console.log "[song-notif] showing description", cid, $notif

                if $description .data \description
                    showDescription $notif, that
                else
                    # load description from Youtube
                    console.log "looking up", {cid, format}, do
                        mediaLookup {cid, format}, do
                            success: (data) ->
                                text = formatPlainText data.description # let's get fancy
                                $description .data \description, text
                                showDescription $notif, text
                            fail: ->
                                $description
                                    .text "Failed to load"
                                    .addClass \.song-description-failed

                        .timeout 200ms, ->
                            $description
                                .text "Description loading…"
                                .addClass \loading
            catch e
                console.error "[song-notif]", e


        addListener chatDomEvents, \click, \.song-description, (e) ->
            if not e.target.href
                hideDescription!

        function showDescription $notif, text
                # create description element
                $description.removeClass 'song-description-btn loading'
                    .css opacity: 0, position: \absolute
                    .addClass \song-description
                    .html "#text <i class='icon icon-clear-input'></i>"
                    .appendTo $notif

                # show description (animated)
                h = $description.height!
                $description
                    .css height: 0px, position: \static
                    .animate do
                        opacity: 1
                        height: h
                        -> $description .css height: \auto

                # smooth scroll
                $cm = $ \#chat-messages
                offsetTop = $notif.offset!?.top - 100px
                ch = $cm .height!
                if offsetTop + h > ch
                    $cm.animate do
                        scrollTop: $cm .scrollTop! + Math.min(offsetTop + h - ch + 100px, offsetTop)
                        # 100px is height of .song-notif without .song-description

        function hideDescription
            #== Hide Description ==
            return if not $description
            console.log "[song-notif] closing description", $description
            $notif = $description .closest \.song-notif
            $description.animate do
                opacity: 0
                height: 0px
                ->
                    $ this
                        .css opacity: 1, height: \auto
                        .removeClass 'song-description text'
                        .addClass 'song-description-btn'
                        .text "Description"
                        .appendTo do
                            $notif .find \.song-notif-next
            $description := null

            # smooth scroll
            offsetTop = $notif.offset!?.top - 100px # 100 is # $(\.app-header).height! + $(\#chat-header).height
            if offsetTop < 0px
                cm = $cm!
                cm.animate do
                    scrollTop: $cm .scrollTop! + offsetTop - 100px # -100px is so it doesn't stick to the very top

        @hideDescription = hideDescription

    disable: ->
        @hideDescription!

/*@source p0ne.song-info.ls */
/**
 * plug_p0ne songInfo
 * adds a dropdown with the currently playing song's description when clicking on the now-playing-bar (in the top-center of the page)
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
# maybe add "other videos by artist", which loads a list of other uploads by the uploader?
# http://gdata.youtube.com/feeds/api/users/#{channel}/uploads?alt=json&max-results=10
module \songInfo, do
    optional: <[ _$context ]>
    settings: \enableDisable
    displayName: 'Song-Info Dropdown'
    help: '''
        clicking on the now-playing-bar (in the top-center of the page) will open a panel with the song's description and links to the artist and song.
    '''
    setup: ({addListener, $create, css}) ->
        @$create = $create
        @$el = $create \<div> .addClass \p0ne-song-info .appendTo \body
        @loadBind = @~load
        addListener $(\#now-playing-bar), \click, (e) ~>
            $target = $ e.target
            return if  $target .closest \#history-button .length or $target .closest \#volume .length
            if not @visible # show
                media = API.getMedia!
                if not media
                    @$el .html "Cannot load information if No song playing!"
                else if @lastMedia == media.id
                    API.once \advance, @loadBind
                else
                    @$el .html "loading…"
                    @load media: media
                @$el .addClass \expanded
            else # hide
                @$el .removeClass \expanded
                API.off \advance, @loadBind
            @visible = not @visible
        css \songInfo, '
            #now-playing-bar {
                cursor: pointer;
            }
        '

        return if not _$context
        addListener _$context,  'show:user show:history show:dashboard dashboard:disable', ~> if @visible
            @$el .removeClass \expanded
            API.off \advance, @loadBind
    load: ({media}, isRetry) ->
        console.log "[song-info]", media
        @lastMedia = media
        mediaLookup media, do
            fail: ~>
                if isRetry
                    @$el .html "error loading, retrying…"
                    load {media}, true
                else
                    @$el .html "Couldn't load song info, sorry =("
            success: (d) ~>
                console.log "[song-info] got data", @lastMedia != media
                return if @lastMedia != media or @disabled # skip if another song is already playing

                @$el .html ""
                $meta = @$create \<div>  .addClass \p0ne-song-info-meta        .appendTo @$el
                $parts = {}

                @$create \<span> .addClass \p0ne-song-info-author      .appendTo $meta
                    .click -> mediaSearch media.author
                    .attr \title, "search for '#{media.author}'"
                    .text media.author
                @$create \<span> .addClass \p0ne-song-info-title       .appendTo $meta
                    .click -> mediaSearch media.title
                    .attr \title, "search for '#{media.title}'"
                    .text media.title
                @$create \<br>                                         .appendTo $meta
                @$create \<a> .addClass \p0ne-song-info-uploader       .appendTo $meta
                    .attr \href, "https://www.youtube.com/channel/#{d.uploader.id}"
                    .attr \target, \_blank
                    .attr \title, "open channel of '#{d.uploader.name}'"
                    .text d.uploader.name
                @$create \<a> .addClass \p0ne-song-info-ytTitle        .appendTo $meta
                    .attr \href, "http://youtube.com/watch?v=#{media.cid}"
                    .attr \target, \_blank
                    .attr \title, "open video on Youtube"
                    .text d.title
                @$create \<br>                                         .appendTo $meta
                @$create \<span> .addClass \p0ne-song-info-date        .appendTo $meta
                    .text getISOTime new Date(d.uploadDate)
                @$create \<span> .addClass \p0ne-song-info-duration    .appendTo $meta
                    .text mediaTime +d.duration
                #@$create \<div> .addClass \p0ne-song-info-songStats   #ToDo
                #@$create \<div> .addClass \p0ne-song-info-songStats   #ToDo
                #@$create \<div> .addClass \p0ne-song-info-tags    #ToDo
                @$create \<div> .addClass \p0ne-song-info-description  .appendTo @$el
                    .html formatPlainText(d.description)
                #@$create \<ul> .addClass \p0ne-song-info-remixes      #ToDo
        API.once \advance, @loadBind
    disable: ->
        @$el .remove!

/*@source p0ne.ponify.ls */
/**
 * ponify chat - a script to ponify some words in the chat on plug.dj
 * Text ponification based on http://pterocorn.blogspot.dk/2011/10/ponify.html
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */

/*####################################
#            PONIFY CHAT             #
####################################*/
module \ponify, do
    optional: <[ emoticons ]>
    settings: \enableDisable
    displayName: 'Ponify Chat'
    /*== TEXT ==*/
    map:
        # "america":    "amareica" # this one was driving me CRAZY
        "anybody":      "anypony"
        "anyone":       "anypony"
        "ass":          "flank"
        "asses":        "flanks"
        "boner":        "wingboner"
        "boy":          "colt"
        "boyfriend":    "coltfriend"
        "boyfriends":   "coltfriends"
        "boys":         "colts"
        "bro fist":     "brohoof"
        "bro-fist":     "brohoof"
        "butt":         "flank"
        "butthurt":     "saddle-sore"
        "butts":        "flanks"
        "child":        "foal"
        "children":     "foals"
        "cowboy":       "cowpony"
        "cowboys":      "cowponies"
        "cowgirl":      "cowpony"
        "cowgirls":     "cowponies"
        "disappoint":   "disappony"
        "disappointed": "disappony"
        "disappointment": "disapponyment"
        "doctor who":   "doctor whooves"
        "dr who":       "dr whooves"
        "dr. who":      "dr. whooves"
        "everybody":    "everypony"
        "everyone":     "everypony"
        "fap":          "clop"
        "faps":         "clops"
        "foot":         "hoof"
        "feet":         "hooves"
        "folks":        "foalks"
        "fool":         "foal"
        "foolish":      "foalish"
        "germany":      "germaneigh"
        "gentleman":    "gentlecolt"
        "gentlemen":    "gentlecolts"
        "girl":         "filly"
        "girls":        "fillies"
        "girlfriend":   "fillyfriend"
        "girlfriends":  "fillyfriends"
        "halloween":    "nightmare night"
        "hand":         "hoof"
        "hands":        "hooves"
        "handed":       "hoofed"
        "handedly":     "hoofedly"
        "handers":      "hoofers"
        "handmade":     "hoofmade"
        "hey":          "hay"
        "high-five":    "hoof-five"
        "highfive":     "hoof-five"
        "human":        "pony"
        "humans":       "ponies"
        "ladies":       "fillies"
        # "lobby":      "shed"
        "main":         "mane"
        "man":          "stallion"
        "men":          "stallions"
        "manhattan":    "manehattan"
        "marathon":     "mareathon"
        "miracle":      "mareacle"
        "miracles":     "mareacles"
        "money":        "bits"
        "naysayer":     "neighsayer"
        "no one else":  "nopony else"
        "no-one else":  "nopony else"
        "noone else":   "nopony else"
        "nobody":       "nopony"
        "nottingham":   "trottingham"
        "null":         "nullpony"
        "old-timer":    "old-trotter"
        "people":       "ponies"
        "person":       "pony"
        "persons":      "ponies"
        "philadelphia": "fillydelphia"
        "somebody":     "somepony"
        "someone":      "somepony"
        "stalingrad":   "stalliongrad"
        "sure as hell": "sure as hay"
        "tattoo":       "cutie mark"
        "tattoos":      "cutie mark"
        "da heck":      "da hay"
        "the heck":     "the hay"
        "the hell":     "the hay"
        "troll":        "parasprite"
        "trolls":       "parasprites"
        "trolled":      "parasprited"
        "trolling":     "paraspriting"
        "trollable":    "paraspritable"
        "woman":        "mare"
        "women":        "mares"
        "confound those dover boys":    "confound these ponies"


    ponifyNode: (node) !->
        #console.log "ponifying", node
        if node.nodeType != 3
            for n in node.childNodes ||[]
                @ponifyNode n

        else
            str = node.nodeValue
            hasReplacement = false
            replacement = null
            lastPos = 0
            #str.replace @regexp, (s, pre, i) ~>
            str.replace @regexp, (_, pre, s, post, i) ~>
                w = @map[s.toLowerCase!]
                r = ""

                if not replacement
                    replacement := document.createElement \span
                if str.substring(lastPos, i)
                    replacement.appendChild document.createTextNode that

                if pre
                    if "aeioujyh".has(w.0)
                        replacement.appendChild document.createTextNode "an "
                    else
                        replacement.appendChild document.createTextNode "a "

                /*preserve upper/lower case*/
                lastUpperCaseLetters = 0
                l = s.length <? w.length
                for o from 0 til l
                    if s[o].toLowerCase! != s[o]
                        r += w[o].toUpperCase!
                        lastUpperCaseLetters++
                    else if l >= s.length and lastUpperCaseLetters == 3
                        r += w[o].toUpperCase!
                    else
                        r += w[o]

                r += w.substr l

                document.createElement \abbr
                    ..textContent = "#r"
                    ..classList.add \ponified
                    ..title = s
                    replacement.appendChild ..

                if post
                    if "szxß".has(w[*-1])
                        replacement.appendChild document.createTextNode "' "
                    else
                        replacement.appendChild document.createTextNode "'s "

                lastPos := i + _.length
                console.log "replaced '#s' with '#r'", node

            if replacement
                replacement.appendChild document.createTextNode str.substr(lastPos)
                node.parentNode?.replaceChild replacement, node

    /*== EMOTICONS ==*/
    autoEmotiponies:
        "8)": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowdetermined2.png"
        ":(": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/fluttershysad.png"
        ":)": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twilightsmile.png"
        ":?": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowhuh.png"
        ":B": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twistnerd.png"
        ":D": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiehappy.png"
        ":S": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/unsuresweetie.png"
        ":o": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiegasp.png"
        ":x": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/fluttershbad.png"
        ":|": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/ajbemused.png"
        ";)": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/raritywink.png"
        "<3": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/heart.png"
        "B)": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/coolphoto.png"
        "D:": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/raritydespair.png"
    emotiponies:
        "???": "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/applejackconfused.png"
        aj: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/ajsmug.png"
        applebloom: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/applecry.png"
        applejack: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/ajsmug.png"
        blush: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twilightblush.png"
        cool: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowdetermined2.png"
        cry: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/raritycry.png"
        derp: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/derpyderp2.png"
        derpy: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/derpytongue2.png"
        eek: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/fluttershbad.png"
        evil: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiecrazy.png"
        fluttershy: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/fluttershysad.png"
        fs: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/fluttershysad.png"
        idea: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/raritystarry.png"
        lol: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowlaugh.png"
        loveme: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/flutterrage.png"
        mad: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twilightangry2.png"
        mrgreen: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiesick.png"
        oops: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twilightblush.png"
        photofinish: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/coolphoto.png"
        pinkie: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiesmile.png"
        pinkiepie: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiesmile.png"
        rage: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/flutterrage.png"
        rainbowdash: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowkiss.png"
        rarity: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/raritywink.png"
        razz: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowwild.png"
        rd: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/rainbowkiss.png"
        roll: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/applejackunsure.png"
        sad: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/fluttershysad.png"
        scootaloo: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/scootangel.png"
        shock: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiegasp.png"
        sweetie: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/unsuresweetie.png"
        sweetiebelle: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/unsuresweetie.png"
        trixie: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/trixieshiftright.png"
        trixie2: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/trixieshiftleft.png"
        trixieleft: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/trixieshiftleft.png"
        twi: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twilightsmile.png"
        twilight: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twilightsmile.png"
        twist: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/twistnerd.png"
        twisted: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/pinkiecrazy.png"
        wink: "http://www.bronyland.com/wp-includes/images/smilies/emotiponies/raritywink.png"


    setup: ({addListener, replace, css}) ->
        @regexp = //(\b|an?\s+)(#{Object.keys @map .join '|' .replace(/\s+/g,'\\s*')})('s?)?\b//gi
        addListener API, \chat, ({cid}) ~> if cid
            try
                if getChatText cid .0
                    @ponifyNode that
                else
                    throw "couldn't find message"
            catch err
                console.error "[ponify] Error converting message ##cid", err.stack
        if emoticons?
            aEM = ^^emoticons.autoEmoteMap #|| {}
            for emote, url of @autoEmotiponies
                key = url .replace /.*\/(\w+)\..+/, '$1'
                aEM[emote] = key
                @emotiponies[key] = url
            replace emoticons, \autoEmoteMap, -> return aEM

            m = ^^emoticons.map
            ponyCSS = """
                .ponimoticon { width: 27px; height: 27px }
                .chat-suggestion-item .ponimoticon { margin-left: -5px }
                .emoji-glow { width: auto; height: auto }
                .emoji { position: static; display: inline-block }

            """
            reversedMap = {}
            for emote, url of @emotiponies
                if reversedMap[url]
                    m[emote] = "#{reversedMap[url]} ponimoticon" # hax to add .ponimoticon class
                else
                    reversedMap[url] = emote
                    m[emote] = "#emote ponimoticon" # hax to add .ponimoticon class
                ponyCSS += ".emoji-#emote { background: url(#url) }\n"
            css \ponify, ponyCSS
            replace emoticons, \map, -> return m
            emoticons.update?!
    disable: ->
        emoticons.update?!


/*@source p0ne.avatars.ls */
/**
 * plug_p0ne Custom Avatars
 * adds custom avatars to plug.dj when connected to a plug_p0ne Custom Avatar Server (ppCAS)
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license all rights reserved! You may run the bookmarklet provided to you to run this.
 *          You may NOT read, copy or edit this file. STOP EVEN LOOKING AT IT!
 * @copyright (c) 2014 J.-T. Brinkmann
 */

/* THIS IS A TESTING VERSION! SOME THINGS ARE NOT IMPLEMENTED YET! */
/* (this includes things mentioned in the "notes" section below) */
#== custom Avatars ==
#ToDo:
# - check if the "lost connection to server" warning works as expected (only warn on previous successfull connection)
# - improve hitArea (e.g. audience.drawHitArea)
# - avatar creator / viewer
#   - https://github.com/buzzfeed/libgif-js

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

# users
requireHelper \users, (it) ->
    return it.models?.0?.attributes.avatarID
        and \isTheUserPlaying not of it
        and \lastFilter not of it
window.userID ||= API.getUser!.id
window.user_ ||= users.get(userID) if users?
#=======================


# auxiliaries
window.sleep ||= (delay, fn) -> return setTimeout fn, delay

requireHelper \avatarAuxiliaries, (.getAvatarUrl)
requireHelper \Avatar, (.AUDIENCE)
requireHelper \AvatarList, (._byId?.admin01)
requireHelper \myAvatars, (.comparator == \id) # (_) -> _.comparator == \id and _._events?.reset and (!_.length || _.models[0].attributes.type == \avatar)

window.Lang = require \lang/Lang

window.Cells = requireAll (m) -> m::?.className == \cell and m::getBlinkFrame

module \customAvatars, do
    require: <[ users Lang avatarAuxiliaries Avatar myAvatars ]>
    settings: \enableDisable
    persistent: <[ socket ]>
    setup: ({addListener, replace, css}) ->
        @replace = replace
        console.info "[p0ne avatars] initializing"

        p0ne._avatars = {}

        user = API.getUser!
        hasNewAvatar = localStorage.vanillaAvatarID and localStorage.vanillaAvatarID == user.avatarID
        localStorage.vanillaAvatarID = user.avatarID

        # - display custom avatars
        replace avatarAuxiliaries, \getAvatarUrl, (gAU_) -> return (avatarID, type) ->
            return p0ne._avatars[avatarID]?[type] || gAU_(avatarID, type)
        getAvatarUrl_ = avatarAuxiliaries.getAvatarUrl_
        #replace avatarAuxiliaries, \getHitSlot, (gHS_) -> return (avatarID) ->
        #    return customAvatarManifest.getHitSlot(avatarID) || gHS_(avatarID)
        #ToDo


        # - set avatarID to custom value
        _internal_addAvatar = (d) ->
            # d =~ {category, thumbOffsetTop, thumbOffsetLeft, base_url, anim, dj, b, permissions}
            #   soon also {h, w, standingLength, standingDuration, standingFn, dancingLength, dancingFn}
            avatarID = d.avatarID
            if p0ne._avatars[avatarID]
                delete Avatar.IMAGES[avatarID] # delete image cache
                console.info "[p0ne avatars] updating '#avatarID'"
            else if not d.isVanilla
                console.info "[p0ne avatars] adding '#avatarID'"

            avatar =
                inInventory: false
                category: d.category || \p0ne
                thumbOffsetTop: d.thumbOffsetTop
                thumbOffsetLeft: d.thumbOffsetLeft
                isVanilla: !!d.isVanilla
                permissions: d.permissions || 0
                #h: d.h || 150px
                #w: d.w || 150px
                #standingLength: d.standingLength || 4frames
                #standingDuration: d.standingDuration || 20frames
                #standingFn: if typeof d.standingFn == \function then d.standingFn
                #dancingLength: d.dancingLength || 20frames
                #dancingFn: if typeof d.dancingFn == \function then d.dancingFn

            #avatar.sw = avatar.w * (avatar.standingLength + avatar.dancingLength) # sw is SourceWidth
            if d.isVanilla
                avatar."" = getAvatarUrl_(avatarID, "")
                avatar.dj = getAvatarUrl_(avatarID, \dj)
                avatar.b = getAvatarUrl_(avatarID, \b)
            else
                base_url = d.base_url || ""
                avatar."" = base_url + (d.anim || avatarID+'.png')
                avatar.dj = base_url + (d.dj || avatarID+'dj.png')
                avatar.b = base_url + (d.b || avatarID+'b.png')
            p0ne._avatars[avatarID] = avatar
            if avatar.category not of Lang.userAvatars
                Lang.userAvatars[avatar.category] = avatar.category
            #p0ne._myAvatars[*] = avatar
            if not updateAvatarStore.loading
                updateAvatarStore.loading = true
                requestAnimationFrame -> # throttle to avoid updating every time when avatars get added in bulk
                    updateAvatarStore!
                    updateAvatarStore.loading = false

        export @addAvatar = (avatarID, d) ->
            # d =~ {h, w, standingLength, standingDuration, standingFn, dancingLength, dancingFn, url: {base_url, "", dj, b}}
            if typeof d == \object
                avatar = d
                d.avatarID = avatarID
            else if typeof avatarID == \object
                avatar = avatarID
            else
                throw new TypeError "invalid avatar data passed to addAvatar(avatarID*, data)"
            d.isVanilla = false
            return _internal_addAvatar d
        export @removeAvatar = (avatarID, replace) ->
            for u in users.models
                if u.get(\avatarID) == avatarID
                    u.set(\avatarID, u.get(\avatarID_))
            delete p0ne._avatars[avatarID]



        # - set avatarID to custom value
        export @changeAvatar = (userID, avatarID) ->
            avatar = p0ne._avatars[avatarID]
            if not avatar
                console.warn "[p0ne avatars] can't load avatar: '#{avatarID}'"
                return

            return if not user = users.get userID

            if not avatar.permissions or API.hasPermissions(userID, avatar.permissions)
                user.attributes.avatarID_ ||= user.get \avatarID
                user.set \avatarID, avatarID
            else
                console.warn "user with ID #userID doesn't have permissions for avatar '#{avatarID}'"

            if userID == user_.id
                customAvatars.socket? .emit \changeAvatarID, avatarID
                localStorage.avatarID = avatarID

        export @updateAvatarStore = ->
            # update thumbs
            styles = ""
            avatarIDs = []; l=0
            for avatarID, avi of p0ne._avatars when not avi.isVanilla
                avatarIDs[l++] = avatarID
                styles += "
                    .avi-#avatarID {
                        background-image: url('#{avi['']}')
                "
                if avi.thumbOffsetTop
                    styles += ";background-position-y: #{avi.thumbOffsetTop}px"
                if avi.thumbOffsetLeft
                    styles += ";background-position-x: #{avi.thumbOffsetLeft}px"
                styles += "}\n"
            if l
                css \p0ne_avatars, "
                    .avi {
                        background-repeat: no-repeat;
                    }\n
                    .thumb.small .avi-#{avatarIDs.join(', .thumb.small .avi-')} {
                        background-size: 1393px; /* = 836/15*24 thumbsWidth / thumbsCount * animCount*/
                    }\n
                    .thumb.medium .avi-#{avatarIDs.join(', .thumb.medium .avi-')} {
                        background-size: 1784px; /* = 1115/15*24 thumbsWidth / thumbsCount * animCount*/
                    }\n
                    #styles
                "

            # update store
            vanilla = []; l=0
            categories = {}
            for avatarID, avi of p0ne._avatars when avi.inInventory /*TEMP FIX*/ or not avi.isVanilla
                # the `or not avi.isVanilla` should be removed as soon as the server is fixed
                if avi.isVanilla
                    # add vanilla avatars later to have custom avatars in the top
                    vanilla[l++] = new Avatar(id: avatarID, category: avi.category, type: \avatar)
                else
                    categories[][avi.category][*] = avatarID
            myAvatars.models = [] #.splice 0 # empty it
            l = 0
            for category, avis of categories
                for avatarID in avis
                    myAvatars.models[l++] = new Avatar(id: avatarID, category: category, type: \avatar)
            myAvatars.models ++= vanilla
            myAvatars.length = myAvatars.models.length
            myAvatars.trigger \reset, false
            console.log "[p0ne avatars] store updated"
            return true
        addListener myAvatars, \reset, (vanillaTrigger) ->
            console.log "[p0ne avatars] store reset"
            updateAvatarStore! if vanillaTrigger



        Lang.userAvatars.p0ne = "Custom Avatars"

        # - add vanilla avatars
        for {id:avatarID, attributes:{category}} in AvatarList.models
            _internal_addAvatar do
                avatarID: avatarID
                isVanilla: true
                category: category
                #category: avatarID.replace /\d+$/, ''
                #category: avatarID.substr(0,avatarID.length-2) damn you "tastycat"
        console.log "[p0ne avatars] added internal avatars", p0ne._avatars
        # - fix Avatar selection -
        for Cell in window.Cells
            replace Cell::, \onClick, (oC_) -> return ->
                console.log "[p0ne avatars] Avatar Cell click", this
                avatarID = this.model.get("id")
                if /*not this.$el.closest \.inventory .length or*/ p0ne._avatars[avatarID].isVanilla and p0ne._avatars[avatarID].inInventory
                    # if avatatar is in the Inventory or not bought, properly select it
                    oC_ ...
                else
                    # if not, hax-apply it
                    changeAvatar(userID, avatarID)
                    this.onSelected!
        # - get avatars in inventory -
        $.ajax do
            url: '/_/store/inventory/avatars'
            success: (d) ->
                avatarIDs = []; l=0
                for avatar in d.data
                    avatarIDs[l++] = avatar.id
                    if not  p0ne._avatars[avatar.id]
                        _internal_addAvatar do
                            avatarID: avatar.id
                            isVanilla: true
                            category: avatar.category
                    p0ne._avatars[avatar.id] .inInventory = true
                        #..category = d.category
                updateAvatarStore!
                /*requireAll (m) ->
                    return if not m._models or not m._events?.reset
                    m_avatarIDs = ""
                    for el, i in m._models
                        return if avatarIDs[i] != el
                */

        if not hasNewAvatar and localStorage.avatarID
            changeAvatar(userID, that)




        /*####################################
        #         ppCAS Integration          #
        ####################################*/
        @oldBlurb = API.getUser!.blurb
        @blurbIsChanged = false

        urlParser = document.createElement \a
        addListener API, \chatCommand, (str) ~>
            #str = "/ppcas https://p0ne.com/_" if str == "//" # FOR TESTING ONLY
            if 0 == str .toLowerCase! .indexOf "/ppcas"
                server = $.trim str.substr(6)
                if server == "<url>"
                    API.chatLog "hahaha, no. You have to replace '<url>' with an actual URL of a ppCAS server, otherwise it won't work.", true
                else if server == "."
                    # Veteran avatars
                    helper = (fn) ->
                        fn = window[fn]
                        for avatarID in <[ su01 su02 space03 space04 space05 space06 ]>
                            fn avatarID, do
                                category: "Veteran"
                                base_url: base_url
                                thumbOffsetTop: -5px
                        fn \animal12, do
                            category: "Veteran"
                            base_url: base_url
                            thumbOffsetTop: -19px
                            thumbOffsetLeft: -16px
                        for avatarID in <[ animal01 animal02 animal03 animal04 animal05 animal06 animal07 animal08 animal09 animal10 animal11 animal12 animal13 animal14 lucha01 lucha02 lucha03 lucha04 lucha05 lucha06 lucha07 lucha08 monster01 monster02 monster03 monster04 monster05 _tastycat _tastycat02 warrior01 warrior02 warrior03 warrior04 ]>
                            fn avatarID, do
                                category: "Veteran"
                                base_url: base_url
                                thumbOffsetTop: -10px

                    @socket = close: ->
                        helper \removeAvatar
                        delete @socket
                    helper \addAvatar
                urlParser.href = server
                if urlParser.host != location.host
                    console.log "[p0ne avatars] connecting to", server
                    @connect server
                else
                    console.warn "[p0ne avatars] invalid ppCAS server"

        @connect 'https://p0ne.com/_'

    connect: (url, reconnecting, reconnectWarning) ->
        if not reconnecting and @socket
            return if url == @socket.url and @socket.readyState == 1
            @socket.close!
        console.log "[p0ne avatars] using socket as ppCAS avatar server"
        reconnect = true
        connected = false

        if reconnectWarning
            setTimeout (-> if not connected then API.chatLog "[p0ne avatars] lost connection to avatar server \xa0 =("), 10_000ms

        @socket = new SockJS(url)
        @socket.url = url
        @socket.on = @socket.addEventListener
        @socket.off = @socket.removeEventListener
        @socket.once = (type, callback) -> @on type, -> @off type, callback; callback ...

        @socket.emit = (type, ...data) ->
            console.log "[ppCAS] > [#type]", data
            this.send JSON.stringify {type, data}

        @socket.trigger = (type, args) ->
            args = [args] if typeof args != \object or not args.length
            listeners = @_listeners[type]
            if listeners
                for fn in listeners
                    fn .apply this, args
            else
                console.error "[ppCAS] unknown event '#type'"

        @socket.onmessage = ({data: message}) ~>
            try
                {type, data} = JSON.parse(message)
                console.log "[ppCAS] < [#type]", data
            catch e
                console.warn "[ppCAS] invalid message received", message, e
                return

            @socket.trigger type, data

        replace @socket, close, (close_) ~> return ->
                @trigger close
                close_ ...


        @socket.on \authToken, (authToken) ~>
            console.log "[ppCAS] authToken: ", authToken
            user = API.getUser!
            @oldBlurb = user.blurb || ""
            if not user.blurb # user.blurb is actually `null` by default, not ""
                newBlurb = authToken
            else if user.blurb.length >= 73
                newBlurb = "#{user.blurb.substr(0, 72)}… #authToken"
            else
                newBlurb = "#{user.blurb} #authToken"

            @blurbIsChanged = true
            @changeBlurb newBlurb, do
                success: ~>
                    @blurbIsChanged = false
                    @socket.emit \auth, userID
                error: ~>
                    console.error "[ppCAS] failed to authenticate by changing the blurb."
                    @changeBlurb @oldBlurb, success: ->
                        console.info "[ppCAS] blurb reset."

        @socket.on \authAccepted, ~>
            console.log "[ppCAS] authAccepted"
            connected := true
            reconnecting := false
            @changeBlurb @oldBlurb, do
                success: ~>
                    @blurbIsChanged = false
                error: ~>
                    API.chatLog "[p0ne avatars] failed to authenticate to avatar server, maybe plug.dj is down or changed it's API?"
                    @changeBlurb @oldBlurb, error: ->
                        console.error "[ppCAS] failed to reset the blurb."
        @socket.on \authDenied, ~>
            console.warn "[ppCAS] authDenied"
            API.chatLog "[p0ne avatars] authentification failed"
            @changeBlurb @oldBlurb, do
                success: ~>
                    @blurbIsChanged = false
                error: ~>
                    @changeBlurb @oldBlurb, error: ->
                        console.error "[ppCAS] failed to reset the blurb."
            API.chatLog "[p0ne avatars] Failed to authenticate with user id '#userID'", true

        @socket.on \avatars, (avatars) ~>
            console.log "[ppCAS] avatars", avatars
            user = API.getUser!
            @socket.avatars = avatars
            requestAnimationFrame initUsers if @socket.users
            for avatarID, avatar of avatars
                addAvatar avatarID, avatar
            if localStorage.avatarID of avatars
                changeAvatar userID, localStorage.avatarID
            else if user.avatarID of avatars
                @socket.emit \changeAvatarID, user.avatarID

        @socket.on \users, (users) ~>
            console.log "[ppCAS] users", users
            @socket.users = users
            requestAnimationFrame initUsers if @socket.avatars

        # initUsers() is used by @socket.on \users and @socket.on \avatars
        ~function initUsers avatarID
            for userID, avatarID of @socket.users
                console.log "[ppCAS] change other's avatar", userID, "(#{users.get userID ?.get \username})", avatarID
                @changeAvatar userID, avatarID
            #API.chatLog "[p0ne avatars] connected to ppCAS"
            if reconnecting
                API.chatLog "[p0ne avatars] reconnected"
            #else
            #    API.chatLog "[p0ne avatars] avatars loaded. Click on your name in the bottom right corner and then 'Avatars' to become a :horse: pony!"
        @socket.on \changeAvatarID, (userID, avatarID) ->
            console.log "[ppCAS] change other's avatar:", userID, avatarID

            users.get userID ?.set \avatarID, avatarID

        @socket.on \disconnect, (userID) ->
            console.log "[ppCAS] user disconnected:", userID
            @changeAvatarID userID, avatarID

        @socket.on \close, (reason) ->
            console.warn "[ppCAS] connection closed", reason
            reconnect := false
        @socket.onclose = (e) ~>
            console.warn "[ppCAS] DISCONNECTED", e
            return if e.wasClean
            if reconnect
                if connected
                    console.log "[ppCAS] reconnecting…"; @connect(url, true, true)
                else
                    sleep 5_000ms + Math.random()*5_000ms, ->
                        console.log "[ppCAS] reconnecting…"
                        @connect(url, true, false)


    changeBlurb: (newBlurb, options={}) ->
        $.ajax do
            method: \PUT
            url: '/_/profile/blurb'
            contentType: \application/json
            data: JSON.stringify(blurb: newBlurb)
            success: options.success
            error: options.error

        #setTimeout (-> @socket.emit \reqAuthToken if not connected), 5_000ms

    disable: ->
        @changeBlurb @oldBlurb if @blurbIsChanged
        @socket? .close!
        for avatarID, avi of p0ne._avatars
            avi.inInventory = false
        @updateAvatarStore!
        for ,user of users.models when user.attributes.avatarID_
            user.set \avatarID, that
    #API.chatLog "[ppCAS] custom avatar script loaded. type '/ppCAS <url>' into chat to connect to an avatar server :horse:"

/*@source p0ne.settings.ls */
/**
 * Settings pane for plug_p0ne
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
module \p0neSettings, do
    setup: ({$create, addListener},,,oldModule) ->
        @$create = $create

        # create DOM elements
        @$ppM = $create "<div id=p0ne_menu>"
            .insertAfter \#app-menu
        @$ppI = $create "<div class=p0ne_icon>p<div class=p0ne_icon_sub>0</div></div>"
            .appendTo @$ppM
        @$ppS = $create "<div class=p0ne_settings>"
            .appendTo @$ppM
            .slideUp 0
        @$ppP = $ppP = $create "<div class=p0ne_settings_popup>"
            .appendTo @$ppS
            .fadeOut 0

        # add toggles for existing modules
        for module in p0ne.modules
            @addModule module

        # migrate modules from previous p0ne instance
        if oldModule and oldModule.p0ne != p0ne
            for module in oldModule.p0ne.modules when window[module.name] == module
                @addModule module
        @p0ne = p0ne

        # add DOM event listeners
        @$ppI .click @$ppS.~slideToggle
        addListener @$ppS, \click, \.checkbox, ->
            # note: this gets triggered when anything in the <label> is clicked
            $this = $ this
            enable = this .checked
            $el = $this .closest \.p0ne_settings_item
            module = $el.data \module
            console.log "[p0neSettings] toggle", module.displayName, "=>", enable
            if enable
                module.enable!
            else
                module.disable!
        addListener @$ppS, \mouseover, \.p0ne_settings_has_more, ->
            $this = $ this
            module = $this .data \module
            $ppP
                .html "
                    <h3>#{module.displayName}</h3>
                    #{if!   module.screenshot   then'' else
                        '<img src='+module.screenshot+'>'
                    }
                    #{module.help}
                "
            h = $ppP .height!
            t = $this .offset! .top
            $ppP
                .css \top, t - h >? 0px
                .stop!.fadeIn!
        addListener @$ppS, \mouseout, \.p0ne_settings_has_more, ->
            $ppP .stop!.fadeOut!

        # add p0ne.module listeners
        addListener API, \p0neModuleLoaded, @~addModule
        addListener API, \p0neModuleDisabled, (module) ~>
            module._$settings? .find \.checkbox .0 .checked=false
        addListener API, \p0neModuleEnabled, (module) ~>
            module._$settings? .find \.checkbox .0 .checked=true
        addListener API, \p0neModuleUpdated, (module) ~>
            if module._$settings
                module._$settings .find \.checkbox .0 .checked=true
                module._$settings .addClass \updated
                sleep 2_000ms, ->
                    module._$settings .removeClass \updated

    addModule: (module) !->
        if module.settings
            module.more = typeof module.settings == \function
            itemClasses = \p0ne_settings_item
            icons = ""
            for k in <[ more help screenshot ]> when module[k]
                icons += "<div class=p0ne_settings_#k></div>"
            if icons.length
                icons = "<div class=p0ne_settings_icons>#icons</div>"
                itemClasses += ' p0ne_settings_has_more'

            @$ppS .append do
                # $create doesn't have to be used, because the resulting elements are appended to a $create'd element
                module._$settings = $ "
                        <label class='#itemClasses'>
                            <input type=checkbox class=checkbox #{if module.disabled then '' else \checked} />
                            <div class=togglebox><div class=knob></div></div>
                            #{module.displayName}
                            #icons
                        </label>
                    "
                    .data \module, module
    updateSettings: (m) ->
        @$ppS .html ""
        for module in p0ne.modules
            @addModule module
    /*
    updateSettingsThrottled: (m) ->
        return if throttled or not m.settings
        @throttled = true
        requestAnimationFrame ~>
            @updateSettings!
            @throttled = false
    */

/*@source p0ne.dev.ls */
/**
 * plug_p0ne dev
 * a set of plug_p0ne modules for usage in the console
 * They are not used by any other module
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
/*####################################
#           LOG EVERYTHING           #
####################################*/
module \logEventsToConsole, do
    optional: <[ _$context  socketListeners ]>
    displayName: "[dev] Log Events to Console"
    settings: true
    setup: ({addListener, replace}) ->
        addListener API, \chat, (data) ->
            message = htmlUnescape(data.message) .replace(/\u202e/g, '\\u202e')
            if data.un
                name = data.un .replace(/\u202e/g, '\\u202e') + ":"
                name = " " * (24 - name.length) + name
                console.log "#{getTime!} [CHAT]", "#name #message"
            else
                name = "[system]"
                console.info "#{getTime!} [CHAT]", "#name #message"

        addListener API, \userJoin, (data) ->
            name = htmlUnescape(data.username) .replace(/\u202e/g, '\\u202e')
            console.log "#{getTime!} + [JOIN]", data.id, name, "(#{getRank data})", data
        addListener API, \userLeave, (data) ->
            name = htmlUnescape(data.username) .replace(/\u202e/g, '\\u202e')
            console.log "#{getTime!} - [LEAVE]", data.id, name, "(#{getRank data})", data

        return if not window._$context
        addListener _$context, \PlayMediaEvent:play, (data) ->
            #data looks like {type: "PlayMediaEvent:play", media: n.hasOwnProperty.i, startTime: "1415645873000,0000954135", playlistID: 5270414, historyID: "d38eeaec-2d26-4d76-8029-f64e3d080463"}

            console.log "#{getTime!} [SongInfo]", "playlist:",data.playlistID, "historyID:",data.historyID

        #= log (nearly) all _$context events
        replace _$context, \trigger, (trigger_) -> return (type) ->
            group = type.substr(0, type.indexOf ":")
            if group not in <[ socket tooltip djButton chat sio playback playlist notify drag audience anim HistorySyncEvent user ShowUserRolloverEvent ]> and type not in <[ ChatFacadeEvent:muteUpdate PlayMediaEvent:play userPlaying:update context:update ]> or window.LOGALL
                console.log "#{getTime!} [#type]", getArgs?! || arguments
            else if group == \socket and type not in <[ socket:chat socket:vote socket:grab socket:earn ]>
                console.log "#{getTime!} [#type]", [].slice.call(arguments, 1)
            /*else if type == "chat:receive"
                data = &1
                console.log "#{getTime!} [CHAT]", "#{data.from.id}:\t", data.text, {data}*/
            try
                return trigger_ ...
            catch e
                console.error "[_$context] Error when triggering '#type'", window.e=e

        #= try-catch API event listeners =
        replace API, \trigger, (trigger_) -> return (type) ->
            try
                return trigger_ ...
            catch e
                console.error "[API] Error when triggering '#type'", (export e).stack


/*####################################
#             DEV TOOLS              #
####################################*/
module \downloadLink, do
    setup: ({css}) ->
        css \downloadLink, '
            .p0ne_downloadlink::before {
                content: " ";
                position: absolute;
                margin-top: -6px;
                margin-left: -27px;
                width: 30px;
                height: 30px;
                background-position: -140px -280px;
                background-image: url(/_/static/images/icons.26d92b9.png);
            }
        '
    module: (name, filename, data) ->
        if not data
            data = filename; filename = name
        data = JSON.stringify data if typeof data != \string
        url = URL.createObjectURL new Blob([data], {type: \text/plain})
        (window.$cm || $ \#chat-messages) .append "
            <div class='message p0ne_downloadlink'>
                <i class='icon'></i>
                <span class='text'>
                    <a href='#url' download='#filename'>#name</a>
                </span>
            </div>
        "


# DEBUGGING
window <<<<
    searchEvents: (regx) ->
        regx = new RegExp(regx, \i) if regx not instanceof RegExp
        return [k for k of _$context?._events when regx.test k]


    listUsers: ->
        res = ""
        for u in API.getUsers!
            res += "#{u.id}\t#{u.username}\n"
        console.log res
    listUsersByAge: ->
        a = API.getUsers! .sort (a,b) ->
            a = +a.dateJoined.replace(/\D/g,'')
            b = +b.dateJoined.replace(/\D/g,'')
            return (a > b && 1) || (a == b && 0) || -1

        for u in a
            console.log u.dateJoined.replace(/T|\..+/g, ' '), u.username
    joinRoom: (slug) ->
        ajax \POST, \rooms/join, {slug}

    getUserData: (user) !->
        if typeof user == \number
            return $.get "/_/users/#user"
                .then ({[user]:data}) ->
                    console.log "[userdata]", user
                    console.log "[userdata] https://plug.dj/@/#{encodeURI user.slug}" if user.level >= 5
                .fail ->
                    console.warn "couldn't get slug for user with id '#{id}'"
        else if typeof user == \string
            user .= toLowerCase!
            for u in API.getUsers! when u.username.toLowerCase! == user
                return getUserData u.id
            console.warn "[userdata] user '#user' not found"
            return null

    findModule: (test) ->
        if typeof test == \string and window.l
            test = l(test)
        res = []
        for id, module of require.s.contexts._.defined when module
            if test module, id
                module.id ||= id
                console.log "[findModule]", id, module
                res[*] = module
        return res

    validateUsername: (username, ignoreWarnings, cb) !->
        if typeof ignoreWarnings == \function
            cb = ignoreWarnings; ignoreWarnings = false
        else if not cb
            cb = (slug, err) -> console[err && \error || \log] "username '#username': ", err || slug

        if not ignoreWarnings
            if length < 2
                cb(false, "too short")
            else if length >= 25
                cb(false, "too long")
            else if username.has("/")
                cb(false, "forward slashes are not allowed")
            else if username.has("\n")
                cb(false, "line breaks are not allowed")
            else
                ignoreWarnings = true
        if ignoreWarnings
            return $.getJSON "https://plug.dj/_/users/validate/#{encodeURIComponent username}", (d) ->
                cb(d && d.data.0?.slug)

    getRequireArg: (haystack, needle) ->
        # this is a helper function to be used in the console to quickly find a module ID corresponding to a parameter and vice versa in the head of a javascript requirejs.define call
        # e.g. getRequireArg('define( "da676/a5d9e/a7e5a/a3e8f/fa06c", [ "jquery", "underscore", "backbone", "da676/df0c1/fe7d6", "da676/ae6e4/a99ef", "da676/d8c3f/ed854", "da676/cba08/ba3a9", "da676/cba08/ee33b", "da676/cba08/f7bde", "da676/cba08/d0509", "da676/eb13a/b058e/c6c93", "da676/eb13a/b058e/c5cd2", "da676/eb13a/f86ef/bff93", "da676/b0e2b/f053f", "da676/b0e2b/e9c55", "da676/a5d9e/d6ba6/f3211", "hbs!templates/room/header/RoomInfo", "lang/Lang" ], function( e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g ) {', 'u') ==> "da676/cba08/ee33b"
        [b, a] = haystack.split "], function("
        a .= substr(b.0.indexOf('"')).split('", "')
        b .= substr(0, b.1.indexOf(')')).split(', ')
        if b[a.indexOf(needle)]
            try window[that] = require needle
            return that
        else if a[b.indexOf(needle)]
            try window[needle] = require that
            return that



    logOnce: (base, event) ->
        if not event
            event = base
            if -1 != event.indexOf \:
                base = _$context
            else
                base = API
        base.once \event, (...args) ->
            console.log "[#{event .toUpperCase!}]", args

    usernameToSlug: (un) ->
        htmlEscape(un).replace /[&;\s]+/g, '-'
        # some more characters get collapsed
        # some characters get converted to \u####

    ghost: ->
        $.get '/'

module \renameUser, do
    require: <[ users ]>
    module: (idOrName, newName) ->
        u = users.get(idOrName)
        if not u
            idOrName .= toLowerCase!
            for user in users.models when user.attributes.username.toLowerCase! == idOrName
                u = user; break
        if not u
            return console.error "[rename user] can't find user with ID or name '#idOrName'"
        u.set \username, newName
        id = u.id

        if not rup = window.p0ne.renameUserPlugin
            rup = window.p0ne.renameUserPlugin = (d) !->
                d.un = rup[d.fid] || d.un
            window.p0ne.chatPlugins?[*] = rup
        rup[id] = newName


do ->
    window._$events = {}
    for k,v of _$context?._events
        window._$events[k.replace(/:/g,'_')] = v


module \export_, do
    require: <[ downloadLink ]>
    exportRCS: ->
        # $ '.p0ne_downloadlink' .remove!
        for k,v of localStorage
            downloadLink "plugDjChat '#k'", k.replace(/plugDjChat-(.*?)T(\d+):(\d+):(\d+)\.\d+Z/, "$1 $2.$3.$4.html"), v

    exportPlaylists: ->
        # $ '.p0ne_downloadlink' .remove!
        for let pl in playlists
            $.get "/_/playlists/#{pl.id}/media" .then (data) ->
                downloadLink "playlist '#{pl.name}'",  "#{pl.name}.txt", data



window.copyChat = (copy) ->
    $ '#chat-messages img' .fixSize!
    host = p0ne.host
    res = """
        <head>
        <title>plug.dj Chatlog #{getTime!} - #{getRoomSlug!} (#{API.getUser!.username})</title>
        <!-- basic chat styling -->
        #{ $ "head link[href^='https://cdn.plug.dj/_/static/css/app']" .0 .outerHTML }
        <link href='https://dl.dropboxusercontent.com/u/4217628/css/fimplugChatlog.css' rel='stylesheet' type='text/css'>
    """

    res += getCustomCSS true
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

    res += """\n
        </head>
        <body id="chatlog">
        #{$ \.app-right .html!
            .replace(/https:\/\/api\.plugCubed\.net\/proxy\//g, '')
            .replace(/src="\/\//g, 'src="https://')
        }
        </body>
    """
    copy res
