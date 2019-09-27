function waitUntil(expression, callback, timeout)
{
    setTimeout(() => {
        if (expression())
        {
            callback();
        }
        else
        {
            waitUntil(expression, callback, timeout);
        }
    }, 10);
}
exports.waitUntil = waitUntil;