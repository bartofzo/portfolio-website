
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