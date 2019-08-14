
/**
 * @param {*} the CSS class name used to select elements 
 * @param {*} callback with the BoundingClientRect of each element
 */
function forEachRect(className, callback)
{
    const elements = document.getElementsByClassName(className);
    for (const element of elements)
    {
        callback(element.getBoundingClientRect())
    }
}
exports.forReachRect = forEachRect;


/**
 * Returns an array representing all the BoundingClientRect of elements with CSS classname
 * @param {*} className 
 */
function getAllRects(className)
{
    return Array.from(document.getElementsByClassName(className)).map(element => element.getBoundingClientRect());
}
exports.getAllRects = getAllRects;

/**
 * Returns an array representing all the BoundingClientRect of elements with CSS classname
 * @param {*} className 
 */
function getAllPredictedRects(className, deltaX, deltaY)
{
    return Array.from(document.getElementsByClassName(className)).map(element => predictRect(element.getBoundingClientRect(), deltaX, deltaY));
}
exports.getAllPredictedRects = getAllPredictedRects;


function predictRect(rect, deltaX, deltaY)
{
   
    const newRect = 
        { 
            top : rect.top - deltaY,
            bottom : rect.bottom - deltaY,
            left : rect.left - deltaX,
            right : rect.right - deltaX
        };
        /*
    rect.top = rect.top - 15 * deltaY;
    rect.bottom = rect.bottom - 15 * deltaY;
    rect.left = rect.left - 15 * deltaX;
    rect.right = rect.right - 15 * deltaX;
    */

    return newRect;
}