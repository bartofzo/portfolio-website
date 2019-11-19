

import Triangle from './triangle.js'
import * as PIXI from 'pixi.js-legacy'
import MathHelper from '../util/mathhelper.js';
import { hslToRgb } from '../util/colorhelper.js';

const colorTransitionMs = 100;

export default class ColoredTriangle extends Triangle
{
    constructor(indices, flatArray, index, triCount)
    {
        super(indices, flatArray, index);
       
        const w = window.innerWidth;
        const h = window.innerHeight;

        //let color = [(flatArray[indices[0]] % w) / w, (flatArray[indices[1]] % h) / h, (flatArray[indices[2]] % w) / w];


        let color = hslToRgb(0.7 * (flatArray[indices[0]] % w) / w, 0.2 + 0.5 * (flatArray[indices[1]] % h) / h, 0.2 + 0.5 * (flatArray[indices[2]] % w) / w);

        //let color = hslToRgb(val1, 0.5, 0.5);

        color[0] = Math.min(1, Math.max(0, color[0]));
        color[1] = Math.min(1, Math.max(0, color[1]));
        color[2] = Math.min(1, Math.max(0, color[2]));

        this.originalColor = color;
        this.whiteT = 0;
        this.transT = 0;
        this.isWhite = false;
        this.isTrans = false;
    }

    get color()
    {
        const { originalColor, whiteT } = this;
        const { lerp } = MathHelper;

        return [
            lerp(originalColor[0], 1, whiteT),
            lerp(originalColor[1], 1, whiteT),
            lerp(originalColor[2], 1, whiteT)
        ];
    }

    draw(graphic, screenRect, offX, offY)
    {
        const { indices, flatArray, color, notInRect, transT, whiteT, edge } = this;
    
        // save us some hassle
        if (notInRect(screenRect, offX, offY))
        {
            return;
        }

        graphic.beginFill(PIXI.utils.rgb2hex(color), 1 - transT);
        graphic.moveTo(flatArray[indices[0]] + offX, flatArray[indices[1]] + offY)
            .lineTo(flatArray[indices[2]] + offX, flatArray[indices[3]] + offY)
            .lineTo(flatArray[indices[4]] + offX, flatArray[indices[5]] + offY)
            .lineTo(flatArray[indices[0]] + offX, flatArray[indices[1]] + offY);

    }

    drawBorder(graphic, screenRect, offX, offY)
    {
        const { indices, flatArray, color, originalColor, notInRect, transT, whiteT } = this;

        // save us some hassle
        if (notInRect(screenRect, offX, offY))
        {
            return;
        }



        // DIV

        if ((this.overlapped[0]) && !(this.divContained[0] || this.divOutside[0]))
        {
            graphic.lineStyle(2, PIXI.utils.rgb2hex(MathHelper.lerpColor(originalColor, [1,1,1], 0.5)), 1);
            
            if (!this.divEdges[0][0])
            {
                graphic
                .moveTo(flatArray[indices[(0 * 2)]] + offX, flatArray[indices[(0 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[(0 * 2 + 2)]] + offX, flatArray[indices[(0 * 2 + 3)]] + offY )
            }
            if (!this.divEdges[0][1])
            {
                graphic
                .moveTo(flatArray[indices[(1 * 2)]] + offX, flatArray[indices[(1 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[(1 * 2 + 2)]] + offX, flatArray[indices[(1 * 2 + 3)]] + offY )
            }
            if (!this.divEdges[0][2])
            {
                graphic
                .moveTo(flatArray[indices[(2 * 2)]] + offX, flatArray[indices[(2 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[0]] + offX, flatArray[indices[1]] + offY )
            }
        }

        // IMG first

        if (!(this.divContained[1] || this.divOutside[1]))
        {
            graphic.lineStyle(2, PIXI.utils.rgb2hex(MathHelper.lerpColor(originalColor, [0,0,0], 0.5)), 1);
            
            if (!this.divEdges[1][0])
            {
                graphic
                .moveTo(flatArray[indices[(0 * 2)]] + offX, flatArray[indices[(0 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[(0 * 2 + 2)]] + offX, flatArray[indices[(0 * 2 + 3)]] + offY )
            }
            if (!this.divEdges[1][1])
            {
                graphic
                .moveTo(flatArray[indices[(1 * 2)]] + offX, flatArray[indices[(1 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[(1 * 2 + 2)]] + offX, flatArray[indices[(1 * 2 + 3)]] + offY )
            }
            if (!this.divEdges[1][2])
            {
                graphic
                .moveTo(flatArray[indices[(2 * 2)]] + offX, flatArray[indices[(2 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[0]] + offX, flatArray[indices[1]] + offY )
            }
        }
       
        /*
        for (let test = 0; test < 2; test++)
        {
            if ((test === 0 && !this.overlapped[test]) || this.divContained[test] || this.divOutside[test])
                continue;

            graphic.lineStyle(4, PIXI.utils.rgb2hex(MathHelper.lerpColor(originalColor, [1,1,1], 0.5)), 1);

            if (!this.divEdges[test][0])
            {
                graphic
                .moveTo(flatArray[indices[(0 * 2)]] + offX, flatArray[indices[(0 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[(0 * 2 + 2)]] + offX, flatArray[indices[(0 * 2 + 3)]] + offY )
            }
            if (!this.divEdges[test][1])
            {
                graphic
                .moveTo(flatArray[indices[(1 * 2)]] + offX, flatArray[indices[(1 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[(1 * 2 + 2)]] + offX, flatArray[indices[(1 * 2 + 3)]] + offY )
            }
            if (!this.divEdges[test][2])
            {
                graphic
                .moveTo(flatArray[indices[(2 * 2)]] + offX, flatArray[indices[(2 * 2 + 1)]] + offY )
                .lineTo(flatArray[indices[0]] + offX, flatArray[indices[1]] + offY )
            }
        }
        */

    }

    update(deltaTime)
    {
        this.whiteT = MathHelper.lerp(this.whiteT, this.isWhite ? 1 : 0, deltaTime / colorTransitionMs);
        this.transT = MathHelper.lerp(this.transT, this.isTrans ? 1 : 0, deltaTime / colorTransitionMs);
    }

    finalize()
    {
        this.whiteT = this.isWhite ? 1 : 0;
        this.transT = this.isTrans ? 1 : 0;
    }

    makeWhite(finalize)
    {
        this.isWhite = true;
        this.isTrans = false;
        if (finalize)
            this.finalize();
    }

    makeTrans(finalize)
    {
        this.isTrans = true;
        this.isWhite = false;
        if (finalize)
            this.finalize();
    }

    restoreColor()
    {
        this.isWhite = false;
        this.isTrans = false;
    }
}