import * as PIXI from 'pixi.js'
import React from 'react';
import { withRouter } from 'react-router-dom';
import ImagePoints from './points/imagepoints.js';
import BorderPoints from './points/borderpoints.js';
import RandomPoints from './points/randompoints.js';
import AwesomeTriangleSet from './awesometriangleset.js';
import { debounce } from '../util/debounce.js';

import ShaderCode from './shader.js';
import AwesomeTriangle from './awesometriangle.js';
import AnimationFrameTail from '../util/animationframetail.js';
import IndexElements from './indexelements.js';
import { getAllRects, getAllPredictedRects } from './boundingrects.js';
import CombinedPoints from './points/combinedpoints.js';

const oversizedX = 1;
const oversizedY = 2;


const transitionDurations = {
    outer : { on : 50, off : 350 },
    inner : { on : 1000, off : 1000 },
    hover : { on : 50, off : 300 },
    pageTransition :  { on : 500, off : 500 },

    max : 600
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
        this.app = new PIXI.Application({ autoResize: true, transparent: true, antialias : true, clearBeforeRender : true })
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
        this.onResize();
    };


    onPageLoaded(pageInfo)
    {
        this.generate(pageInfo);
    }

    componentDidMount() {
        this.onResize = debounce(this.onResize, 100);
        window.addEventListener('resize', this.onResize);
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {

        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
    }

    onResize = () => {
        if (!this.props.pageInfo || !this.props.pageInfo.loaded)
            return;

        this.generate(this.props.pageInfo);
    }

    generate(pageInfo)
    {
        const { pageIndex, backgroundImage } = pageInfo;

        const parent = this.app.view.parentNode;
        this.screenWidth = parent.clientWidth;
        this.screenHeight = parent.clientHeight;
        this.totalWidth = this.screenWidth * oversizedX;
        this.prevScrollX = window.scrollX;
        this.prevScrollY = window.scrollY;
        this.totalHeight = this.screenHeight + this.screenHeight * oversizedY;

        const { totalWidth , totalHeight } = this;
        this.screenRect = {
            left : 0,
            top : 0,
            right : this.screenWidth,
            bottom : this.screenHeight
        };

        this.loaded = false;
        this.app.renderer.resize(this.screenWidth, this.screenHeight);
    
        const generateAfterPoints = (points) => {

            this.loaded = true;
            this.triangleSet = 
            new AwesomeTriangleSet(points.flatArray,
                (set, index) => 
                new AwesomeTriangle(set, index, this.animationFrameTail.getLastNow, points.getColor, transitionDurations));

            // We must calculate the offsets before we generate the index elements
            // this will not invoke the onIndexStyles yet
            this.indexElements = null;
            this.calculateOffset();

            this.indexElements = new IndexElements(
                this.triangleSet, 
                pageIndex, 
                this.screenRect,
                (triangle, postId) => triangle.mark(postId));


            this.updateIndexStyles(); // invoke it manually

            this.animationFrameTail.hijack(() => this.updateRects());
            this.inPageTransition = false;
            this.triangleSet.setPageTransition(false);
            this.props.onHover(null);

        }

        //generateAfterPoints(new BorderPoints(0,0,this.screenWidth, this.screenHeight, 100));
        //generateAfterPoints(new RandomPoints(250,250,this.screenWidth, this.screenHeight, 100));
        new ImagePoints(require(`../assets/${backgroundImage.src}`), null, null,null,
            (imagePoints) => {

                imagePoints.alpha = 0.25;
                generateAfterPoints(new CombinedPoints([ imagePoints ]));

                //const indexPoints = new RandomPoints(0,0,this.screenWidth, this.screenHeight, 50);
                /*
                const indexPoints = new ImagePoints(require('../assets/gradient.jpg'), null, this.screenWidth, this.screenHeight,
                (indexPoints2) => {

                    const randomPoints = new RandomPoints();
                    const borderPoints = new BorderPoints();
                    generateAfterPoints(new CombinedPoints([ indexPoints2, imagePoints]));

                });
                */




            });
   

        // require(`../../assets/${backgroundImage.src}`

        // if a bg image is specified, generate from that
        /*
        if (backgroundImage)
        {

        }
        else
        {
            new NotQuiteRandomPoints(
                totalWidth, 
                totalHeight, 
                this.screenHeight,
                pointsInIndexCount, 
                pointsInRestCount, 
                generateAfterPoints)
        }
        */
    }


    componentWillReceiveProps(nextProps)
    {
        if (nextProps !== this.props)
        {
            // Only trigger page loaded on actual change
            if (nextProps.pageInfo && 
                nextProps.pageInfo.loaded && 
                nextProps.pageInfo !== this.props.pageInfo)
            {

                this.onPageLoaded(nextProps.pageInfo)
            }

            if (nextProps.poke !== this.props.poke)
            {
                this.animationFrameTail.hijack(() => this.updateRects(), 2000);
            }
        }
    }

    calculateOffset()
    {

        if (!this.loaded)
            return;

        const { totalWidth, totalHeight, screenWidth, screenHeight } = this;
        const docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
        const docWidth = (document.width !== undefined) ? document.width : document.body.offsetWidth;

        if (docHeight <= 0 || docWidth <= 0)
        {
            console.error('Calculating offsets while document size is unknown!');
            return;
        }

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

        const { triangleSet, graphic, borderGraphic, app, screenRect } = this;

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

        //this.drawStage.render(this.app.renderer);
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

    onPageSwitch = (first) => {

        this.inPageTransition = true;
        this.triangleSet.setPageTransition(true);
        this.animationFrameTail.poke();


        setTimeout(() =>  {

            this.pageTransition = false;
            this.onResize();

        },  transitionDurations.pageTransition);
    }

    updateRects = (imm) => {

        if (!this.loaded)
            return;

        const deltaX = window.scrollX - this.prevScrollX;
        const deltaY = window.scrollY - this.prevScrollY;
       
        this.prevScrollX = window.scrollX;
        this.prevScrollY = window.scrollY;

        this.triangleSet.provideRects(getAllRects('rect-inner', deltaX, deltaY), getAllRects('rect-outer', deltaX, deltaY), this.screenRect, imm);
        //this.triangleSet.provideRects(getAllPredictedRects('rect-inner', deltaX, deltaY), getAllPredictedRects('rect-outer', deltaX, deltaY), this.screenRect, imm);
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