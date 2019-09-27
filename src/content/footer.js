import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const Footer = (props) => {
    const year = new Date().getFullYear();

    return <div id="footer" className="box-small">
        © {year} - Bart van de Sande / <button onClick={()=>props.onRandomize(performance.now())}>Randomize</button> / <Link to="contact">Contact</Link>
    </div>
}

export default Footer;