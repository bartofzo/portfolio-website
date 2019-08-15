
import * as PIXI from 'pixi.js'
import { throwStatement } from '@babel/types';


class ImagePoints
{
    /**
     * Left / right / bottom / top values are in range of 0-1 ratio of destination Width and Height
     * Treshold is 0-255
     */
    constructor(src, options, destWidth, destHeight, callback)
    {   
        if (destWidth == null)
            this.destWidth = window.innerWidth;
        else
            this.destWidth = destWidth;

        if (destHeight == null)
            this.destHeight = window.innerHeight;
        else
            this.destHeight = destHeight;

        
        const defaults = {
            left : 0,
            top : 0,
            right : 0,
            bottom : null,
            amount : 1000, 
            treshold : 25, 
            scaleX : 1, 
            scaleY : 1,
            alpha : 1
        };

        this.options = Object.assign({}, defaults, options);

        this._scaleX = this.options.scaleX;
        this._scaleY = this.options.scaleY;

        const { treshold, amount } = this.options;

        this.pushArray = [];
        
        this.loadImage((src), () => {

            const { parsedImage } = this;

            this.setScaling();
     
            const area = parsedImage.width * parsedImage.height;
            const areaPerPoint = area / amount;
            const squareSideLength = Math.sqrt(areaPerPoint);
            const xStep = Math.max(1, (squareSideLength));
            const yStep = Math.max(1, (squareSideLength));

            for (let x = 0; x < parsedImage.width + xStep; x += xStep)
            {
                for (let y = 0; y < parsedImage.height + yStep; y += yStep)
                {
                    const avg = this.getDeltaBrightness(x, y,  xStep, yStep);
                    if (avg >= treshold)
                    {
                        this.pushArray.push((x * this._scaleX) + this._left);
                        this.pushArray.push((y * this._scaleY) + this._top);
                        
                    }
                }
            }

            this.flatArray = new Float32Array(this.pushArray);
           

            callback(this);
        });
    }

    setScaling()
    {
        const { parsedImage, destWidth, destHeight } = this;


        // calculate positioning / scaling
        let bothLeftRight = false;
        let bothTopBottom = false;

        if (this.options.left !== null)
        {
            this._left = this.options.left;
           
            if (this.options.right !== null)
            {
                this._scaleX = ((destWidth - this.options.right) - this.options.left) / parsedImage.width;
                bothLeftRight = true;
            }
        }
        else if (this.options.right !== null)
        {
          
            if (this.options.left !== null)
            {
                // left overrides the scaling
                this._left = this.options.left;
                this._scaleX = ((destWidth - this.options.right) - this._left) / parsedImage.width;
                bothLeftRight = true;
            }
            else
            {
                // No left specified, use image with scaling
                this._left = (destWidth - this.options.right) - parsedImage.width * this.options.scaleX;
              
            }
        }

        if (this.options.top !== null)
        {
            this._top = this.options.top;
           
            if (this.options.bottom !== null)
            {
                this._scaleY = ((destHeight - this.options.bottom) - this.options.top) / parsedImage.height;
                bothTopBottom = true;
            }
        }
        else if (this.options.bottom !== null)
        {
         
            if (this.options.top !== null)
            {
                // top overrides the scaling
                this._top = this.options.top;
                this._scaleY = (this.options.bottom - this._top) / parsedImage.height;
                bothTopBottom = true;

            }
            else
            {
               
                // No top specified, use image with scaling
                this._top = (destHeight - this.options.bottom) - parsedImage.height * this.options.scaleY;
            }
        }

        if (bothLeftRight && !bothTopBottom)
        {
            if (this.options.top !== null)
            {
                this._scaleY = this._scaleX;
            }
            else
            {
                // calculate top from aspect ratio of image
                this._scaleY = this._scaleX;
                this._top = (destHeight - this.options.bottom) - parsedImage.height * this._scaleY;
                
            }
        }
        else if (bothTopBottom && !bothLeftRight)
        {
            if (this.options.left !== null)
            {
                // calculate right from aspect ratio of image
                this._scaleX = this._scaleY;
            }
            else
            {
                // calculate right from aspect ratio of image
                this._scaleX = this._scaleY;
                this._left = (destWidth - this.options.right) - parsedImage.width * this._scaleX;
            }
        }
    }

    /*

        Note: pixel readings in image don't apply offsets

    */
    getPixel(x, y)
    {
        const { parsedImage } = this;
        const { width, height, data } = parsedImage;


        if (x  < 0 || x  > width - 1)
        {
            return [0,0,0,0];
        }
        else if (y  < 0 || y > height - 1)
        {
            return [0,0,0,0];
        }

        const i = ((Math.floor(y) * width * 4) + Math.floor(x) * 4);
        
        return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    }

    getDeltaBrightness( x, y, sx, sy)
    {

        
        const left = Math.max(0, x - sx);
        /*
        const right = Math.min(parsedImage.width, x + sx);
        const up = Math.max(0, y - sy);
        const down = Math.min(parsedImage.height, y + sy);
        */

        const b = this.getAverageBrightness(x, y, sx, sy);
        const bl = Math.abs(b - this.getAverageBrightness(left, y, sx, sy));

    

        //const br = Math.abs(b - this.getAverageBrightness(right, y, sx, sy));
        //const bu = Math.abs(b - this.getAverageBrightness(x, up, sx, sy));
        //const bd = Math.abs(b - this.getAverageBrightness(y, down, sx, sy));

        return bl;
    }


    getAverageBrightness(x, y, w, h)
    {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
       
        for (let xx = x; xx < x + w; xx++)
        {
            for (let yy = y; yy < y + h; yy++)
            {
                const p = this.getPixel(xx, yy);
               
                r += p[0];
                g += p[1];
                b += p[2];
                a += p[3];
            }
        }
        
        const amt = w * h;
        r /= amt;
        g /= amt;
        b /= amt;
        a /= amt;
        

        return a + Math.sqrt(
                0.299 * (r * r) +
                0.587 * (g * g) +
                0.114 * (b * b));
    }

    /**
     * Returns average RGB of a pixel block as an array to be used directly in pixi
     */
    getAverageRgb(x, y, w, h)
    {
        let r = 0;
        let g = 0;
        let b = 0;


        for (let xx = x; xx < x + w; xx++)
        {
            for (let yy = y; yy < y + h; yy++)
            {
                const p = this.getPixel(xx, yy);
                r += p[0];
                g += p[1];
                b += p[2];
            }
        }
        
        const amt = w * h;
        return [r / amt,g / amt, b / amt];
    }



    loadImage(url, callback) {

        var img = new Image();

        img.onerror = (err) => console.error('Image not found');
        img.onload = () => {

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            this.parsedImage = { 
                data : context.getImageData(0, 0, img.width, img.height).data,
                width : img.width,
                height : img.height
            }

            callback();
        };

        img.src = url;
    }

    getColor = (point) =>
    {
        const pixel = this.getPixel((point.x - this._left) / this._scaleX, (point.y - this._top) / this._scaleY);
      
        return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, this.options.alpha * pixel[3] / 255];
    }

}
export default ImagePoints;