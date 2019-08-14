/**
 * Depends on triangle.js
 * (c) 2019 - Bart van de Sande
 */


import Delaunator from 'delaunator';

class TriangleSet
{
    /**
     * Constructs a set of triangles (derived from Triangle class)
     * @param {*} points 
     * @param {*} newTriangleCallback - (TriangleSet, index) constructor for a class that's derived from Triangle
     */
    constructor(points, newTriangleCallback)
    {
        this.delaunator = new Delaunator(points);
        this.points = points;
       
        this.triangles = [];
        this.uniqueIndexCounter = new Uint8Array(points.length);

        // Generate all triangle objects
        for (let i = 0; i < this.delaunator.triangles.length / 3; i++)
        {
            this.triangles.push(newTriangleCallback(this, i));
        }

       
    }

    forEach(callback)
    {
        this.triangles.forEach(callback);
    }

    setOffset(x, y)
    {
        for (const triangle of this.triangles)
            triangle.setOffset(x, y);
    }

    get triangleCount()
    {
        // fix: this is called when filling the this.triangles array to determine color,
        // so we return the count in delaunator so we never divide by zero
        return this.delaunator.triangles.length / 3;
    }

    /**
     * Returns the triangles sorted by bounding rect area from large to small
     */
    getSortedByBoundingRectArea(predicate)
    {
        return this.triangles.slice().sort((a, b) => a.getBoundingRectArea() < b.getBoundingRectArea() ? 1 : -1).filter(predicate);
    }

    getTriangleFromPoint(x, y)
    {
        for (let i = 0; i < this.triangleCount; i++)
        {
            const triangle = this.triangles[i];
            if (triangle.containsPoint(x, y))
            {
                return triangle;
            }
        }
    }

    getTriangleFromPointPredicate(x, y, predicate)
    {
        for (let i = 0; i < this.triangleCount; i++)
        {
            const triangle = this.triangles[i];
            if (predicate(triangle) && triangle.containsPoint(x, y))
            {
                return triangle;
            }
        }
    }

    forEachTriangleTouchingRect(rect, callback)
    {
        this.triangles.forEach((triangle) => {

            if (triangle.touchesRect(rect))
                callback(triangle);

        });
    }

    forEachTriangleFullyInRect(rect, callback)
    {
        this.triangles.forEach((triangle) => {

            if (triangle.fullyInRect(rect))
                callback(triangle);

        });
    }

    getTriangleIndices(i) {
        const { triangles } = this.delaunator;
        const startIndex = i * 3;

        return [
            triangles[startIndex] * 2,
            triangles[startIndex] * 2 + 1,

            triangles[startIndex + 1] * 2,
            triangles[startIndex + 1] * 2 + 1,

            triangles[startIndex + 2] * 2,
            triangles[startIndex + 2] * 2 + 1
        ]
    }

    getTrianglePoints(i) {
        const { points } = this;
        const indices = this.getTriangleIndices(i);
        return [
            points[indices[0]],
            points[indices[1]],
            points[indices[2]],
            points[indices[3]],
            points[indices[4]],
            points[indices[5]]
        ]
    }

    getTriangleAdjecentToEdge(triangleIndex, edgeIndex)
    {
        const { delaunator, triangleOfEdge, edgesOfTriangle  } = this;

        const e = edgesOfTriangle(triangleIndex)[edgeIndex];

        const opposite = delaunator.halfedges[e];
        if (opposite >= 0) {
           return this.triangles[triangleOfEdge(opposite)];
        }
        
        return null;
    }

    forEachAdjecentTriangleIndex(index, callback)
    {
        const { delaunator, triangleOfEdge, edgesOfTriangle  } = this;

        for (const e of edgesOfTriangle(index)) {
            const opposite = delaunator.halfedges[e];
            if (opposite >= 0) {
                callback(triangleOfEdge(opposite));
            }
        }
    }

    triangleOfEdge(e) { return Math.floor(e / 3); }
    edgesOfTriangle(t) { return [3 * t, 3 * t + 1, 3 * t + 2]; }

    trianglesAdjacentToTriangle(t) {
        const { delaunator, triangleOfEdge, edgesOfTriangle  } = this;
        const adjacentTriangles = [];
        for (const e of edgesOfTriangle(t)) {
            const opposite = delaunator.halfedges[e];
            if (opposite >= 0) {
                adjacentTriangles.push(triangleOfEdge(opposite));
            }
        }

        return adjacentTriangles;
    }
}
export default TriangleSet;