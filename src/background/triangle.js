/**
 * Depends on triangleset.js
 * (c) 2019 - Bart van de Sande
 */

import MathHelper from '../util/mathhelper.js';

export default class Triangle
{
    /**
     * Constructs a base triangle from the delaunator
     * @param {*} triangleSet 
     * @param {*} index 
     */
    constructor(triangleSet, index)
    {
        this.index = index;
        this.triangleSet = triangleSet;
        this.indices = triangleSet.getTriangleIndices(index);
        this.points = triangleSet.getTrianglePoints(index);

        this.offX = 0;
        this.offY = 0;

        // Used for quicky determining if triangle is certainly not in a (screen) rect
        this.boundingRect = {
            left :  
                    Math.min(this.points[0], 
                    Math.min(this.points[2],
                    Math.min(this.points[4]))),

            right : 
                    Math.max(this.points[0], 
                    Math.max(this.points[2],
                    Math.max(this.points[4]))),
            
            top :   
                    Math.min(this.points[1], 
                    Math.min(this.points[3],
                    Math.min(this.points[5]))),

            bottom :
                    Math.max(this.points[1], 
                    Math.max(this.points[3],
                    Math.max(this.points[5])))
        }
    }

    /**
     * Returns the area of the bounding rect of this triangle
     */
    getBoundingRectArea()
    {
        const { boundingRect } = this;
      
        return (boundingRect.right - boundingRect.left) * (boundingRect.bottom - boundingRect.top);
    }

    /**
     * Returns the center point of this triangle as an object with x and y
     */
    getCenterCoordinate()
    {
        const { offX, offY, points } = this;
        return {
            x : (points[0] + points[2] + points[4]) / 3 + offX,
            y : (points[1] + points[3] + points[5]) / 3 + offY
        }
    }


    /**
     * Set the offset of this triangle in respect to it's points (useful for a scrolling effect)
     * @param {*} x 
     * @param {*} y 
     */
    setOffset(x, y)
    {
        this.offX = x;
        this.offY = y;
    }

    /**
     * Enumerates all edges as lines
     * @param callback {function} x1, y1, x2, y2 
     */
    forEachLine(callback)
    {
        const { points, offX, offY } = this;

        callback(points[0] + offX, points[1] + offY, points[2] + offX, points[3] + offY);
        callback(points[2] + offX, points[3] + offY, points[4] + offX, points[5] + offY);
        callback(points[4] + offX, points[5] + offY, points[0] + offX, points[1] + offY);

    }

    /**
     * Returns the edges of this triangle without the offset as an array of objects
     */
    getNonOffsetEdgeLines()
    {
        const { points } = this;
        return ([
            { x1 : points[0], y1:  points[1], x2:  points[2], y2: points[3]},
            { x1 : points[2], y1:  points[3], x2: points[4], y2: points[5]},
            { x1:  points[4], y1: points[5], x2: points[0], y2: points[1]}])
    }

    /**
     * Enumerates all end points of the edges , use in conjunction with startingPoint
     * @param callback {function} x2, y2 
     */
    forEachLineEndPoint(callback)
    {
        const { points, offX, offY } = this;

        callback(points[2] + offX, points[3] + offY);
        callback(points[4] + offX, points[5] + offY);
        callback(points[0] + offX, points[1] + offY);
    }

    /**
     * Calls back with the starting point of this triangle (x,y)
     */
    startingPoint(callback)
    {
        const { points, offX, offY } = this;
        callback(points[0] + offX, points[1] + offY);
    }

    /**
     * Enumerates all adjecent triangles to this triangle from the containing triangle set.
     */
    forEachAdjecentTriangle(callback)
    {
        const { triangleSet } = this;
        triangleSet.forEachAdjecentTriangleIndex(this.index, (adjecentIndex) => callback(triangleSet.triangles[adjecentIndex]));
    }

    edgeLine = (e, callback) =>
    {
        const { points, offX, offY } = this;

        callback(
                points[e * 2] + offX, 
                points[e * 2 + 1] + offY, 
                points[(e * 2 + 2) % 6] + offX, 
                points[(e * 2 + 3) % 6] + offY);
    }

