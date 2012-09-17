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
    function X(area, pos) {
        var lines = beforeLines(area)
          , last  = pos === 'lineEnd' ? line(area) : lines.last()
          , width = getWidth(area)
          , wraps = i = 0, length, last, words, word, space, spaces;

        if (!last) pos = 'lineStart';
        if (pos !== 'lineStart') {
            last = pos === 'wordStart' ? last.slice(0, -wordPos(area)) :
                   pos === 'wordEnd'   ? last + wordAfter(area) : last ;

            copy = getCopyDiv(area, false);
            space = /\W+/g;
            words  = last.split(space);
            spaces = last.match(space);
            last = '';

            do {
                word  = words[i];
                space = spaces && spaces[i] || '' ;

                // if this is word at cursor, append word after cursor
                if (pos !== lineEnd)
                    word += (words[i] === words.last() ?
                             wordAfter(area) : '');

                length = getTextLength(last += word + space, copy);

                if (length > width) i--, last = '';
            } while (words[++i]);

            length = getTextLength(last.replace(word, words.last()), copy);
        }

        return pos === 'lineStart' ? 0 : length ;
    }

    function Y(area) {
        return getTextHeight(before(area), getCopyDiv(area, true));
    }

    function XY(area) { return { x: X(area), y: Y(area) }; }

    function lineXY(area)    { return XY(area, 'lineStart'); }
    function lineEndXY(area) { return XY(area, 'lineEnd');   }

    function wordXY(area)    { return XY(area, 'wordStart'); }
    function wordEndXY(area) { return XY(area, 'wordEnd');   }


/* -- Utility Functions --- */

    // Split into lines
    function toLines(text) {
        return text.split('\n');
    }

    // Split into words
    function toWords(text) {
        return separate(text, /\W+/);
    }

    // Split, excluding the last entry if it is empty
    function separate(text, on) {
        return (text = text.split(on)).last() ? text : text.allButLast();
    }

    Array.prototype.first = function() { return this[0]; };
    Array.prototype.last  = function() { return this[this.length - 1]; };
    Array.prototype.allButFirst = function() { return this.slice(1); };
    Array.prototype.allButLast  = function() { return this.slice(0, -1) };


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

            X: X,      Y: Y,
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

    function getCopyDiv(area, wordWrap) {
        var div;
        if (!(div = document.getElementById('gami-copy'))) {
            div = document.createElement('div');

            div.setAttribute('id', 'gami-copy');
            div.style.visibility = 'hidden';

            // Make sure copy uses same font attrs as textarea
            div.style.font = window.getComputedStyle(area,null
                                  ).getPropertyValue('font');

            area.parentNode.appendChild(div);
        }

        div.style.width   = wordWrap ? getWidth(area) + 'px' : 'auto';
        div.style.display = wordWrap ? 'block' : 'inline-block';
        return div;
    }

    function getTextHeight(text, copyDiv) {
        text = text.replace('\n', '<br>');

        // Handle cases where cursor is at start of line
        if (!text || /<br>\W*$/.test(text)) text += '.';

        copyDiv.innerHTML = text;
        return copyDiv.offsetHeight;
    }

    function getTextLength(text, copyDiv) {
        copyDiv.innerHTML = text;
        return getWidth(copyDiv);
    }

    function getWidth(area) {
        return area.offsetWidth;
    }

// Use window.jQuery to avoid ReferenceError when jQuery is not defined
})(window.jQuery);
