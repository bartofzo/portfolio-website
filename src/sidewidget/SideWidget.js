import * as PIXI from 'pixi.js'
import PianoRoll from "./components/pianoroll"
import React from 'react';

class SideWidget extends React.Component {

    constructor(props) {
      super(props);
      this.pixi_cnt = null;
      this.app = new PIXI.Application({autoResize : true, transparent:false})
    }

    componentDidMount = () => {
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
     
        const parent = this.app.view.parentNode;
        // Resize the renderer
        this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
    }

    updatePixiCnt= (element) => {
        // the element is the DOM object that we will use as container to add pixi stage(canvas)
        this.pixi_cnt = element;    //now we are adding the application to the DOM element which we got from the Ref.

        if(this.pixi_cnt && this.pixi_cnt.children.length <= 0) 
        {
           this.pixi_cnt.appendChild(this.app.view); //The setup function is a custom function that we created to add the sprites. We will this below
           this.setup();
        }
    };

    setup = () => {
        this.onResize();
        this.pianoRoll = new PianoRoll(this.app.stage, this.app.renderer);
        PIXI.Ticker.shared.add(this.draw);
     };
     
    
     initialize = () => {

         //We will create a sprite and then add it to stage and (0,0) position
         this.avatar = new PIXI.Sprite(this.app.loader.resources["avatar"].texture);
         this.app.stage.addChild(this.avatar);
     
     };

     draw = () => {
        //let mouseY = this.app.renderer.plugins.interaction.mouse.global.y;

        this.pianoRoll.update(this.props.attach);
        this.pianoRoll.draw();
        this.pianoRoll.drawConnections();
     }


    render() {
        return <div id="sidewidget" ref={this.updatePixiCnt} />;
    }

}
export default SideWidget;