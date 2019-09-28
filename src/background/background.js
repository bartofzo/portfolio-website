import * as PIXI from 'pixi.js'
import React from 'react';
import { withRouter } from 'react-router-dom';
import ImagePoints from './points/imagepoints.js';
import BorderPoints from './points/borderpoints.js';
import RandomPoints from './points/randompoints.js';
import RandomColorSampler from './samplers/randomcolorsampler.js';
import { getImageColorSamplerAsync } from './samplers/imagecolorsampler.js';
import AwesomeTriangleSet from './awesometriangleset.js';
import { debounce } from '../util/debounce.js';
import AwesomeTriangle from './awesometriangle.js';
import AnimationFrameTail from '../util/animationframetail.js';
import IndexElements from './indexelements.js';
import { getAllRects } from './boundingrects.js';
import CombinedPoints from './points/combinedpoints.js';

const oversizedX = 1;
const oversizedY = 2;
const MOBILE_VERTICAL_ENLARGE = 100;


const transitionDurations = {
    outer : { on : 10, off : 350 },
    inner : { on : 1000, off : 1000 },
    hover : { on : 50, off : 300 },
    pageTransition : {on : 300, off: 300},
    max : 1000
};


class Background extends React.Component {

    constructor(props) {
        super(props);

        this.state = { style : {} };

        this.initPixi();
        this.animationFrameTail = new AnimationFrameTail(transitionDurations.max, this.draw);
    }

    initPixi()
    {
        this.pixi_cnt = null;
        this.app = new PIXI.Application({ 

            autoResize: false,
            transparent: true, 
            antialias : true, 
            clearBeforeRender : true,

            resolution: window.devicePixelRatio,
            autoDensity : true
            

        });

        this.graphic = new PIXI.Graphics();
        this.borderGraphic = new PIXI.Graphics();
      
        this.app.stage.addChild(this.graphic);
        this.app.stage.addChild(this.borderGraphic);
    }



    updatePixiCnt = (element) => {
        // the element is the DOM object that we will use as container to add pixi stage(canvas)
        this.pixi_cnt = element;    //now we are adding the application to the DOM element which we got from the Ref.

        if (this.pixi_cnt && this.pixi_cnt.children.length <= 0) {
            this.pixi_cnt.appendChild(this.app.view); //The setup function is a custom function that we created to add the sprites. We will this below
            this.setup();
        }
    };

    setup() {
        this.app.renderer.plugins.interaction.on('mousemove', this.onMouseMove);
        //this.app.renderer.plugins.interaction.destroy();
        PIXI.Ticker.shared.destroy();
        
    };


    componentDidMount() {
        this.prevWindowHeight = window.innerHeight;
        this.onResize = debounce(this.onResize, 100);
        window.addEventListener('resize', this.onResize);
        window.addEventListener('scroll', this.onScroll);

        this.onResize();
    }

    componentWillUnmount() {

        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
    }

    onResize = () => {
        if (!this.props.page)
            return;

        if (Math.abs(window.innerHeight - this.prevWindowHeight) > MOBILE_VERTICAL_ENLARGE)
        {
            this.prevWindowHeight = window.innerHeight;
            this.transitionOut(() =>  this.generateAndCallTransitionIn(this.props.page));
        }

        const parent = this.app.view.parentNode;
        this.screenWidth = parent.clientWidth;
        this.screenHeight = parent.clientHeight;
        this.totalWidth = this.screenWidth * oversizedX;
        this.prevScrollX = window.scrollX;
        this.prevScrollY = window.scrollY;
        this.totalHeight = this.screenHeight + this.screenHeight * oversizedY;

        this.app.renderer.resize(this.screenWidth, this.screenHeight);

        const { totalWidth , totalHeight, screenWidth, screenHeight } = this;
        this.screenRect = {
            left : 0,
            top : 0,
            right : screenWidth,
            bottom : screenHeight
        };

        this.calculateOffset();
    }

