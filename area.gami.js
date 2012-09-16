;(function ($) {

    var lineHeight = 12; //Default

// Setup
    function setLineHeight(val) {
        lineHeight = val;
    }

// Text
    // Base properties
    function text(area) { return area.text || getText(area); }
    function pos(area)  { return area.pos  || getCaretPosition(area); }

    // Text before/after caret
    function before(area) { return text(area).substring(0, pos(area)); }
    function after(area)  { return text(area).substring(   pos(area)); }

// Lines
    function lines(area)    { return toLines(text(area)); }
    function numLines(area) { return lines(area).length;  }

    // Lines until/after caret, including partial current line
    function beforeLines(area) { return toLines(before(area)); }
    function afterLines(area)  { return toLines(after(area));  }

    // Complete lines until/after caret
    function linesBefore(area) { return beforeLines(area).allButLast(); }
    function linesAfter(area)  { return afterLines(area).allButFirst(); }

// Current Line
    // Text of current line
    // Passes text
    function line(area) {
        area.text = area.text || text(area);
        return toLines(text(area))[lineNum(area)];
    }

    function lineNum(area) { return linesBefore(area).length; }

    // Text of current line before/after caret
    function lineBefore(area) { return beforeLines(area).last();  }
    function lineAfter(area)  { return  afterLines(area).first(); }

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
    function numWords(area) { return words(area).length;  }

    // Words until/after caret in current line, including partial current word
    function beforeWords(area) { return toWords(lineBefore(area)); }
    function afterWords(area)  { return toWords(lineAfter(area));  }

    // Complete words until/after caret in current line
    function wordsBefore(area) { return beforeWords(area).allButLast(); }
    function wordsAfter(area)  { return afterWords(area).allButFirst(); }

    // All words in text
    function allWords(area)  { return toWords(text(area));   }
    function wordCount(area) { return allWords(area).length; }

    // Words until/after caret in text, including partial current word
    function allBeforeWords(area) { return toWords(before(area)); }
    function allAfterWords(area)  { return toWords(after(area));  }

    // Complete words until/after caret in text
    function allWordsBefore(area) { return allBeforeWords(area).allButLast(); }
    function allWordsAfter(area)  { return allAfterWords(area).allButFirst(); }

// Current Word
    // Text of current word
    // Passes position and text
    function word(area) {
        area.text = area.text || text(area);
        area.pos  = area.pos  ||  pos(area);
        return wordBefore(area) + wordAfter(area);
    }

    // Text of current word before/after caret
    function wordBefore(area) { return beforeWords(area).last();  }
    function wordAfter(area)  { return  afterWords(area).first(); }

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
    function XY(area, xPos) {
        var lines = beforeLines(area)
          , copy  = getCopyDiv(area)
          , width = area.width
          , wraps = 0, last;

        lines.forEach( function(line) {
            wraps += Math.ceil(width / getTextLength(line, copy));
        });

        if (!xPos || xPos.indexOf('line') === -1) {
            last = lines.slice(-1);
            last = xPos === 'wordStart' ? last.slice(0, -wordPos(area)) :
                   xPos === 'wordEnd'   ? last + wordAfter(area) : last ;
        }

        return {
            x: xPos === 'lineStart' ? 0 :
               xPos === 'lineEnd'   ? width :
               (getTextLength(last, copy) % width),
            y: wraps * lineHeight
        };
    }

    function lineXY(area)    { return XY(area, 'lineStart'); }
    function lineEndXY(area) { return XY(area, 'lineEnd');   }

    function wordXY(area)    { return XY(area, 'wordStart'); }
    function wordEndXY(area) { return XY(area, 'wordEnd');   }


/* -- Utility Functions --- */

    // Split into lines
    function toLines(text) {
        return separate(text, '\n');
    }

    // Split into words
    function toWords(text) {
        return separate(text, /\W+/);
    }

    // Split, excluding the last entry if it is empty
    function separate(text, on) {
        return (text = text.split(on)).last() ? text : text.allButLast();
    }

    // Add array first/last functions
    if(!Array.prototype.last) {
        Array.prototype.first = function() { return this[0]; };
        Array.prototype.last  = function() { return this[this.length - 1]; };
        Array.prototype.allButFirst = function() { return this.slice(1); };
        Array.prototype.allButLast  = function() { return this.slice(0, -1) };
    }


/* --- Jquery Support --- */

    if ($) {
        var functions = {
            text:   text,
            pos:    pos,
            before: before,
            after:  after,

            lines:       lines,
            numLines:    numLines,
            beforeLines: beforeLines,
            afterLines:  afterLines,
            linesBefore: linesBefore,
            linesAfter:  linesAfter,

            line:       line,
            lineNum:    lineNum,
            lineBefore: lineBefore,
            lineAfter:  lineAfter,
            linePos:    linePos,
            lineDist:   lineDist,
            lineStart:  lineStart,
            lineEnd:    lineEnd,

            words:          words,
            numWords:       numWords,
            beforeWords:    beforeWords,
            afterWords:     afterWords,
            wordsBefore:    wordsBefore,
            wordsAfter:     wordsAfter,
            allWords:       allWords,
            wordCount:      wordCount,
            allBeforeWords: allBeforeWords,
            allAfterWords:  allAfterWords,
            allWordsBefore: allWordsBefore,
            allWordsAfter:  allWordsAfter,

            word:          word,
            wordBefore:    wordBefore,
            wordAfter:     wordAfter,
            wordPos:       wordPos,
            wordDist:      wordDist,
            wordStart:     wordStart,
            wordEnd:       wordEnd,
            lineWordStart: lineWordStart,
            lineWordEnd:   lineWordEnd,

            XY:        XY,
            lineXY:    lineXY,
            lineEndXY: lineEndXY,
            wordXY:    wordXY,
            wordEndXY: wordEndXY
        };

        // Add gami object to jQuery
        $.fn.gami = function (method) {
            var textarea = getNativeArea(this);
            textarea.area = textarea.pos = null; // reset cache
            console.log(getLineHeight(textarea));
            return textarea ? functions[method](textarea) : null;
        };
    }


/* --- Browser-level - subject to browser incompatabilities --- */

    function getNativeArea(el) {
        el = el.jquery ? el.get(0) : el;
        return (el && el instanceof HTMLElement &&
               (el.nodeName.toLowerCase() === 'textarea')) ? el : null;
    }


    function getLineHeight(area) {
        return parseInt(window.getComputedStyle(area, null
                             ).getPropertyValue('line-height'));
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

    function getCopyDiv(area) {
        return document.getElementById('gami-copy') || (
            area.parentNode.innerHTML += '<div id="gami-copy"></div>',
            getCopyDiv(area)
        );
    }

    function getTextLength(text, copyDiv) {
        copyDiv.innerHTML = text;
        return copyDiv.offsetWidth;
    }

// Use window.jQuery to avoid ReferenceError when jQuery is not defined
})(window.jQuery);
