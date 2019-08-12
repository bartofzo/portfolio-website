import * as PIXI from 'pixi.js'
import React from 'react';
import { withRouter } from 'react-router-dom';
import NotQuiteRandomPoints from './notquiterandompoints.js';

import AwesomeTriangleSet from './awesometriangleset.js';
import ColoredTriangle from './coloredtriangle.js';

import ShaderCode from './shader.js';
import AwesomeTriangle from './awesometriangle.js';
import AnimationFrameTail from '../util/animationframetail.js';
import IndexElements from './indexelements.js';
import { getAllRects } from './boundingrects.js';

const pointsInIndexCount = 50;
const pointsInRestCount = 500;

const oversizedX = 1;
const oversizedY = 2;


const transitionDurations = {
    outer : 50,
    inner : 1,
    hover : 300,
    pageTransition : 500,
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
       
        

       
        //this.drawStage = new PIXI.Container();
        this.app.stage.addChild(this.graphic);
        this.app.stage.addChild(this.borderGraphic);
        //this.app.stage.filters = [new PIXI.filters.NoiseFilter(0.1)];

        //const simpleShader = new PIXI.Filter(null, ShaderCode);
        //this.app.stage.filters = [simpleShader];

    }

    updateNoise()
    {
        //this.app.stage.filters[0].seed = Math.random();
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

    onResize = () => {

        if (!this.props.pageInfo || !this.props.pageInfo.loaded)
            return;

       
        this.generate(this.props.pageInfo.pageIndex);
    }

    generate(pageIndex)
    {
       
        const parent = this.app.view.parentNode;

        this.screenWidth = parent.clientWidth;
        this.screenHeight = parent.clientHeight;
        this.totalWidth = this.screenWidth * oversizedX;

        // 
        this.totalHeight = this.screenHeight + this.screenHeight * oversizedY;

        const { totalWidth , totalHeight } = this;

        this.screenRect = {
            left : 0,
            top : 0,
            right : this.screenWidth,
            bottom : this.screenHeight
        };

        this.app.renderer.resize(this.screenWidth, this.screenHeight);
    
        this.triangleSet = 
            new AwesomeTriangleSet(new NotQuiteRandomPoints(
                totalWidth, 
                totalHeight, 
                this.screenHeight,
                pointsInIndexCount, pointsInRestCount).flatArray,
            (set, index) => new AwesomeTriangle(set, index, this.animationFrameTail.getLastNow, this.screenHeight, transitionDurations));

        // We must calculate the offsets before we generate the index elements
        // this will not invoke the onIndexStyles yet
        this.indexElements = null;
        this.calculateOffset();

        this.indexElements = new IndexElements(
            this.triangleSet, 
            pageIndex, 
            this.screenRect, 
            this.zeroOffX, this.zeroOffY, 
            (triangle, postId) => triangle.mark(postId));


        this.updateIndexStyles(); // invoke it manually

        this.animationFrameTail.hijack(() => this.updateRects(true));
        this.inPageTransition = false;
        this.triangleSet.setPageTransition(false);
        this.props.onHover(null);

    }

    onPageLoaded(pageInfo)
    {
        const { pageIndex } = pageInfo;
        this.generate(pageIndex);
    }

    componentDidMount() {

        window.addEventListener('resize', this.onResize);
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {

        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
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
        }
    }

    calculateOffset()
    {

        const { totalWidth, totalHeight, screenWidth, screenHeight } = this;
        const docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
        const docWidth = (document.width !== undefined) ? document.width : document.body.offsetWidth;

        if (docHeight <= 0 || docWidth <= 0)
        {
            console.error('Calculating offsets while document size is unknown!');
            return;
        }

        let x01 = 0.4;
        let y01 = 0.1;

        // Default offset
        this.zeroOffX = -x01 * (totalWidth - screenWidth);
        this.zeroOffY = -y01 * (totalHeight - screenHeight);


        y01 +=  0.95 * (window.scrollY / docHeight); 
        
        y01 = Math.min(1, y01);
        
        this.offX = -x01 * (totalWidth - screenWidth);
        this.offY = -y01 * (totalHeight - screenHeight);

        
        this.triangleSet.setOffset(this.offX, this.offY);

        // Push new index styles
        this.updateIndexStyles();
        this.updateNoise();
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

        this.triangleSet.provideRects(getAllRects('rect-inner'), getAllRects('rect-outer'), this.screenRect, imm);
    }
    

    onMouseMove = (e) =>
    {
        // Case when page isn't generated yet
        if (!this.triangleSet)
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