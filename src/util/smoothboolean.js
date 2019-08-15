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
    constructor(onDuration, offDuration, getTime, linear = true, on = false, offValue = 0, onValue = 1)
    {
        this.onDuration = onDuration;
        this.offDuration = offDuration;
        this._getTime = getTime;
        this.valueFunction = linear ? this.getLinearValue : this.getSmoothValue;

        this._offValue = offValue;
        this._onValue = onValue;
        this._isOn = on;

        this._currentDuration = on ? onDuration : offDuration;
        this._target = on ? onValue : offValue;
        this._start = on ? offValue : onValue;
        this._startTime = 0;
    }

    get(on)
    {
        if (on)
        {
            this.on();
        }
        else
        {
            this.off();
        }

        return this.valueFunction();
    }


    /**
     * Returns the current progress from zero to one, one for on, zero for off in a linear fashion
     */
    getLinearValue()
    {
        const t = (this._getTime() - this._startTime) / this._currentDuration;
        return this._start + (this._target - this._start) * (t > 1 ? 1 : t);
    }

    /**
     * Returns the current progress from zero to one, one for on, zero for off in a smoothstep fashion
     */
    getSmoothValue()
    {
        const t = ((this._getTime() - this._startTime) / this._currentDuration);
        const smoothT = t > 1 ? 1 : t * t * (3 - 2 * t);
        return this._start + (this._target - this._start) * smoothT;
    }

    /**
     * Starts animating to on state, continues animation if already in progress
     */
    on()
    {
        if (!this._isOn)
        {
            this._start = this.valueFunction();
            
            this._target = this._onValue;
            this._startTime = this._getTime();
            this._currentDuration = this.onDuration;
            this._isOn = true;
        }
    }

    /**
     * Starts animating to off state, continues animation if already in progress
     */
    off()
    {
        if (this._isOn)
        {
            this._start = this.valueFunction();
            this._target = this._offValue;
            this._currentDuration = this.offDuration;
            this._startTime = this._getTime();
            this._isOn = false;
        }
    }

    /**
     * Toggles animation target state
     */
    toggle()
    {
        if (this._isOn)
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
        if (this._isOn)
        {
            this._startTime = -this.onDuration;
        }
        else
        {
            this._startTime = -this.offDuration;
        }
        
    }
}
