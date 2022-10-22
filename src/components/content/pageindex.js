import React, { useState, useEffect } from 'react';
import DelayLink from '../delaylink.jsx';

const linkDelayMs = 300; // make sure this matches background fadeout ms and footer fadeoutms, post and pageindex

function PageIndex(props)
{
    const { page, indexStyles } = props;
    const indexClass = page.smallIndex ? "halfscreen" : "fullscreen";

    return (
        <div className={indexClass}>
            { page.index.map((item, itemIndex) => 
                <PageIndexElement 
                    key={itemIndex} 
                    onFadeOut={props.onFadeOut}
                    onClick={props.onClick} 
                    index={itemIndex} 
                    item={item} 
                    style={indexStyles[itemIndex]} />)}
        </div>
    )

}

function PageIndexElement(props)
{
    const { item, style } = props;
    if (!style)
        return null; // style not available (yet)
    
    const { outer, inner } = style;
    
    const onClick = (e) => {
        e.preventDefault();
        props.onClick(item);
    }

    if (!style || !item)
        return null;


    if (item.postId)
    {
        return (
            <div className="page-index-element" style={outer}><button onClick={onClick} style={inner}>{item.title}</button></div>
        )
    }
    else if (item.to)
    {
        return (
            <div className="page-index-element" style={outer}>
                <DelayLink 

                    style={inner}
                    to={item.to} 
                    delay={linkDelayMs} 
                    onDelayStart={()=>props.onFadeOut( {to : item.to, anchor : item.anchor }) } >
                        
                    {item.title}
                </DelayLink>
            </div>)
    }
    else
    {
        return  <div className="page-index-element" style={outer}>{item.title}</div>
    }

    /*
    switch (item.linkType)
    {
        case 'page':
            return (
                <div className="page-index-element" style={outer}>
                    <DelayLink 
    
                        style={inner}
                        to={item.to} 
                        delay={linkDelayMs} 
                        onDelayStart={()=>props.onFadeOut( {to : item.to }) } >
                            
                        {item.title}
                    </DelayLink>
                </div>)
        
        default:
            return (
                <div className="page-index-element" style={outer}><button onClick={onClick} style={inner}>{item.title}</button></div>
            )
    }
    */
}

export default PageIndex;