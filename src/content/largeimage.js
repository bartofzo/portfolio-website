import React from 'react';
import { throttle } from '../util/throttle.js';

class LargeImage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = { image : null };
        this.onScroll = throttle(this.onScroll, 250);
        this.ref = React.createRef();
    }

    componentDidMount()
    {
       
    }

    componentWillUnmount()
    {

    }

    componentWillReceiveProps(nextProps)
    {

        if (this.props !== nextProps && nextProps.image)
        {

            this.setState({ image : nextProps.image });
           
        }
    }

    render()
    {
        const { image } = this.props;
        const largeClass = image ? 'show' : '';
        const triangleClass = image ? 'rect-outer' : '';

        return (
            <div className={`large-image-container ${largeClass}`} onClick={this.props.onClose}>
                    { image ? 
                        <img 
                            src={require(`../assets/${image.src}`)}
                            className={`large-image rect-outer`} /> : null }
            </div>)
    }
}
export default LargeImage;

/*
                    { image ? 
                    <div className={`large-image-container-padding ${triangleClass}`}>
                        <img 
                            
                            src={require(`../assets/${image.src}`)}
                            className={`large-image`} /> : null 
                    </div> : null}
                    */