import React from 'react';
import { debounce } from '../../util/debounce.js';
import DelayLink from '../delaylink.jsx';

const linkDelayMs = 300; // change in background and nav too


class Footer extends React.Component
{
    constructor(props)
    {
        super(props);
        this.prevScrollY = window.scrollY;
        this.state = 
            { 
                visible : true,
                sliderValue : props.multiplier
            };

        this.sendChangeMessage = debounce(this.sendChangeMessage, 250);
    }

    componentDidMount()
    {
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount()
    {
        window.removeEventListener('scroll', this.onScroll);
    }

    onScroll = () => {

        if (window.scrollY > this.prevScrollY && 
            window.scrollY > window.innerHeight)
        {
            // scrolled down
            if (this.state.visible)
            {
                this.setState({ visible : false });
            }
        }
        else
        {
            // scrolled up
            if (!this.state.visible)
            {
                this.setState({ visible : true });
            }
        }

        this.prevScrollY = window.scrollY;
    }
    
    onSliderChange = (e) => {
        e.preventDefault();

        this.setState({ sliderValue : e.target.value });
        this.sendChangeMessage(parseFloat(e.target.value));
    }

    sendChangeMessage = (value) =>
    {
        this.props.onMultiplier(value);
    }

    render ()
    {
        const { props } = this;
        const { sliderValue } = this.state;
        const year = new Date().getFullYear();
        const className = this.state.visible ? 'footer-onscreen' : 'footer-offscreen';

        return <div id="footer" className="box-small">
            <div className="footer-slider-container">
                <input type="range" min="0.1" max="25" value={sliderValue} onChange={this.onSliderChange} className="slider" />
            </div>
            <div>
                <div>© {year} - Bart van de Sande /&nbsp;</div>
                <div>
                    <button onClick={()=>props.onRandomize(performance.now())}>Randomize</button>
                    {/*
                    &nbsp;/&nbsp;<DelayLink 
                                to='/contact' 
                                delay={linkDelayMs} 
                    onDelayStart={()=>props.onFadeOut( {to : '/contact' }) } >Contact</ DelayLink>
                    */}
                </div>  
            </div>
        </div>
    }
}

export default Footer;