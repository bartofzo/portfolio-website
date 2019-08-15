import { hslToRgb } from '../../util/colorhelper.js';

class RandomPoints
{
    constructor(options)
    {
        const defaults = {
            left : 0,
            top : 0,
            amount : 200, 
            alpha : 1,
            width : window.innerWidth,
            height : window.innerHeight,
            fillPage : true
        };

        this.options = Object.assign({}, defaults, options);
        if (this.options.fillPage)
        {
            this.options.width = ((document.width !== undefined) ? document.width : document.body.offsetWidth) - this.options.left;
            this.options.height = ((document.height !== undefined) ? document.height : document.body.offsetHeight) - this.options.top;
        }

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
        const { left, top, width, height, alpha } = this.options;

        const x01 = Math.max(0, Math.min(1, (point.x - left) / width));
        const y01 = Math.max(0, Math.min(1, (point.y - top) / height));
      
        return hslToRgb(y01 * Math.random(), 0.75 - 0.5 * x01, Math.random(), alpha);
    }
}
export default RandomPoints;