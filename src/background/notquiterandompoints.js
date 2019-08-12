Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

class NotQuiteRandomPoints
{
    constructor(w, h, indexHeight, indexAmt, restAmt)
    {   
        this.w = w;
        this.h = h;

        const straight = restAmt / 10;
        
      
        this.flatArray = new Float32Array(8 + 2 * (indexAmt + restAmt + straight));

        // Always fill corners of the entire playground
        this.flatArray[0] = 0;
        this.flatArray[1] = 0;
        this.flatArray[2] = w;
        this.flatArray[3] = 0;
        this.flatArray[4] = w;
        this.flatArray[5] = h;
        this.flatArray[6] = 0;
        this.flatArray[7] = h;
        

        // fill up index space:
        for (let i = 8; i < indexAmt; i += 2)
        {
            this.flatArray[i] =  Math.random() * w;
            this.flatArray[i + 1] = Math.random() * indexHeight;
        }

        let n = 0;
        for (let i = 0; i < restAmt; i++)
        {
            n = 8 + (indexAmt * 2) + i * 2;

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


        for (let i = 0; i < straight; i += 2)
        {
            n = 8 + (indexAmt * 2) + (restAmt * 2) + i * 2;
            const y = (i / straight) * h;
            this.flatArray[n] = w;
            this.flatArray[n + 1] = y;

            this.flatArray[n + 2] = 0;
            this.flatArray[n + 3] = y;
        }

 

    }

    update()
    {
        const { flatArray, flatArrayOrig, w, h } = this;
        const now = performance.now();
        
        for (let i = 8; i < this.flatArray.length; i += 2)
        {
            flatArray[i] = flatArrayOrig[i] + 10 * Math.sin(now / (300 * (i % 10)));
            flatArray[i + 1] = flatArrayOrig[i + 1] + 10 * Math.sin(now / (400 * (i % 10)));
        }
    }

    /*
    update()
    {
        const { flatArray, flatArrayVelocity, w, h } = this;

        for (let i = 8; i < this.flatArray.length; i += 2)
        {
            flatArray[i] = (flatArray[i] + flatArrayVelocity[i]).mod(w);
            flatArray[i + 1] = (flatArray[i + 1] + flatArrayVelocity[i + 1]).mod(h);

            flatArrayVelocity[i] *= 0.99;
            flatArrayVelocity[i + 1] *= 0.99;
        }
    }
    */


    nudge(x, y, indices)
    {

        const { flatArrayDelta, flatArrayVelocity } = this;

        for (let i = 0; i < indices.length; i += 2)
        {
            flatArrayVelocity[indices[i]] += 0.001 * x;
            flatArrayVelocity[indices[i + 1]] += 0.001 * y;
        }
    }

  


}
export default NotQuiteRandomPoints;