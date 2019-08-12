import * as PIXI from 'pixi.js'

class PianoRoll {


    constructor (stage, renderer, options)
    {

        this.graphics = new PIXI.Graphics();
        this.renderer = renderer;

        stage.addChild(this.graphics);

        // Initialize options
        let defaults = {
            keyWidthRatio : 0.5,
            keyAspect : 0.25, // ratio of key height to width
            keyCount : 128,

            maxConnectionsHeight : 100,

            blackKeyHeightRatio : 0.5,
            blackKeyWidthRatio : 0.66,
            pressedPixelInset : 2, // amount of pixels key insets when pressed
            connectionCount : 4,

            lineWidth : 2
        };

        this.options = Object.assign({}, defaults, options);
        this.offsetY = 0;
        this.prevHoveredKey = null;

        this.connectionY = 0;
        this.connections = [];
        this.prevConnections = [];

        // Calculate key width:
        this.keyWidth = renderer.width * this.options.keyWidthRatio; 
        this.keyHeight = this.keyWidth * this.options.keyAspect;
      
        // derived from options
        this.blackKeyOffset = 0.5 * this.keyHeight * this.options.blackKeyHeightRatio;
        this.blackKeyHeight = this.keyHeight * this.options.blackKeyHeightRatio;
        this.blackKeyWidth = this.keyWidth * this.options.blackKeyWidthRatio;

        this.connectionX = renderer.width - this.options.lineWidth / 2;
        this.connectionCornerDepth = this.keyWidth / (this.options.connectionCount + 1);


        this.keys = this.createKeys();
    }

    whiteKeyCount = () => {
        return Math.floor((this.options.keyCount / 12) * 7);
    }

    createKeys = () => {
        const { keyCount, blackKeyHeightRatio, blackKeyWidthRatio } = this.options;
        const { keyWidth, keyHeight } = this;

        let keys = [];
        let currentY = this.whiteKeyCount() * keyHeight;
       
        for (var i = 0; i < keyCount; i++)
        {
            let m = i % 12;
            let isBlack =  
                m === 1 || 
                m === 3 ||
                m === 6 ||
                m === 8 ||
                m === 10;
            
            // Key states:
            // 0 - inactive
            // 1 - hovered
            // 2 - pressed

            keys.push({
                noteNumber : i,
                state : 0,
                isBlack : isBlack,
                enabled : i % 3 === 0,

                // For black keys, use 'previous' currentY
                y : isBlack ? currentY + keyHeight - this.blackKeyOffset : currentY, // y is top left
                centerY : isBlack ? currentY + keyHeight - this.blackKeyOffset + this.blackKeyHeight / 2 : currentY + keyHeight / 2, // center key Y for hit detection

                height : isBlack ? this.blackKeyHeight : keyHeight,
                width : isBlack ? this.blackKeyWidth : keyWidth

            });

            if (!isBlack)
                currentY -= keyHeight;
        }

        return keys;
    }

    visibleWhiteKeys = (callback) => {
        for (var i = 0; i < this.keys.length; i++)
        {
            var key = this.keys[i];
            if (this.isKeyVisible(key) && !key.isBlack)
            {
                callback(key, key.y - this.offsetY);
            }
        }
    }

    visibleBlackKeys = (callback) => {
        for (var i = 0; i < this.keys.length; i++)
        {
            var key = this.keys[i];
            if (this.isKeyVisible(key) && key.isBlack)
            {
                callback(key, key.y - this.offsetY);
            }
        }
    }

    isKeyVisible = (key) => {
        var y = key.y - this.offsetY;
        return y >= -this.keyHeight && y < this.renderer.height;
    }

