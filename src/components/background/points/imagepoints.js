
"use strict"

import { rectOf } from '../../../util/rectof.js';

class ImagePoints
{
    /**
     * Left / right / bottom / top values can be in absolute pixels or % values of destRect
     * A horizontal and a vertical value is required in options
     * 
     * Treshold is 0-255
     */
    constructor(imageSampler, options, destW, destH, callback)
    {   
        const defaults = {
            // top, left, right, bottom...

            amount : 1000, 
            treshold : 25, 
            scaleX : 1, 
            scaleY : 1,
            alpha : 1

        };


        const w = typeof(destW) !== 'undefined' && destW !== null ? destW : window.innerWidth;
        const h = typeof(destH) !== 'undefined' && destH !== null ? destH : window.innerHeight;
        this.options = Object.assign({}, defaults, {...options, ...rectOf(options, w, h)});
        this.imageSampler = imageSampler;
        this._scaleX = this.options.scaleX;
        this._scaleY = this.options.scaleY;
       
        const { treshold, amount } = this.options;

        this.pushArray = [];

       
        this.setScaling(w, h);

        const area = imageSampler.width * imageSampler.height;
        const areaPerPoint = area / amount;
        const squareSideLength = Math.sqrt(areaPerPoint);
        const xStep = Math.max(1, (squareSideLength));
        const yStep = Math.max(1, (squareSideLength));

        for (let x = 0; x < imageSampler.width + xStep; x += xStep)
        {
            for (let y = 0; y < imageSampler.height + yStep; y += yStep)
            {
                const avg = imageSampler.getDeltaBrightness(x, y,  xStep, yStep);
                if (avg >= treshold)
                {
                    this.pushArray.push((x * this._scaleX) + this._left);
                    this.pushArray.push((y * this._scaleY) + this._top);
                    
                }
            }
        }

        this.flatArray = new Float32Array(this.pushArray);
        
    }

    setScaling(w, h)
    {
        const { imageSampler, options } = this;

    
        // calculate positioning / scaling
        let bothLeftRight = false;
        let bothTopBottom = false;

       

        if (typeof(options.left) !== 'undefined' && options.left !== null)
        {
          
            this._left = options.left;
          
            if (typeof(options.right) !== 'undefined' && options.right !== null)
            {
                this._scaleX = ((w - options.right) - options.left) / imageSampler.width;
                bothLeftRight = true;
               
            }
        }
        else if (typeof(options.right) !== 'undefined' && options.right !== null)
        {
           
            if (typeof(options.left) !== 'undefined' && options.left !== null)
            {
                // left overrides the scaling
                this._left = options.left;
                this._scaleX = ((w - options.right) - this._left) / imageSampler.width;
                bothLeftRight = true;
            }
            else
            {
                // No left specified, use image with scaling
                this._left = (w - options.right) - imageSampler.width * options.scaleX;
            }
        }

        if (typeof(options.top) !== 'undefined' && options.top !== null)
        {
            this._top = options.top;
        
            if (typeof(options.bottom) !== 'undefined' && options.bottom !== null)
            {
                
                this._scaleY = ((h - options.bottom) - options.top) / imageSampler.height;
                bothTopBottom = true;
            }
        }
        else if (typeof(options.bottom) !== 'undefined' && options.bottom !== null)
        {
         
            if (typeof(options.top) !== 'undefined' && options.top !== null)
            {
                // top overrides the scaling
                this._top = options.top;
                this._scaleY = (options.bottom - this._top) / imageSampler.height;
                bothTopBottom = true;

            }
            else
            {
               
                // No top specified, use image with scaling
                this._top = (h - options.bottom) - imageSampler.height * options.scaleY;
            }
        }

        if (bothLeftRight && !bothTopBottom)
        {
            if (typeof(options.top) !== 'undefined' && options.top !== null)
            {
                this._scaleY = this._scaleX;
            }
            else
            {
                // calculate top from aspect ratio of image
                this._scaleY = this._scaleX;
                this._top = (h - options.bottom) - imageSampler.height * this._scaleY;
                
            }
        }
        else if (bothTopBottom && !bothLeftRight)
        {
            if (typeof(options.left) !== 'undefined' && options.left !== null)
            {
                // calculate right from aspect ratio of image
                this._scaleX = this._scaleY;
            }
            else
            {
                // calculate right from aspect ratio of image
                this._scaleX = this._scaleY;
                this._left = (w - options.right) - imageSampler.width * this._scaleX;
            }
        }
    }

    getColor = (point) =>
    {
        const pixel = this.imageSampler.getPixel((point.x - this._left) / this._scaleX, (point.y - this._top) / this._scaleY);
        return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, this.options.alpha * pixel[3] / 255];
    }
}
export default ImagePoints;