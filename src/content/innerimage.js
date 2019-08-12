import React from 'react';
import { throttle } from '../util/throttle.js';

class InnerImage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = { currentIndex : -1 };
        this.onScroll = throttle(this.onScroll, 250);
        this.ref = React.createRef();
    }

    componentDidMount()
    {
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount()
    {
        // only need to unsub from event when no load had taken place
        window.removeEventListener('scroll', this.onScroll);
        if (this.intervalHandle)
        {
            clearInterval(this.intervalHandle);
        }
    }

    onScroll = () => {

        const { ref } = this;
        
        if (!ref.current)
            return;

        const rect = ref.current.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0)
        {
            if (!this.visible)
                this.onVisible();
        }
        else
        {
            if (this.visible)
                this.onInvisible();
        }
    }

    loadIndex = (index) => {
        if (this.state.currentIndex !== index)
        {
            this.setState({ currentIndex : index });
        }
    }

    onVisible = () => {
        this.visible = true;

        if (this.state.currentIndex < 0)
        {
            this.loadIndex(0);   
        }

        if (this.props.images.length > 0)
            this.intervalHandle = setInterval(this.interval, this.props.interval || 5000);
    }

    onInvisible = () => {
        this.visible = false;
        if (this.intervalHandle)
        {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    interval = () => {
        
        this.setState({ currentIndex : (this.state.currentIndex + 1) % this.props.images.length });
    }

    render()
    {
        const { currentIndex } = this.state;
        const { images } = this.props;
     

        return <div ref={this.ref} className="image-outer rect-inner">
                { images.map((image, index) => 
                    
                    <div 
                        key={index}
                        style={{ backgroundImage : `url(${require(`../assets/${image.src}`)}`}}
                        className={`image-inner ${(index === currentIndex ? 'image-inner-show' : 'image-inner-hide')}`} />

                )}
            </div>
    }
}
export default InnerImage;