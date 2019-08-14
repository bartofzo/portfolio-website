import { hslToRgb } from '../../util/colorhelper.js';

/**
 * Creates an even distrubtion of points on the border of left, top + w  + h, total amount of points is amount
 */
class BorderPoints
{
    constructor(left, top, w, h, amount)
    {
        this.left = left;
        this.top = top;
        this.w = w;
        this.h = h;

        const ratio = w / h;
       
        const yHalfAmount = Math.floor((amount / ratio) / 4);
        const xHalfAmount = (amount / 2) - yHalfAmount; //Math.floor((amount) / 4);

        this.flatArray = new Float32Array(4 * (xHalfAmount + yHalfAmount));

        // top / bottom

        for (let i = 0; i < xHalfAmount; i++)
        {
            const n = 4 * i;
            const x = left + (i / xHalfAmount) * w;

            this.flatArray[n] = x;
            this.flatArray[n + 1] = top;

            this.flatArray[n + 2] = x;
            this.flatArray[n + 3] = top + h;
        }

        // left / right
        for (let i = 0; i < yHalfAmount; i++)
        {
            const n = (4 * xHalfAmount) + 4 * i;
            const y = (i / yHalfAmount) * h;

            this.flatArray[n] = left;
            this.flatArray[n + 1] = y + top;

            this.flatArray[n + 2] = w + left;
            this.flatArray[n + 3] = y + top;
        }
    }

    getColor = (point) =>
    {
        const x01 = Math.max(0, Math.min(1, (point.x - this.left) / this.w));
        const y01 = Math.max(0, Math.min(1, (point.y - this.top) / this.h));
      
        return hslToRgb(y01 * Math.random(), 0.75 - 0.5 * x01, Math.random(), this.alpha);
    }
}
export default BorderPoints;