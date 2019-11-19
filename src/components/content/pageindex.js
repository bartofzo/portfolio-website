import React, { useState, useEffect } from 'react';

function PageIndex(props)
{
    const { page, indexStyles } = props;
    const indexClass = page.smallIndex ? "halfscreen" : "fullscreen";

    return (
        <div className={indexClass}>
            { page.index.map((item, itemIndex) => 
                <PageIndexElement key={itemIndex} 
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
        props.onClick(item.postId);
    }

    if (!style || !item)
        return null;

    return (
        <div className="page-index-element" style={outer} ><a href="#" onClick={onClick} style={inner}>{item.title}</a></div>
    )
}

export default PageIndex;