;(function ($) {

// Text
    // Base properties
    function text(area) { return area.text || getText(area); }
    function pos(area)  { return area.pos  || getCaretPosition(area); }

    // Text before/after caret
    function before(area) { return text(area).substring(0, pos(area)); }
    function after(area)  { return text(area).substring(   pos(area)); }

    // Text before/after word
    function beforeWord(area) { return text(area).substring(0, wordStart(area)); }
    function afterWord(area)  { return text(area).substring(     wordEnd(area)); }

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
        return area.pos - wordPos(area);
    }

    // Index in text where word ends
    // Passes position
    function wordEnd(area) {
        area.pos = area.pos || pos(area);
        return area.pos + wordDist(area);
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
        var line = pos === 'lineEnd' ? line(area) : lineBefore(area);

        // If cursor is at start of line, or user selected lineStart
        if (!line || pos === 'lineStart') return 0;

        // If the cursor is at the beginning of word
        if (wordPos(area) === 0) pos = 'wordStart';

        // Adjust line to word start if necessary
        else if (pos === 'wordStart')
            line = line.slice(0, -wordPos(area));

        // Adjust line to word end if necessary
        if (pos === 'wordEnd') line = line + wordAfter(area);

        var copy   = getCopyDiv(area, false)
          , width  = getWidth(area)
          , space  = /\W+/g
          , words  = line.split(space)
          , spaces = line.match(space)
          , i = 0;

        line = '';

        do {
            word  = words[i];
            space = spaces && spaces[i] || '' ;

            // if this is word at cursor, append word after cursor
            if (!pos) // to maintain correct wrapping
                word += (words[i] === words.last() ?
                         wordAfter(area) : '');

            length = getTextLength(line += word + space, copy);

            if (length > width) i--, line = '';
        } while (words[++i]);

        // If the cursor was in the middle of the word,
        // get text width with partial instead of full word
        if (!pos) length = getTextLength(
            line.replace(word, words.last()), copy
        );

        return length;
    }

    function Y(area) {
        return getTextHeight(before(area), getCopyDiv(area, true));
    }

    function XY(area, pos) { return { x: X(area, pos),
                                      y: Y(area) }; }

    function lineXY(area)    { return XY(area, 'lineStart'); }
    function lineEndXY(area) { return XY(area, 'lineEnd');   }

    function wordXY(area)    { return XY(area, 'wordStart'); }
    function wordEndXY(area) { return XY(area, 'wordEnd');   }

// Text Insertion
    function insert(area, text) {
        area.value = before(area) + text + after(area);
    }

    function replaceWord(area, text) {
        area.value = beforeWord(area) + text + afterWord(area);
    }


/* -- Helper Functions --- */

    // Split into lines
    function toLines(text) {
        return text.split('\n');
    }

    // Split into words
    function toWords(text) {
        return text.split(/\W+/);
    }

    Array.prototype.first       = function() { return this[0]; };
    Array.prototype.last        = function() { return this[this.length - 1]; };
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
            wordEndXY: wordEndXY,

            insert:      insert,
            replaceWord: replaceWord
        };

        // Add gami object to jQuery
        $.fn.gami = function () {
            var area = getNativeArea(this)
              , func = functions[arguments[0]];

            if (area && func) {
                var offset, args = [area], arg, i = 1;

                // Set up gami function arguments
                while (arg = arguments[i++])
                    typeof arg === 'number' ? offset = arg : args.push(arg);

                // Reset textarea cache
                area.text = area.pos = null;

                // Handle optional offset parameter
                if (offset) area.pos = pos(area) + offset;

                return func.apply(this, args);
            }
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

        // Handle HTML ignoring blank lines (add a period to them)
        text = text.replace(/\n/g,               '<br>'
                  ).replace(/^\W*<br>/,         '.<br>'
                  ).replace(/<br>\W*<br>/g, '<br>.<br>'
                  ).replace(/<br>\W*$/,     '<br>.');

        copyDiv.innerHTML = text || '.'; // Handle cursor at start
        return copyDiv.offsetHeight;
    }

    function getTextLength(text, copyDiv) {
        copyDiv.innerHTML = text.replace(/ /g, '&nbsp;');
        return getWidth(copyDiv);
    }

    function getWidth(area) {
        return area.offsetWidth;
    }

// Use window.jQuery to avoid ReferenceError when jQuery is not defined
})(window.jQuery);
