"use strict"

/**
 * Converts a source rect into a new rect with absolute values based on optional percentages of a width and height
 * 
 * Only if a property is defined as 'XX%', otherwise just returns absolute value of that rect
 * 
 * 
 * @param {rect} rect 
 * @param {rect} destRect - if not supplied, will use window as destination
 */
function rectOf(rect, w, h)
{
    if (!rect)
        return undefined;

    const w2 = (typeof(w) !== 'undefined' && w !== null) ? w : window.innerWidth;
    const h2 = (typeof(h) !== 'undefined' && w !== null) ? h : window.innerHeight;

    return {
        left :  parsePercentage(rect.left, w2),
        right : parsePercentage(rect.right, w2),
        top : parsePercentage(rect.top, h2),
        bottom : parsePercentage(rect.bottom, h2)
    }

}
exports.rectOf = rectOf;

/**
 * Returns rect or if null/undefined a rect of the current window
 */
function rectOrWindowRect(rect)
{
    return rect || {
        left : 0, right : window.innerWidth, top : 0, bottom : window.innerHeight
    };
}
exports.rectOrWindowRect = rectOrWindowRect;

function parsePercentage(value, of)
{
    if (!isNaN(value))
        return value;

  

    if (typeof(value) === 'string')
    {
        const trimmed = value.trim();
      
        if (trimmed.substr(trimmed.length - 1, 1) === '%')
        {
            const numericPart = parseFloat(value.substring(0, value.length - 1));
            return (numericPart / 100) * of;
        }
    }
}