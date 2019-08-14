import { hslToRgb } from '../../util/colorhelper.js';

class RandomPoints
{
    constructor(left, top, w, h, amount)
    {
        this.left = left;
        this.top = top;
        this.w = w;
        this.h = h;
        this.alpha = 1;

        this.flatArray = new Float32Array(2 * amount);

        // fill up index space:
        for (let i = 0; i < amount; i++)
        {
            let n = 2 * i;
            this.flatArray[n] = left + Math.random() * w;
            this.flatArray[n + 1] = top + Math.random() * h;
        }

    }

    getColor = (point) =>
    {
        const x01 = Math.max(0, Math.min(1, (point.x - this.left) / this.w));
        const y01 = Math.max(0, Math.min(1, (point.y - this.top) / this.h));
      
        return hslToRgb(y01 * Math.random(), 0.75 - 0.5 * x01, Math.random(), this.alpha);
    }
}
export default RandomPoints;