    closestKey = (y, predicate = (key) => true) => {

        let trueY = y + this.offsetY;
        let whiteKeyCount = this.whiteKeyCount();
        let closestWhiteKeyIndex = whiteKeyCount - Math.round(trueY / this.keyHeight);
      
        if (closestWhiteKeyIndex < 0 || closestWhiteKeyIndex >= whiteKeyCount)
            return null;

        let closestCindex = Math.floor(closestWhiteKeyIndex / 7) * 12;

        // now loop from that C through the octave above to see which key is closest
        let closestDist = 99999;
        let closestKey = null;

        // Loop through 2 octaves in case we're on a B or something
        for (let i = closestCindex; i < Math.min(closestCindex + 24, this.options.keyCount); i++)
        {
            let dist = Math.abs(this.keys[i].centerY - trueY);
            if (dist < closestDist && predicate(this.keys[i]))
            {
                closestDist = dist;
                closestKey = this.keys[i];
            }
        }
        
        return closestKey;
    }

    whiteIndexToAll = (index) => {
        return;
    }

    // Updates the key states
    update = (attach) => {

        this.attach = attach;
        if (!attach)
        {
            return;
        }

        if (this.keys.length === 0)
            return;

        // Unset prev connections
        for (let i = 0; i < this.connections.length; i++)
        {
            this.keys[this.connections[i]].state = 0;
        }

        // Find new connections
        const { connectionCount } = this.options;
        this.connections = [];

      
        for (let i = 0; i < connectionCount && this.connections.length < connectionCount; i++)
        {
            let t = i / (connectionCount - 1);
            let attachSeekY = attach.top + (attach.bottom - attach.top) * t;

            let closestKey = this.closestKey(attachSeekY, (key) => key.enabled && key.state === 0 && this.isKeyVisible(key));
            if (closestKey !== null)
            {
                closestKey.state = 1;
                this.connections.push(closestKey.noteNumber);
            }
        }

        // Set current
        for (let i = 0; i < this.connections.length; i++)
        {
            this.keys[this.connections[i]].state = 1;
        }

        this.connections.sort((a,b) => a < b);
    }

    draw = () => {

        const { pressedPixelInset } = this.options;

        this.graphics.clear();
        this.graphics.beginFill(0xFFFFFF);
        this.graphics.lineStyle(1, 0x000000, 1, 0);
        
        this.visibleWhiteKeys((key, y) => {
            if (key.state === 1)
            {
                this.graphics.drawRect(0, y + pressedPixelInset, key.width - pressedPixelInset, key.height - 2 * pressedPixelInset);
            }
            else
            {
                this.graphics.drawRect(0, y, key.width, key.height);
            }
        });

        this.graphics.beginFill(0x000000);
        this.visibleBlackKeys((key, y) => {
            if (key.state === 1 )
            {
                this.graphics.drawRect(0, y + pressedPixelInset, key.width - pressedPixelInset, key.height - 2 * pressedPixelInset);
            }
            else
            {
                this.graphics.drawRect(0, y, key.width, key.height);
            }
        });
        this.graphics.endFill();

    }

    drawConnections = () => {

        const { attach } = this;
        if (!attach)
            return;

       

        let connectionX = this.connectionX;
        let connectionsHeight = (attach.bottom - attach.top);

        let minDepth = (this.renderer.width - this.keyWidth) * 0.25;
        let maxDepth = (this.renderer.width - this.keyWidth) * 0.75;


        this.graphics.lineStyle(2, 0xFF0000, 1, 0.5);
        let numConnections = this.connections.length;

        for (let i = 0; i < numConnections; i++)
        {
            let t = i / (numConnections - 1);
            let key = this.keys[this.connections[i]];

            let attachedY = attach.top + connectionsHeight * t;
            let targetY = key.centerY - this.offsetY;
            let targetX = key.isBlack ? this.blackKeyWidth / 2 : this.keyWidth * 0.75;

            let depth = minDepth + (maxDepth - minDepth) * t;

            this.graphics
                .moveTo(connectionX, attachedY)
                .lineTo(connectionX - depth, attachedY)
                .lineTo(connectionX - depth, targetY)
                .lineTo(targetX + 4, targetY)
                .drawCircle(targetX, targetY, 4);
        }
    }
}
export default PianoRoll