

import Triangle from './triangle.js'
import * as PIXI from 'pixi.js-legacy'
import MathHelper from '../../util/mathhelper.js';
import SmoothBoolean from '../../util/smoothboolean.js';



export default class AwesomeTriangle extends Triangle {
    constructor(triangleSet, index, getTime, getColor, transitionDurations) {
        super(triangleSet, index);

        this.getTime = getTime;

        // overlap state:
        this.inner = false;
        this.outer = false;
        this.pageTransition = false;
        this.hover = false;
        this.blocked = false;

        this.aniOuter = new SmoothBoolean(transitionDurations.outer.on, transitionDurations.outer.off, getTime);
        this.aniHover = new SmoothBoolean(transitionDurations.hover.on, transitionDurations.hover.off, getTime, true, this.hover, 0, 0.5);
        this.aniInner = new SmoothBoolean(transitionDurations.inner.on, transitionDurations.inner.off, getTime);

        // Note page transition starts in ON state but the var on here is set to off. That way
        // a triangle always starts white and moves to colored
        this.aniPageTransition = new SmoothBoolean(transitionDurations.pageTransition.on, transitionDurations.pageTransition.off, getTime, true, true);

        this.originalColor = getColor(this.getCenterCoordinate());

        this.outerBorderColorHex = PIXI.utils.rgb2hex(MathHelper.lerpColor(this.originalColor, [1, 1, 1], 0.5));
        this.innerBorderColorHex = PIXI.utils.rgb2hex(MathHelper.lerpColor(this.originalColor, [0, 0, 0], 1));
    }

    /*

        State

    */

    mark()
    {
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
                aniOuter.get(outer),
                aniPageTransition.get(pageTransition)));
    }

    get alpha() {
        const { aniHover, aniInner, aniOuter, aniPageTransition, hover, inner, outer, page } = this;
        return MathHelper.lerp(1, 0,

            // Inner transition takes precedence over hover
            Math.max(
                aniInner.get(inner),
                aniHover.get(hover)));
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

