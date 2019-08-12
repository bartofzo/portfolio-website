/**
 * Helper class for animating on/off values
 * 
 * (c) 2019 - Bart van de Sande
 * 
 */

export default class SmoothBoolean
{
    /**
     * 
     * @param {*} duration duration of animation
     * @param {*} getTime function that should return the current time, provide a global timekeeper that sets the time once each frame for better performance
     */
    constructor(duration, getTime, on = false, offValue = 0, onValue = 1)
    {
        this._duration = duration;
        this._getTime = getTime;
        this._offValue = offValue;
        this._onValue = onValue;


        this._current = 0;
        this._target = on ? onValue : offValue;
        this._start = on ? offValue : onValue;
        this._startTime = 0;
    }

    /**
     * get continuous value based on a state
     */
    getLinear(on)
    {
        if (on)
            this.on();
        else
            this.off();

        return this.linear;
    }

    /**
     * get continuous value based on a state
     */
    getSmooth(on)
    {
        if (on)
            this.on();
        else
            this.off();
            
        return this.smooth;
    }

    /**
     * Returns a boolean value describing the on/off status
     */
    get isOn()
    {
        return this._target > 0;
    }

    /**
     * Returns the current progress from zero to one, one for on, zero for off in a linear fashion
     */
    get linear()
    {
        const t = ((this._getTime() - this._startTime) / this._duration);
        return this._start + (this._target - this._start) * (t > 1 ? 1 : t);
    }

    /**
     * Returns the current progress from zero to one, one for on, zero for off in a smoothstep fashion
     */
    get smooth()
    {
        const t = ((this._getTime() - this._startTime) / this._duration);
        
        const smoothT = t > 1 ? 1 : t * t * (3 - 2 * t);
        return this._start + (this._target - this._start) * smoothT;
    }

    /**
     * Starts animating to on state, continues animation if already in progress
     */
    on()
    {
        if (this._target !== this._onValue)
        {
            this._startTime = this._getTime();
        }

        this._start = this._offValue;
        this._target = this._onValue;
    }

    /**
     * Starts animating to off state, continues animation if already in progress
     */
    off()
    {
        if (this._target !== this._offValue)
        {
            this._startTime = this._getTime();
        }

        this._start = this._onValue;
        this._target = this._offValue;
    }

    /**
     * Toggles animation target state
     */
    toggle()
    {
        if (this.value)
        {
            this.off();
        }
        else
        {
            this.on();
        }
    }

    /**
     * Resets the current animation in progress
     */
    reset()
    {
        this._startTime = this._getTime();
    }

    fastForward()
    {
        this._startTime = -this._duration;
    }
}
