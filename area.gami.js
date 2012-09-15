;(function ($) {

    var functions = {
            text: text,
            line: line,
            word: word,

            pos:    pos,
            lineNo: lineNo,
            charNo: charNo,

            lineStart:  lineStart,
            lineEnd:    lineEnd,
            lineBefore: lineBefore,
            lineAfter:  lineAfter,

            wordStart: wordStart,
            wordEnd:   wordEnd,

            xy: xy,
            x:  x,
            y:  y
        }
        ;


/* --- Base Textarea Properties --- */

    // Position of caret in text


    // Text as string



/* --- General Textarea Properties --- */

// Text
    // Base properties
    function text(area) { return area.text || getText(area.ta); }
    function pos(area)  { return area.pos  || getCaretPosition(area.ta); }

    // Text before/after caret
    function before(area) { return text(area).substring(0, pos(area)); }
    function after(area)  { return text(area).substring(   pos(area)); }

// Lines
    function lines(area)   { return toLines(text(area)); }
    function noLines(area) { return lines(area).length;  }

    // Lines until/after caret, including partial current line
    function beforeLines(area) { return toLines(before(area)); }
    function afterLines(area)  { return toLines( after(area));  }

    // Complete lines until/after caret
    function linesBefore(area) { return beforeLines(area).slice(0, -1); }
    function linesBefore(area) { return  afterLines(area).slice(1);     }

// Current Line
    // Text of current line
    // Passes text
    function line(area) {
        area.text = area.text || text(area);
        return lines(text(area))[lineNo(area)];
    }

    function lineNo(area)     { return beforeLines(area).length; }

    // Text of current line before/after caret
    function lineBefore(area) { return beforeLines(area).slice(-1); }
    function lineAfter(area)  { return  afterLines(area)[0]; }

    // Position of caret in current line / distance from caret to end of current line
    function linePos(area)  { return lineBefore(area).length; }
    function lineDist(area) { return  lineAfter(area).length; }

    // Index in text where line starts
    // Passes position
    function lineStart(area) {
        area.pos = area.pos || pos(area);
        return pos - linePos(area);
    }

    // Index in text where line ends
    // Passes position
    function lineEnd(area) {
        area.pos = area.pos || pos(area);
        return pos + lineDist(area);
    }

// Words
    function words(area)   { return toWords(line(area)); }
    function noWords(area) { return words(area).length;  }

    // Words until/after caret in current line, including partial current word
    function beforeWords(area) { return toWords(lineBefore(area)); }
    function afterWords(area)  { return toWords(lineAfter(area));  }

    // Complete words until/after caret in current line
    function wordsBefore(area) { return beforeWords(area).slice(0, -1); }
    function wordsAfter(area)  { return afterWords(area).slice(1);      }

    // All words in text
    function allWords(area)  { return toWords(text(area));   }
    function wordCount(area) { return allWords(area).length; }

    // Words until/after caret in text, including partial current word
    function allBeforeWords(area) { return toWords(before(area)); }
    function allAfterWords(area)  { return toWords(after(area));  }

    // Complete words until/after caret in text
    function allWordsBefore(area) { return allBeforeWords(area).slice(0, -1); }
    function allWordsAfter(area)  { return allAfterWords(area).slice(1);      }

// Current Word
    // Text of current word
    // Passes position and text
    function word(area) {
        area.text = area.text || text(area);
        area.pos  = area.pos  ||  pos(area);
        return wordBefore(area) + wordAfter(area);
    }

    // Text of current word before/after caret
    function wordBefore(area) { return beforeWords(area).slice(-1); }
    function wordAfter(area)  { return  afterWords(area)[0];        }

    // Position of caret in current word / distance from caret to end of current word
    function wordPos(area)  { return wordBefore(area).length; }
    function wordDist(area) { return  wordAfter(area).length; }

    // Index in text where word starts
    // Passes position
    function wordStart(area) {
        area.pos = area.pos || pos(area);
        return pos - wordPos(area);
    }

    // Index in text where word ends
    // Passes position
    function wordEnd(area) {
        area.pos = area.pos || pos(area);
        return pos + wordDist(area);
    }

    // Index in line where word starts
    // Passes position
    function lineWordStart(area) {
        area.pos = area.pos || pos(area);
        return linePos(area) - wordPos(area);
    }

    // Index in line where word ends
    // Passes position
    function lineWordEnd(area) {
        area.pos = area.pos || pos(area);
        return linePos(area) + wordDist(area);
    }

// Pixel Position
    function XY(area) {
        var beforeLines = beforeLines(area)
          , lineBefore =  beforeLines.splice(-1)

          , areaWidth = area.width
          , width = $('#copy').html(lineBefore).width

          , rmndr = width % areaWidth
          , wraps = (areaWidth - rmndr) / width;

        return {
            x: rmndr
            y: (beforeLines.length + wraps) * lineHeight,
            // TODO: this needs to account for the wraps in every line
    }

    function lineXY(area) {
    }

    function lineEndXY(area) {
    }

    function wordXY(area) {
    }

    function wordEndXY(area) {
    }

/* -- Utility Functions --- */

    // Split into lines
    function toLines(text) {
        return text.split('\n');
    }

    // Split into words
    function toWords(text) {
        return text.split(/[^a-zA-Z-']+/)
    }

    // Get pixel coordinates from linesBefore and offset
    function toXY(text, position) {

    }


/* --- Jquery Support --- */

    if ($) {

        // Add gami object to jQuery
        $.fn.gami = function (method) {
            var textarea = getNativeArea(this);
            return textarea ? functions[method](textarea) : null;
        };
    }

/* --- Browser-level - subject to browser incompatabilities --- */

    // Add array last function
    if(!Array.prototype.last) {
        Array.prototype.last = function() {
            return this[this.length - 1];
        }
    }

    function getNativeArea(el) {
        el = el.jquery ? el.get(0) : el;
        return (el && el instanceof HTMLElement &&
               (el.nodeName.toLowerCase === 'textarea')) ? el : null;
    }

    function getText(area) {
        // TODO: test getText for browser compaareability
        return area.value;
    }


    function getCaretPosition(area) {
        var position = 0;

        // IE Support
        if (document.selection) {
            area.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -area.value.length);
            position = sel.text.length - selLen;

        } else if (area.selectionStart || area.selectionStart == '0') {
            position = area.selectionStart;
        }

        return position;
    }

    function setCaretPosition(area, index) {
        if (area.setSelectionRange) {
            area.setSelectionRange(index, index);
        } else if (area.createTextRange) {
            var range = area.createTextRange();
            range.collapse(true);
            range.moveEnd('character', index);
            range.moveStart('character', index);
            range.select();
        }
    }

    // TODO: convert not to use jQuery
    function selectAll(area) {
        var textarea = this.textarea;
        textarea.select();

        // Chrome support
        textarea.mouseup(function() {
            // Prevent further mouseup intervention
            textarea.unbind("mouseup");
            return false;
        });
    }

    function hasSelection(area) {
        return document.selection ? // IE support
               document.selection.getRange().text.length > 0 :

               // All other browsers
               area.selectionStart !== area.selectionEnd;
    }

    // TODO: convert not to use jQuery
    function getTextWidth(text) {
        return this.$('#line-copy').html(text).width();
    }

// Use window.jQuery to avoid ReferenceError when jQuery is not defined
})(window.jQuery);
