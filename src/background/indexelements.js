/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
const getTextWidth = (text, font) => {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

export default class IndexElements
{
    constructor(triangleSet, pageIndex, screenRect, markCallback)
    {
      
        this.indexStyles = [];
        this.triangleSet = triangleSet;

        if (!pageIndex)
        {
            return;
        }

        // determines if the font color should be black or white depending on the brightness of the triangle
        const computeColorValue = (colorArray) => {

            // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
            const hsp = Math.sqrt(
                0.299 * ((255 * colorArray[0]) * (255 * colorArray[0])) +
                0.587 * ((255 * colorArray[1])  * (255 * colorArray[1])) +
                0.114 * ((255 * colorArray[2])  * (255 * colorArray[2]))
                );

            return (hsp > 200 ? 'black' : 'white');
            //return `rgba(${(255 - 255 * colorArray[0])}, ${(255 - 255 * colorArray[1])}, ${(255 - 255 * colorArray[2])}, 1 )`;
        }
       
        this.largestTriangles = triangleSet.getSortedByBoundingRectArea(triangle => 
            !triangle.outer && 
            !triangle.inner && 
            triangle.fullyInRectNoOffset(screenRect));
        
     
        for (let i = 0; i < Math.min(this.largestTriangles.length, pageIndex.length); i++)
        {

            const triangle = this.largestTriangles[i];
            const r = triangle.getNonOffsetInscribedRect();
            const text = pageIndex[i].title;
            const textWidth = getTextWidth(text, `${r.height}px Roboto Condensed sans-serif`);

            // HACK to prevent descenders from popping out
            let fontSize = 0.75 * r.height;
            if (textWidth > r.width)
            {
                fontSize *= (r.width / textWidth);
            }

            this.indexStyles.push({ 

                outer : {
                    display : 'flex',
                    left : r.cx, 
                    top : r.cy,
                    fontSize : `${fontSize}px`,
                    width : `${r.width}px`,
                    height : `${r.height}px`,
                    whiteSpace : 'nowrap',
                    transform : `translate(-50%, -50%) rotate(${r.angle}deg)`,
                    
                },

                inner : {
                    marginTop : r.flip ?  'auto' : null,
                    cursor : pageIndex[i].postId ? 'pointer' : 'default',
                    color : computeColorValue(triangle.originalColor)
                } 
            });

            if (markCallback && pageIndex[i].postId)
                markCallback(triangle, pageIndex[i].postId);
        }

       
    }

    map(callback)
    {
        return this.indexStyles.map((style, index) => callback(style, this.largestTriangles[index]));
    }



    drawTest(graphic, offX, offY)
    {


        for (const triangle of this.largestTriangles)
        {
            const quad = triangle.getNonOffsetInscribedRect();

            graphic.lineStyle(2, 0xFF0000);
            graphic.moveTo(quad.x1 + offX, quad.y1 + offY)
                .lineTo(quad.x2 + offX, quad.y2 + offY)
                .lineStyle(2, 0x00FF00)
                .lineTo(quad.x3 + offX, quad.y3 + offY)
                .lineStyle(2, 0x000000)
                .lineTo(quad.x4 + offX, quad.y4 + offY)
                .lineTo(quad.x1 + offX, quad.y1 + offY);

            graphic.drawCircle(quad.cx + offX, quad.cy + offY, 4);
        }
    }

}