    /**
     * Regenerates triangles according to page settings, or of randomize flag is set, does a random background
     * After it finishes calls transitionIn automatically to fade in the new triangles smoothly
     */
    async generateAndCallTransitionIn(page, randomize)
    {
        
        const parent = this.app.view.parentNode;
        this.screenWidth = parent.clientWidth;
        this.screenHeight = parent.clientHeight;
        this.totalWidth = this.screenWidth * oversizedX;
        this.prevScrollX = window.scrollX;
        this.prevScrollY = window.scrollY;
        this.totalHeight = this.screenHeight + this.screenHeight * oversizedY;
        

        const { totalWidth , totalHeight, screenWidth, screenHeight } = this;
        this.screenRect = {
            left : 0,
            top : 0,
            right : screenWidth,
            bottom : screenHeight
        };

        this.loaded = false;
        
 
        let backgroundColorSampler;
        // when randomize is active, disregard default page layout
        if (!randomize && page.backgroundColorSampler)
        {
            // Page has a sampler image proviced for coloring of triangles
            backgroundColorSampler = await getImageColorSamplerAsync(require(`../assets/${page.backgroundColorSampler.src}`));
        }
        else
        {
            // Use random points
            backgroundColorSampler = new RandomColorSampler({ width : totalWidth, height : totalHeight });
        }

        let points = [
            new RandomPoints({
                height : totalHeight,
                width: totalWidth
                }, backgroundColorSampler),
            new BorderPoints({
                width: totalWidth,
                height : totalHeight}, backgroundColorSampler)];

        // when randomize is active, disregard default page layout
        if (!randomize && page.imagePoints)
        {
            // Load all images simultaneously
            const loadSamplers = page.imagePoints.map((options) => getImageColorSamplerAsync(require(`../assets/${options.src}`)));
            const samplers = await Promise.all(loadSamplers);
            page.imagePoints.forEach((options, index) => points.push(new ImagePoints(samplers[index], options, screenWidth, screenHeight )));
        }

        // Generate combination of all points
        const combinedPoints = new CombinedPoints(points);
        this.loaded = true; // allow stuff to happen again

        // Create our triangle set
        this.triangleSet = new AwesomeTriangleSet(combinedPoints.flatArray,
                (set, index) => new AwesomeTriangle(set, index, this.animationFrameTail.getLastNow, combinedPoints.getColor, transitionDurations));

        // We must calculate the offsets before we generate the index elements
        // this will not invoke the onIndexStyles yet
        this.indexElements = null;
        this.calculateOffset();

        // Create the text on the index
        this.indexElements = new IndexElements(
            this.triangleSet, 
            page.index, 
            this.screenRect,
            (triangle, postId) => triangle.mark(postId));

        // Generate the styles for the index of the new page, will be passed on to page again
        this.updateIndexStyles(); 
      
        // Update the rects for the new triangles
        // Note that imm flag is set to true here, since on a update we want NO fade in for the white triangles
        this.animationFrameTail.hijack(() => this.updateRects(true));
        this.transitionIn();
       
        this.props.onHover(null);
    }

    calculateOffset()
    {

        if (!this.loaded)
            return;

        const { totalWidth, totalHeight, screenWidth, screenHeight } = this;
        let docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
        const docWidth = (document.width !== undefined) ? document.width : document.body.offsetWidth;

        if (docHeight <= 0 || docWidth <= 0)
        {
            console.warn('Calculating offsets while document size is unknown!');
            return;
        }

        docHeight += MOBILE_VERTICAL_ENLARGE * 4;

        let x01 = 0;
        let y01 = 0;

        // Default offset
        this.zeroOffX = 0;
        this.zeroOffY = 0;


        y01 = Math.max(0, window.scrollY - screenHeight) / (docHeight);

        this.offX = -x01 * (totalWidth - screenWidth);
        this.offY = -y01 * (totalHeight - screenHeight);
        this.offY = Math.max(-screenHeight, -window.scrollY) - (y01 * (totalHeight - 2 * screenHeight));

        
        this.triangleSet.setOffset(this.offX, this.offY);

        // Push new index styles
        this.updateIndexStyles();
    }

