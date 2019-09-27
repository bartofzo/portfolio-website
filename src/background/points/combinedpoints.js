import MathHelper from '../../util/mathhelper.js';
class CombinedPoints
{

    constructor(sources)
    {
        this.sources = sources;

        let totalSize = 0;
        for (const source of sources)
        {
            totalSize += source.flatArray.length;
        }

        this.flatArray = new Float32Array(totalSize);
        let offset = 0;

        for (const source of sources)
        {
            this.flatArray.set(source.flatArray, offset);
            offset += source.flatArray.length;
        }
    }

    getColor = (point) =>
    {
        const { sources } = this;
        let color = [0,0,0,0];

        for (const source of sources)
        {
            const sourceColor = source.getColor(point);
            // Lerp color by alpha
            color = MathHelper.lerpColor(color, sourceColor, sourceColor[3]);
        }

        return color;
    }
}
export default CombinedPoints