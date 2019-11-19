import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import DelayLink from '../delaylink.jsx';

const linkDelayMs = 300; // change in background and nav too

const Footer = (props) => {
    const year = new Date().getFullYear();

    return <div id="footer" className="box-small">
        <div>© {year} - Bart van de Sande /&nbsp;</div>
        <div>
            <button onClick={()=>props.onRandomize(performance.now())}>Randomize</button>

            &nbsp;/&nbsp;<DelayLink 
                        to='/contact' 
                        delay={linkDelayMs} 
            onDelayStart={()=>props.onFadeOut( {to : '/contact' }) } >Contact</ DelayLink>
        </div>
    </div>
}

export default Footer;