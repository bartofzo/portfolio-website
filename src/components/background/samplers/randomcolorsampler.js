import { hslToRgb } from '../../../util/colorhelper.js';

/**
 * Samplers work with uv 0-1 coordinatines instead of width and height
 */
class RandomColorSampler
{
    constructor(options)
    {
        const defaults = {
            alpha : 1
        };

        this.options = {...defaults, ...options };
        this.randomHue = Math.random();
        this.hueSpread = Math.random();
    }

    getColor = (x01, y01) =>
    {
        //return [1,1,1,1];
        const { alpha } = this.options;
        return hslToRgb((this.randomHue + y01 * this.hueSpread) % 1.0 , 0.75 - 0.1 * x01, Math.random(), alpha);
    }
}

export default RandomColorSampler;