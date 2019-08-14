import * as PIXI from 'pixi.js'



class ImagePoints
{
    constructor(left, top, w, h, maxAmount, treshold, scaleX, scaleY, src, callback)
    {   
        this.scaleX = scaleX;
        this.scaleY = scaleY;

        this.alpha = 1;
        this.left = left;
        this.top = top;
        this.w = w;
        this.h = h;
        this.pushArray = [];
        
        this.loadImage((src), () => {

            const { parsedImage } = this;

     
            const area = parsedImage.width * parsedImage.height;
            const areaPerPoint = area / maxAmount;
            const squareSideLength = Math.sqrt(areaPerPoint);
            const xStep = Math.max(1, Math.floor(squareSideLength));
            const yStep = Math.max(1, Math.floor(squareSideLength));

            for (let x = 0; x < parsedImage.width - xStep; x += xStep)
            {
                for (let y = 0; y < parsedImage.height - yStep; y += yStep)
                {
                    const avg = this.getDeltaBrightness(x, y,  xStep, yStep);
                    if (avg >= treshold)
                    {
                        this.pushArray.push((x * this.scaleX) + left);
                        this.pushArray.push((y * this.scaleY) + top);
                    }
                }
            }

            this.flatArray = new Float32Array(this.pushArray);

            callback(this);
        });
    }

    /*

        Note: pixel readings in image don't apply offsets

    */
    getPixel(x, y)
    {
        const { parsedImage, left, top } = this;
        const { width, height, data } = parsedImage;

   
        if (x  < 0 || x  > width - 1)
        {
            return [0,0,0,0];
        }
        else if (y  < 0 || y > height - 1)
        {
            return [0,0,0,0];
        }

        /*
        const clampX = Math.max(0, Math.min(width - 1, Math.floor(x)));
        const clampY = Math.max(0, Math.min(height - 1, Math.floor(y)));
        */

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
        const pixel = this.getPixel((point.x - this.left) / this.scaleX, (point.y - this.top) / this.scaleY);
        
        return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, this.alpha * pixel[3] / 255];
    }

}
export default ImagePoints;