    /**
     * Invokes props.onIndexStyles with the index styles with position offsets applied
     */
    updateIndexStyles()
    {
        if (!this.indexElements)
            return;


        if (this.offY < -this.screenHeight)
        {
            // only update when actually visible. costly operation
            return;
        }

        this.props.onIndexStyles(this.indexElements.map((style, triangle) => {
            const newLeft = style.outer.left + this.offX;
            const newTop = style.outer.top + this.offY;

            return {
                inner : style.inner,

                outer : {
                    ...style.outer,

                    display : triangle.blocked ? 'none' : 'flex',
                    left : newLeft,
                    top : newTop
                    } 
                }
            }));
    }


    draw = () => {

        if (!this.loaded)
            return;

        const { triangleSet, graphic, borderGraphic, screenRect } = this;

        graphic.clear();
        borderGraphic.clear();

        triangleSet.forEach(triangle => { 
            
            if (!triangle.certainlyNotInRect(screenRect))
            {
                triangle.draw(graphic)
            }

        });
        graphic.endFill();


        triangleSet.forEach(triangle => {
            if (!triangle.certainlyNotInRect(screenRect))
            {
                triangle.drawBorder(borderGraphic);
            }
        });

        this.app.render();
    }

    onScroll = (e) => {
        // Don't scroll background when in transition
        if (this.inPageTransition)
            return;
        
        if (this.prevHoveredTriangle)
            this.prevHoveredTriangle.hover = false;

        
        this.calculateOffset();

        // When hijacked there's already a poke from an outer component that is changing the rects,
        // so we don't need to update the rects again
        if (!this.animationFrameTail.isHijacked)
            this.updateRects();


        this.animationFrameTail.poke();
    }

    /**
     * Transition stuff 
     */

    componentWillReceiveProps(nextProps)
    {
        if (nextProps !== this.props)
        {
            // Fade out i.e. a page is about to be loaded
            if (nextProps.fadeOut.to !== this.props.fadeOut.to)
            {
                this.transitionOut();
            }

            // Page changed
            if (nextProps.page && 
                nextProps.page !== this.props.page)
            {
                this.onResize();
                this.generateAndCallTransitionIn(nextProps.page);
            }

            // Easter egg
            if (nextProps.randomize !== this.props.randomize)
            {
                this.transitionOut(() => this.generateAndCallTransitionIn(nextProps.page, true));
            }

            // Triggers pixi rendering for a while
            if (nextProps.poke !== this.props.poke)
            {
                this.animationFrameTail.hijack(() => this.updateRects(), 2000);
            }
        }
    }

    transitionOut(callback)
    {
        this.inPageTransition = true;
        this.triangleSet.setPageTransition(true);
        this.animationFrameTail.poke();
        
        setTimeout(() => {
            if (callback)
                callback();
        }, transitionDurations.pageTransition.on); 
    }

    transitionIn()
    {
        this.inPageTransition = false;
        this.triangleSet.setPageTransition(false);
        this.animationFrameTail.poke();
    }

    updateRects = (imm) => {

        if (!this.loaded)
            return;

        const deltaX = window.scrollX - this.prevScrollX;
        const deltaY = window.scrollY - this.prevScrollY;
       
        this.prevScrollX = window.scrollX;
        this.prevScrollY = window.scrollY;

        this.triangleSet.provideRects(getAllRects('rect-inner', deltaX, deltaY), getAllRects('rect-outer', deltaX, deltaY), this.screenRect, imm);
    }
    

    onMouseMove = (e) =>
    {
        // Case when page isn't generated yet
        if (!this.triangleSet || !this.loaded)
            return;

        const triangle = this.triangleSet.getNonBlockingMarkedTriangleFromPoint(e.data.global.x, e.data.global.y);

        if (this.prevHoveredTriangle)
            this.prevHoveredTriangle.hover = false;

        if (triangle)
        {
            if (triangle !== this.prevHoveredTriangle)
            {
                this.props.onHover(triangle.markedPostId);
            }
            
            triangle.hover = true;
            this.animationFrameTail.poke();
        }
        else
        {
            if (this.prevHoveredTriangle)
            {
                this.props.onHover(null);
            }
        }

        this.prevHoveredTriangle = triangle;
    }


    render() {
        return <div style={this.state.style} id="background" ref={this.updatePixiCnt} />;
    }

}
export default withRouter(Background);