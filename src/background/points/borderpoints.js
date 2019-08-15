import { hslToRgb } from '../../util/colorhelper.js';

/**
 * Creates an even distrubtion of points on the border of left, top + w  + h, total amount of points is amount
 * 
 * defaults to fill the entire page (set fillPage to false to not do that and use width and height)
 */
class BorderPoints
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
            fillPage : true // when true, width and height are ignored and the total page size is used (minus left and top)
        };

        this.options = Object.assign({}, defaults, options);
        if (this.options.fillPage)
        {
            this.options.width = ((document.width !== undefined) ? document.width : document.body.offsetWidth) - this.options.left;
            this.options.height = ((document.height !== undefined) ? document.height : document.body.offsetHeight) - this.options.top;
        }

        const { left, top, width, height, amount } = this.options;
       

        const ratio = width / height;
       
        const yHalfAmount = Math.floor((amount / ratio) / 4);
        const xHalfAmount = (amount / 2) - yHalfAmount; //Math.floor((amount) / 4);

        this.flatArray = new Float32Array(4 * (xHalfAmount + yHalfAmount));

        // top / bottom

        for (let i = 0; i < xHalfAmount; i++)
        {
            const n = 4 * i;
            const x = left + (i / xHalfAmount) * width;

            this.flatArray[n] = x;
            this.flatArray[n + 1] = top;

            this.flatArray[n + 2] = x;
            this.flatArray[n + 3] = top + height;
        }

        // left / right
        for (let i = 0; i < yHalfAmount; i++)
        {
            const n = (4 * xHalfAmount) + 4 * i;
            const y = (i / yHalfAmount) * height;

            this.flatArray[n] = left;
            this.flatArray[n + 1] = y + top;

            this.flatArray[n + 2] = width + left;
            this.flatArray[n + 3] = y + top;
        }
    }

    getColor = (point) =>
    {
        const { left, top, width, height } = this.options;

        const x01 = Math.max(0, Math.min(1, (point.x - left) / width));
        const y01 = Math.max(0, Math.min(1, (point.y - top) / height));
      
        return hslToRgb(y01 * Math.random(), 0.75 - 0.5 * x01, Math.random(), this.alpha);
    }
}
export default BorderPoints;