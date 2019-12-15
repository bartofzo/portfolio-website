
"use strict"

/**
 * Samplers work with uv 0-1 coordinatines instead of width and height
 */
export function getImageColorSamplerAsync(src, options)
{
    return new Promise((resolve, reject) => {
        var img = new Image();
     
        img.onerror = reject;
        img.onload = () => {
    
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
    
          
            const parsedImage = { 
                data : context.getImageData(0, 0, img.width, img.height).data,
                width : img.width,
                height : img.height
            }
    
            resolve(new ImageColorSampler(parsedImage, options));
        };

        img.src = src;
    });
}

/**
 * Samplers work with uv 0-1 coordinatines instead of width and height
 */
class ImageColorSampler
{
    constructor(image, options)
    {   
        const defaults = {
            alpha : 1,
            verticalAlphaFade : false
        };

        this.parsedImage = image;
        this.options = {...defaults, ...options};
    }

    get height()
    {
        return this.parsedImage.height;
    }

    get width()
    {
        return this.parsedImage.width;
    }

    /*

        Note: pixel readings in image don't apply offsets

    */
    getPixel(x, y)
    {
        const { parsedImage } = this;
        const { width, height, data } = parsedImage;

        // exponential alpha falloff to blend better
        const alpha = this.options.verticalAlphaFade ? ((1-(y/height))*(1-(y/height))) * this.options.alpha : this.options.alpha;
        //const alpha = this.options.verticalAlphaFade ? (1-(y/height)) * this.options.alpha : this.options.alpha;

        if (x  < 0 || x  > width - 1)
        {
            return [0,0,0,0];
        }
        else if (y  < 0 || y > height - 1)
        {
            return [0,0,0,0];
        }

        const i = ((Math.floor(y) * width * 4) + Math.floor(x) * 4);
        
        return [data[i], data[i + 1], data[i + 2], alpha * data[i + 3]];
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

    getColor = (x01, y01) =>
    {
        const { width, height } = this.parsedImage;
        const pixel = this.getPixel(x01 * width, y01 * height);

       
        

        return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255,  pixel[3] / 255];
    }
}
