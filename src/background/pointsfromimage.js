import * as PIXI from 'pixi.js'


class PointsFromImage
{
    constructor(backgroundImage, w, h, indexHeight, indexAmt, restAmt, callback)
    {   
        this.w = w;
        this.h = h;

        const totalXedge = restAmt / 10;
        const totalColumnEdge = totalXedge;
        const totalIndexYedge = 24;
        const columnWidth = 800;
        const columnMargin = 10;


        this.pushArray = [];
        
        /*
        const style = window.getComputedStyle(document.body);
        let path = style.getPropertyValue('background-image');
        path = path.substring(4, path.length - 2);
        const isBase64 = path.substr(1, 5) === 'data:';
        if (!isBase64)
            path = '/' + path.replace(/^(?:\/\/|[^\/]+)*\//, ""); // make URL relative
        else
            path = path.substr(1, path.length);
        */


    
       
        this.loadImage(require(`../assets/${backgroundImage.src}`), () => {

            const { parsedImage } = this;

            const xStep = Math.max(1, Math.floor(parsedImage.width / 200));
            const yStep = Math.max(1, Math.floor(parsedImage.height / 200));

            for (let x = 0; x < parsedImage.width; x += xStep)
            {
                for (let y = 0; y < parsedImage.height; y += yStep)
                {
                    const tx = (x / parsedImage.width) * w;
                    const ty = (y / parsedImage.height) * h;

                    const avg = this.getDeltaBrightness(x, y,  xStep, yStep);
                    if (avg > 5 || Math.random() < 0.01)
                    {
                        this.pushArray.push(tx);
                        this.pushArray.push(ty);
                    }
                }
            }

            this.pushArray.push(0);
            this.pushArray.push(0);

            this.pushArray.push(w);
            this.pushArray.push(0);
 
            this.pushArray.push(w);
            this.pushArray.push(h);

            this.pushArray.push(0);
            this.pushArray.push(h);

            this.flatArray = new Float32Array(this.pushArray.length);
            for (let i = 0; i < this.flatArray.length; i++)
            {
                this.flatArray[i] = this.pushArray[i];
            }

            callback(this);
        });
    }

    getPixel(x, y)
    {
        const { parsedImage } = this;
        const { width, data } = parsedImage;
        const i = ((y * width * 4) + x * 4);

        return [data[i], data[i + 1], data[i + 2]];
    }

    getDeltaBrightness( x, y, sx, sy)
    {
        const { parsedImage } = this;
        
        const left = Math.max(0, x - sx);
        const right = Math.min(parsedImage.width, x + sx);
        const up = Math.max(0, y - sy);
        const down = Math.min(parsedImage.height, y + sy);

        const b = this.getAverageBrightness(parsedImage, x, y, sx, sy);

        const bl = Math.abs(b - this.getAverageBrightness(parsedImage, left, y, sx, sy));
        //const br = Math.abs(b - this.getAverageBrightness(parsedImage, right, y, sx, sy));
        //const bu = Math.abs(b - this.getAverageBrightness(parsedImage, x, up, sx, sy));
        //const bd = Math.abs(b - this.getAverageBrightness(parsedImage, y, down, sx, sy));

        return bl;
    }


    getAverageBrightness(x, y, w, h)
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
        r /= amt;
        g /= amt;
        b /= amt;

        return Math.sqrt(
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
        const { parsedImage } = this;

        const x01 = Math.max(0, Math.min(1, point.x / this.w));
        const y01 = Math.max(0, Math.min(1, point.y / this.h));

        const imgX = Math.floor(x01 * parsedImage.width);
        const imgY = Math.floor(y01 * parsedImage.height);

        const pixel = this.getPixel(imgX, imgY);
        return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255];
    }

}
export default PointsFromImage;