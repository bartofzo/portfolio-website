import React from 'react';
import { throttle } from '../util/throttle.js';

class RectImage extends React.Component
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
        const images = this.props.images || [];

        this.visible = true;

        if (this.state.currentIndex < 0)
        {
            this.loadIndex(0);   
        }

        if (images.length > 0)
            this.intervalHandle = setInterval(this.interval, this.props.interval || 7000);
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

    onImageClick = (index) => {
        this.props.onLargeImage(this.props.images[index]);
    }

    render()
    {
        const { currentIndex } = this.state;
        const images = this.props.images || [];
        const imageContainerHeight = images.length > 1 ? '75%' : '100%';

        return (
            <div className={`rect-images-container`} ref={this.ref}> 
                <div className="rect-image-container" style={{height : imageContainerHeight}}>
                    { images.map((image, index) => 
                       
                        <div 
                            key={index}
                            style={{ backgroundImage : `url(${require(`../assets/${image.src}`)}`}}
                            className={`rect-image magnifier ${(index === currentIndex ? 'show' : 'hide')}`} 
                            onClick={() => {
                                // onClick will only be fired from the topmost element, 
                                // so we always invoke the current index
                                this.onImageClick(this.state.currentIndex )
                            }}
                            />

                    )}
                </div>

                { images.length > 1 ? 
                <div className="rect-images-thumbnails-container">
                { images.map((image, index) => 
                    <div key={index} className="rect-image-thumbnail-container"  onClick={() => this.onImageClick(index)}>
                        <div 
                            key={index}
                            style={{ backgroundImage : `url(${require(`../assets/${image.src}`)}`}}
                            className={`rect-image thumbnail magnifier`} />
                     </div>

                    )}
                </div> : null }
               
            </div>)
    }
}
export default RectImage;
