import TriangleSet from "./triangleset";

class AwesomeTriangleSet extends TriangleSet{
    /**
     * Constructs a set of triangles (derived from Triangle class)
     * @param {*} points 
     * @param {*} newTriangleCallback - (TriangleSet, index) constructor for a class that's derived from Triangle
     */
    constructor(points, newTriangleCallback)
    {
        super(points, newTriangleCallback);   

        this.markedTriangles = [];
    }

    provideRects(innerRects, outerRects, screenRect, imm)
    {
        for (const triangle of this.triangles)
        {
            triangle.inner = false;
            triangle.outer = false;
            triangle.blocked = false;
            triangle.between = false;

            for (const rect of innerRects)
            {
            
                triangle.inner |= triangle.fullyInRect(rect);
                triangle.blocked |= triangle.inner;
                
                /*
                if (!triangle.inner && triangle.intersectsRect(rect) && triangle.intersectsRect(screenRect))
                {
                    triangle.between = true;
                }
                */

            }

            for (const rect of outerRects)
            {
                triangle.outer |= triangle.touchesRect(rect);
                if (triangle.outer)
                    triangle.inner = false;
                    

                triangle.blocked |= triangle.outer;

                /*
                if (!triangle.outer && !triangle.inner)
                {
                    let foundOuter = false;
                    let foundInner = false;

                    triangle.forEachAdjecentTriangle((adj) => {

                        foundInner |= adj.inner;
                        foundOuter |= adj.outer;

                    });

                    triangle.between = foundInner && foundOuter;
                }
                */


            }

            if (imm)
                triangle.fastForwardExceptPage();
        }
    }

    setPageTransition(pageTransition)
    {
        for (const triangle of this.triangles)
        {
            triangle.pageTransition = pageTransition;
        }
    }

    getNonBlockingTriangleFromPoint(x, y)
    {
        return this.getTriangleFromPointPredicate(x, y, triangle => !triangle.blocked);
    }

    getNonBlockingMarkedTriangleFromPoint(x, y)
    {
        for (let i = 0; i < this.markedTriangles.length; i++)
        {
            const triangle = this.markedTriangles[i];
            if (!triangle.blocked && triangle.containsPoint(x, y))
            {
                return triangle;
            }
        }
    }

    addToMarked(triangle)
    {
        this.markedTriangles.push(triangle);
    }
}
export default AwesomeTriangleSet;