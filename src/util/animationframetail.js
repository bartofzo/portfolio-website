/**
 *
 * Provides an easy way to start animating on an event and keep doing new frame requests for X number of ms after the last poke has occured
 *  
 * (c) 2019 - Bart van de Sande 
 */
export default class AnimationFrameTail
{
    constructor(tailDuration, callback)
    {
        this._now = performance.now();
        this._tailDuration = tailDuration;
        this._callback = callback;
        this._isRunning = false;
    }

    getLastNow = () =>
    {
        return this._now;
    }

    /**
     * Starts the animation frame requests, callback will be invoked from this call on until the tail duration has expired
     * callbacks are guaranteed to be made from the last poke + tail duration
     */
    poke = () =>
    {
        this._pokeTime = performance.now();

        if (!this._isRunning)
        {
            this._isRunning = true;
            this.frame();
        }
    }

    /**
     * Provide an extra callback to be made before regular callback until the tail has expired
     */
    hijack = (callback) => {
        this._hijackCallback = callback;
        this.poke();
    }

    throttle = (callback) => {
        
    }

    frame = () =>
    {
        this._now = performance.now();

        if (this._now - this._pokeTime < this._tailDuration)
        {
            if (this._hijackCallback)
                this._hijackCallback();
            
            this._callback();
            requestAnimationFrame(this.frame);
        }
        else
        {
            this._hijackCallback = null;
            this._isRunning = false;
        }
    }
}
