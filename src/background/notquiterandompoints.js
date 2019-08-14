import { hslToRgb } from '../util/colorhelper.js';

class NotQuiteRandomPoints
{
    constructor(w, h, indexHeight, indexAmt, restAmt, callback)
    {   
        this.w = w;
        this.h = h;

        const totalXedge = restAmt / 10;
        const totalColumnEdge = totalXedge;
        const totalIndexYedge = 24;
        const columnWidth = 800;
        const columnMargin = 10;

        this.flatArray = new Float32Array(2 * (indexAmt + restAmt + totalXedge + totalIndexYedge + totalColumnEdge));


        // fill up index space:
        for (let i = 0; i < indexAmt; i += 2)
        {
            this.flatArray[i] =  Math.random() * w;
            this.flatArray[i + 1] = Math.random() * indexHeight;
        }

        let n = 0;
        for (let i = 0; i < restAmt; i++)
        {
            n = (indexAmt * 2) + i * 2;

            // prefer center X
            /*
            let rX = 0.5 * Math.pow(Math.random(), 2);
            let x = (0.5 * w) + w * (Math.random() < 0.5 ? -rX : rX);
            */

            // prefer side X
            /*
            let rX = 0.5 * (1 - Math.pow(1 - Math.random(), 2));
            let x = (0.5 * w) + w * (Math.random() < 0.5 ? -rX : rX);
            */

            // no prefer X
        
            let x = w * Math.random();
            let y = indexHeight + Math.random() * (h - indexHeight);
            this.flatArray[n] = x;
            this.flatArray[n + 1] = y;
        }


        for (let i = 0; i < totalXedge; i += 2)
        {
            n = 2 * (indexAmt + restAmt) + i * 2;
            const y = (i / totalXedge) * h;
            this.flatArray[n] = w;
            this.flatArray[n + 1] = y;

            this.flatArray[n + 2] = 0;
            this.flatArray[n + 3] = y;
        }

        for (let i = 0; i < totalColumnEdge; i += 2)
        {
            n = 2 * (indexAmt + restAmt + totalXedge) + i * 3;
            const y = indexHeight + (i / totalColumnEdge) * (h - indexHeight);

            this.flatArray[n] = (w / 2) - columnWidth / 2 - columnMargin - (columnMargin * Math.random());
            this.flatArray[n + 1] = y;

            this.flatArray[n + 2] =  (w / 2) + columnWidth / 2 + columnMargin + (columnMargin * Math.random());
            this.flatArray[n + 3] = y;

            // Center x line for posts that have no images
            this.flatArray[n + 4] =  (w / 2);
            this.flatArray[n + 5] = y;
        }

        for (let i = 0; i < totalIndexYedge; i += 2)
        {
            n = 2 * (indexAmt + restAmt + totalXedge + totalColumnEdge) + i * 2;
            const x = (i / totalIndexYedge) * w;

            this.flatArray[n] = x;
            this.flatArray[n + 1] = indexHeight - (columnMargin * Math.random());

            this.flatArray[n + 2] = x;
            this.flatArray[n + 3] = 0;
        }

        callback(this);
    }

    getColor = (point) =>
    {
        const x01 = point.x / this.w;
        const y01 = point.y / this.h;
        return hslToRgb(y01 * Math.random(), 0.75 - 0.5 * x01, Math.random());
    }
}
export default NotQuiteRandomPoints;