    /**
     * Returns the triangle that is adjectent to edge x, null if none
     * @param {*} edgeIndex 
     */
    getTriangleAdjecentToEdge = (edgeIndex) =>
    {
        return this.triangleSet.getTriangleAdjecentToEdge(this.index, edgeIndex);
    }

    /**
     * Returns true when the triangle is certainly NOT in the rect
     * doesn't mean it is certainly in the rect
     */
    certainlyNotInRect = (rect) =>
    {
        const { boundingRect, offX, offY } = this;
        if (rect.right < (boundingRect.left + offX) ||
            rect.left > (boundingRect.right + offX) ||
            rect.top > (boundingRect.bottom + offY) ||
            rect.bottom < (boundingRect.top + offY ))
            {
                return true;
            }
        return false;
    }

    /**
     * Returns true when this triangle contains point x,y
     * credit: http://www.blackpawn.com/texts/pointinpoly/default.html
     */
    containsPoint(x, y)
    {
        const { points, offX, offY } = this;
        
        var v0 = [points[4] - points[0], points[5] - points[1]];
        var v1 = [points[2] - points[0], points[3] - points[1]];
        var v2 = [x - (points[0] + offX), y - (points[1] + offY)];
        
        var dot00 = (v0[0]*v0[0]) + (v0[1]*v0[1]);
        var dot01 = (v0[0]*v1[0]) + (v0[1]*v1[1]);
        var dot02 = (v0[0]*v2[0]) + (v0[1]*v2[1]);
        var dot11 = (v1[0]*v1[0]) + (v1[1]*v1[1]);
        var dot12 = (v1[0]*v2[0]) + (v1[1]*v2[1]);
        
        var invDenom = 1/ (dot00 * dot11 - dot01 * dot01);
        
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        
        return ((u >= 0) && (v >= 0) && (u + v < 1));
    }

    /**
     * Returns true when this triangle is fully contained by a rect
     */
    fullyInRect = (rect) =>
    {
        const { points, offX, offY } = this;

        // check if ALL of the triangle points are within the rect
        for (let i = 0; i < 6; i += 2)
        {
            const x = points[i] + offX;
            const y = points[i + 1] + offY;

            if ((x < rect.left) ||
                (x > rect.right) ||
                (y < rect.top) ||
                (y > rect.bottom))
                {
                    return false;
                }
        }

        return true;
    }

    /**
     * Returns true when this triangle is fully contained by a rect, whithout this triangles scroll offset applied
     */
    fullyInRectNoOffset = (rect) =>
    {
        const { points } = this;


        // check if ALL of the triangle points are within the rect
        for (let i = 0; i < 6; i += 2)
        {
            const x = points[i] ;
            const y = points[i + 1] ;

            if ((x < rect.left) ||
                (x > rect.right) ||
                (y < rect.top) ||
                (y > rect.bottom))
                {
                    return false;
                }
        }

        return true;
    }



    /**
     * Returns true when this triangle intersects with rect (contained by rect does not count!)
     */
    intersectsRect = (rect) => {

        const {  points, offX, offY } = this;

        for (let i = 0; i < 6; i += 2)
        {
            const x1 = points[i] + offX;
            const y1 = points[i + 1] + offY;
            const x2 = points[(i + 2) % 6] + offX;
            const y2 = points[(i + 3) % 6] + offY;

            if (MathHelper.lineIntersect(
                rect.left, rect.top, rect.right, rect.top,
                x1, y1, x2, y2))
                {
                    return true;
                }


            if (MathHelper.lineIntersect(
                rect.right, rect.top, rect.right, rect.bottom,
                x1, y1, x2, y2))
                {
                    return true;
                }
            
            if (MathHelper.lineIntersect(
                rect.right, rect.bottom, rect.left, rect.bottom,
                x1, y1, x2, y2))
                {
                    return true;
                }

            if (MathHelper.lineIntersect(
                rect.left, rect.bottom, rect.left, rect.top,
                x1, y1, x2, y2))
                {
                    return true;
                }

        }

        return false;
    }

    /**
     * Returns true when this triangle either intersects or is fully in a rect
     */
    touchesRect = (rect) => {
        return this.fullyInRect(rect) || this.intersectsRect(rect);
    }
}