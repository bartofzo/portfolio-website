

import Triangle from './triangle.js'
import * as PIXI from 'pixi.js'
import MathHelper from '../util/mathhelper.js';
import { hslToRgb } from '../util/colorhelper.js';
import SmoothBoolean from '../util/smoothboolean.js';



export default class AwesomeTriangle extends Triangle {
    constructor(triangleSet, index, getTime, indexHeight, transitionDurations) {
        super(triangleSet, index);

        this.getTime = getTime;

        // overlap state:
        this.inner = false;
        this.outer = false;
        this.pageTransition = true;
        this.hover = false;
        this.blocked = false;
        this.between = false;

        this.aniOuter = new SmoothBoolean(transitionDurations.outer, getTime);
        this.aniBetween = new SmoothBoolean(transitionDurations.outer, getTime);
        this.aniHover = new SmoothBoolean(transitionDurations.hover, getTime, this.hover, 0, 0.5);
        this.aniInner = new SmoothBoolean(transitionDurations.inner, getTime);
        this.aniPageTransition = new SmoothBoolean(transitionDurations.pageTransition, getTime, this.pageTransition);

        let indexMul = 0.25 + 0.75 * (this.index / triangleSet.triangleCount);
       

        const middleY = (this.points[1] + this.points[3] + this.points[5]) / 3;
        let overIndex = Math.min(1,0.5 * middleY/ indexHeight);
        //const lightness = overIndex + (1 - overIndex) * Math.random();
        const lightness = Math.random();

        let color = hslToRgb(indexMul * Math.random(), 0.75 - 0.5 * overIndex, lightness);


        /*
        let r = Math.random();
        color[0] = indexMul * r;
        color[1] = indexMul * r;
        color[2] = indexMul * r;
        */

        color[0] = Math.min(1, Math.max(0, color[0]));
        color[1] = Math.min(1, Math.max(0, color[1]));
        color[2] = Math.min(1, Math.max(0, color[2]));
        this.originalColor = color;

        this.outerBorderColorHex = PIXI.utils.rgb2hex(MathHelper.lerpColor(this.originalColor, [1, 1, 1], 0.5));
        this.innerBorderColorHex = PIXI.utils.rgb2hex(MathHelper.lerpColor(this.originalColor, [0, 0, 0], 1));
    }

    /*

        State

    */

    mark(postId)
    {
        this.markedPostId = postId;
        this.triangleSet.addToMarked(this);
    }

    get visible() {
        return !this.inner && !this.hover;
    }

    get color() {
        const { aniOuter, aniPageTransition, aniBetween, between,
            outer, pageTransition } = this;

        return MathHelper.lerpColor(this.originalColor, [1, 1, 1],

            // Page transition takes precedence over all other color interpolation
            Math.max(
                aniBetween.getLinear(between),
                aniOuter.getLinear(outer),
                aniPageTransition.getLinear(pageTransition)));
    }

    get alpha() {
        const { aniHover, aniInner, aniOuter, aniPageTransition, hover, inner, outer, page } = this;
        return MathHelper.lerp(1, 0,

            // Inner transition takes precedence over hover
            Math.max(
                aniInner.getLinear(inner),
                aniHover.getLinear(hover)));
    }

    /**
     * Finishes all running animations immediately (except for the page transition)
     */
    fastForwardExceptPage() {
        this.aniOuter.fastForward();
    }


    /*

        Drawing

    */


    draw(graphic) {
        const { color, alpha } = this;

        graphic.beginFill(PIXI.utils.rgb2hex(color), alpha);
        this.startingPoint((x, y) => graphic.moveTo(x, y));
        this.forEachLineEndPoint((x2, y2) => graphic.lineTo(x2, y2));
    }

    drawBorder(graphic) {
        if (!this.visible)
            return;


        const { alpha } = this;

        /*
        this.forEachOuterBorder((x1, y1, x2, y2, col) => {

            graphic.lineStyle(1, col, alpha);
            graphic.moveTo(x1, y1)
            graphic.lineTo(x2, y2)

        });
        */

        

        this.forEachInnerBorder((x1, y1, x2, y2, col) => {

            graphic.lineStyle(2, col, 0.175 * alpha);
            graphic.moveTo(x1, y1)
            graphic.lineTo(x2, y2)

        });
    }

    /*

        Util

    */

    forEachInnerBorder(callback) {
        const { getTriangleAdjecentToEdge, edgeLine } = this;

        if (!this.visible || this.outer)
            return;

        for (let i = 0; i < 3; i++) {
            const triangle = getTriangleAdjecentToEdge(i);

            if (triangle && !triangle.visible && !triangle.hover) {
                edgeLine(i, (x1, y1, x2, y2) => callback(x1, y1, x2, y2, triangle.innerBorderColorHex));
            }
        }
    }

    forEachOuterBorder(callback) {
        const { getTriangleAdjecentToEdge, edgeLine } = this;

        if (!this.visible || !this.outer)
            return;

        for (let i = 0; i < 3; i++) {
            const triangle = getTriangleAdjecentToEdge(i);

            if (triangle && !triangle.outer) {
                edgeLine(i, (x1, y1, x2, y2) => callback(x1, y1, x2, y2, triangle.outerBorderColorHex));
            }
        }
    }

    /*

        Index

    */

    getNonOffsetInscribedRect() {

        const edges = this.getNonOffsetEdgeLines();
        const midpoint = (edge) => { return { x : 0.5 * (edge.x1 + edge.x2), y: 0.5 * (edge.y1 + edge.y2) } };


        // find the longest side
        let widest = 0;
        let widestEdgeIndex = 0;
        for (let i = 0; i < 3; i++)
        {
            const edge = edges[i];
            const w = MathHelper.distance(edge.x1, edge.y1, edge.x2, edge.y2); 
            if (w > widest)
            {
                widest = w;
                widestEdgeIndex = i;
            }
        }


        // The widest edge is the edge we want to project the midpoints of the two other edges to
        // to get the largest rectangle with the correct orientation, so we pick the points on the other two edges
        const point1 = midpoint(edges[(widestEdgeIndex + 1) % 3 ]);
        const point2 = midpoint(edges[(widestEdgeIndex + 2) % 3 ]);
        const projectOnEdge = edges[widestEdgeIndex];

        // Project
        const proj1 = MathHelper.pointLineProject(point1.x, point1.y, projectOnEdge.x1, projectOnEdge.y1, projectOnEdge.x2, projectOnEdge.y2);
        const proj2 = MathHelper.pointLineProject(point2.x, point2.y, projectOnEdge.x1, projectOnEdge.y1, projectOnEdge.x2, projectOnEdge.y2);

        const cx = 0.5 * (proj1.x + point2.x);
        const cy = 0.5 * (proj1.y + point2.y);

        const a =  Math.atan2((proj2.y - proj1.y) , (proj2.x - proj1.x));
        const flip = a < -(0.5 * Math.PI) || a > (0.5 * Math.PI);

        return {

            height : MathHelper.distance(proj1.x, proj1.y, point1.x, point1.y),
            width : MathHelper.distance(proj1.x, proj1.y, proj2.x, proj2.y),

            x1: proj1.x,
            y1: proj1.y,
            x2: proj2.x,
            y2: proj2.y,
            
            x3: point2.x,
            y3: point2.y,

            x4: point1.x,
            y4: point1.y,

            cx : cx,
            cy : cy,

            flip : flip,
            angle: (360 / (2 * Math.PI)) * Math.atan((proj2.y - proj1.y) / (proj2.x - proj1.x))
        }
    }


}

