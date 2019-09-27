import React, { useState, useEffect } from 'react';

function PageIndex(props)
{
    const { pageIndexElements, indexStyles } = props;

    return (
        <div className="fullscreen">
            { indexStyles.map((item, index) => <PageIndexElement key={index} onClick={props.onClick} index={index} item={pageIndexElements[index]} style={indexStyles[index]} />)}
        </div>
    )

}

function PageIndexElement(props)
{
    const { item, style } = props;
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