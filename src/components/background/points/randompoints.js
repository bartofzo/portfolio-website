import { hslToRgb } from '../../../util/colorhelper.js';

class RandomPoints
{
    constructor(options, sampler)
    {
        const defaults = {
            left : 0,
            top : 0,
            amount : 400,
            width : window.innerWidth,
            height : window.innerHeight
        };

        this.options = {...defaults, ...options };

        this.sampler = sampler;

        const { left, top, width, height, amount } = this.options;

        this.flatArray = new Float32Array(2 * amount);

        // fill up index space:
        for (let i = 0; i < amount; i++)
        {
            let n = 2 * i;
            this.flatArray[n] = left + Math.random() * width;
            this.flatArray[n + 1] = top + Math.random() * height;
        }

    }

    getColor = (point) =>
    {
        const { left, top, width, height } = this.options;
        const x01 = Math.max(0, Math.min(1, (point.x - left) / width));
        const y01 = Math.max(0, Math.min(1, (point.y - top) / height));
      
        //return [1,1,1,1];
        return this.sampler.getColor(x01, y01);
    }
}
export default RandomPoints;