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
            console.log('onlargeimage!')
            this.setState({ image : nextProps.image });
        }
    }

    render()
    {
        const { image } = this.props;
        const largeClass = image ? 'show' : '';

        return (
            <div className={`large-image-container ${largeClass} rect-inner`}>
                    { image ? 
                    <div 
                        onClick={this.props.onClose}
                        style={{ backgroundImage : `url(${require(`../assets/${image.src}`)}`}}
                        className={`image-inner`} /> : null }
            </div>)
    }
}
export default LargeImage;
