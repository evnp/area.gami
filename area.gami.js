;(function ($) {

    function text(area) {
        return getText(area);
    }

    function position(area) {
        return getCaretPosition(area);
    }

    function lineBefore(area) {
        return cache.text(area).substring(0, cache.position(area));
    }

    function lineAfter(area) {
        return cache.text(area).substring(cache.position(area));
    }

    function lineStart(area) {
        return cache.before(area).lastIndexOf('\n') + 1;
    }

    function lineEnd(area) {
        var after = cache.after(area)
          , index = after.indexOf('\n');
        return (index === -1 ? after.length : index) + cache.position(area);
    }

    function line(area) {
        return cache.text(area).substring(
            cache.lineStart(area),
            cache.lineEnd(area)
        );
    }

    function lineNo(area) {
        var newlines = cache.before(area).match(/\n/g);
        return newlines ? newlines.length + 1 : 1;
    }

    function charNo(area) {
        return cache.position(area) - cache.lineStart(area);
    }

    function word(area) {
        var line   = cache.line(area)
          , lineNo = cache.lineNo(area)
          , s = e  = cache.charNo(area)
          , chars  = /[a-zA-Z'-]/;

        // Get the start and end boundries of the word
        while (line[s-1] && chars.test(line[s-1])) s--;
        while (line[e]   && chars.text(line[e]  )) e++;

        return line.substring(s, e);
    }

    function xy(area) {
    }

    function x(area) {
    }

    function y(area) {
    }

/* --- Browser-level - subject to browser incompatabilities --- */

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
