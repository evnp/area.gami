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
    function pos(area) {
        return area.pos || getCaretPosition(area.ta);
    }

    // Text as string
    function text(area) {
        return area.text || getText(area.ta);
    }


/* --- General Textarea Properties --- */

    // Text before caret
    function before(area) {
        return text(area).substring(0, pos(area));
    }

    // Text after caret
    function after(area) {
        return text(area).substring(pos(area));
    }

    // Number of current line
    function lineNo(area) {
        return lines(before(area)).length;
    }

    // Text of current line before caret
    function lineBefore(area) {
        return lines(before(area)).slice(-1);
    }

    // Text of current line after caret
    function lineAfter(area) {
        return lines(after(area))[0];
    }

    // Length of current line
    function lineLength(area) {
        return line(area).length;
    }

    // Position of caret in current line
    function linePos(area) {
        return lineBefore(area).length;
    }

    // Distance from caret to end of current line
    function lineDist(area) {
        return lineAfter(area).length;
    }


/* --- Multi-Dependant Textarea Properties --- */
/*
 * These properties depend on multiple lower-level
 * properties; position|text calculated beforehand
 * so that value can be re-used in each function.
 */

    // Text and caret position in current line
    // Passes text
    function line(area) {
        area.text = area.text || text(area);
        return lines(text(area))[lineNo(area)];
    }

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

    // Word at caret position
    // Passes position and text
    function word(area) {
        area.text = area.text || text(area);
        area.pos  = area.pos  ||  pos(area);

        var before = lineBefore(area)
          , after  = lineAfter(area)
          , regex  = /[^a-zA-Z'-']+/;

        return before.split(regex).slice(-1) +
                after.split(regex)[0];
    }

    function xy(area) {
    }

    function x(area) {
    }

    function y(area) {


/* -- Utility Functions --- */

    // Text split into lines
    function lines(text) {
        return text.split('\n');
    }


/* -- Utility Functions --- */

    // Text split into lines
    function lines(text) {
        return text.split('\n');
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
