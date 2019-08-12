var MathHelper = {
    // Get a value between two values
    clamp: function (value, min, max) {

        if (value < min) {
            return min;
        }
        else if (value > max) {
            return max;
        }

        return value;
    },

    // Get the linear interpolation between two value
    lerp: function (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    },

    // Get the linear interpolation between two value
    lerpColor: function (value1, value2, amount) {
        return [this.lerp(value1[0], value2[0], amount),
                this.lerp(value1[1], value2[1], amount),
                this.lerp(value1[2], value2[2], amount)]
    },

    shortAngleDist: function (a0,a1) {
        var max = Math.PI*2;
        var da = (a1 - a0) % max;
        return 2*da % max - da;
    },
    
    lerpAngle: function (a0,a1,t) {
        var max = Math.PI*2;
        var da = (a1 - a0) % max;
        return a0 + (2*da % max - da)*t;
    },

    rotateX: function (x, y, cx, cy, radians) {
        var cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;

        return nx;
    },

    rotateY: function (x, y, cx, cy, radians) {
        var cos = Math.cos(radians),
            sin = Math.sin(radians),
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return ny;
    },

    // returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
    lineIntersect: function (x1, y1, x2, y2, x3, y3, x4, y4) {

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }

        let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // Lines are parallel
        if (denominator === 0) {
            return false;
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }

        return true;
    },

    pointLineProject: function(px, py, ax, ay, bx, by)
    {
        const atobx = bx - ax;
        const atoby = by - ay;
        const atopx = px - ax;
        const atopy = py - ay;
        const len = atobx * atobx + atoby * atoby;
        const dot = atopx * atobx + atopy * atoby;
        const t = Math.min( 1, Math.max( 0, dot / len ) );
        return {
            x: ax + atobx * t,
            y: ay + atoby * t
        };
    },

    distance: function(x1, y1, x2, y2)
    {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt((dx * dx) + (dy * dy));
    }
};
export default MathHelper;

// Obtient une valeur comprise dans un interval
Math.clamp = function (value, min, max) {

	if (value < min) {
		return min;
	}
	else if (value > max) {
		return max;
	}

	return value;
};