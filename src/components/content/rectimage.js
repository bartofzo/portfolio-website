import React from 'react';
import { throttle } from '../../util/throttle.js';

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

    renderPlayButton = (index) => {
        return (
          <div className="playButton">
              <button onClick={() => this.onImageClick(index)} className="invisible">
                <svg width="96px" height="96px" viewBox="0 0 96 96" version="1.1">
                    <g id="Website" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="4-copy-5" transform="translate(-672.000000, -402.000000)">
                            <g id="Group-5" transform="translate(672.000000, 402.000000)">
                                <path d="M27.4002083,37.3145933 L60.3324924,28.632965 C61.9346113,28.2106134 63.5757689,29.1670039 63.9981205,30.7691228 C64.1302632,31.2703837 64.1302632,31.7973323 63.9981205,32.2985931 L55.3164922,65.2308772 C54.8941406,66.8329961 53.252983,67.7893866 51.650864,67.367035 C51.1376732,67.2317474 50.6695571,66.9627406 50.2942788,66.5874624 L26.0436231,42.3368067 C24.8720502,41.1652338 24.8720502,39.2657388 26.0436231,38.094166 C26.4189014,37.7188877 26.8870175,37.449881 27.4002083,37.3145933 Z" id="Rectangle" fill="#FFFFFF" transform="translate(44.631085, 48.000000) rotate(-315.000000) translate(-44.631085, -48.000000) "></path>
                            </g>
                        </g>
                    </g>
                </svg>
              </button>
          </div>
        );
    }

    render()
    {
        const { currentIndex } = this.state;
        const images = this.props.images || [];
        const imageContainerHeight = images.length > 1 ? '75%' : '100%';

        return (
            <div className={`rect-images-container`} ref={this.ref}> 
                <div className="rect-image-container" style={{height : imageContainerHeight}}>
                    { images.map((image, index) => {

                        return (<div key={index}>

                            <div 
                                style={{ backgroundImage : `url(${require(`../../assets/${image.smallsrc ? image.smallsrc : image.src}`)}`}}
                                className={`rect-image magnifier ${(index === currentIndex ? 'show' : 'hide')}`} 
                                onClick={() => {
                                    // onClick will only be fired from the topmost element, 
                                    // so we always invoke the current index
                                    this.onImageClick(this.state.currentIndex )
                                }}
                                />

                            { image.youtube && index === currentIndex ? this.renderPlayButton(index) : null }

                        </div>) }
                    )}
                </div>

                { images.length > 1 ? 
                <div className="rect-images-thumbnails-container">
                { images.map((image, index) => 
                    <div key={index} className="rect-image-thumbnail-container"  onClick={() => this.onImageClick(index)}>
                        <div 
                            key={index}
                            style={{ backgroundImage : `url(${require(`../../assets/${image.smallsrc ? image.smallsrc : image.src}`)}`}}
                            className={`rect-image thumbnail magnifier`} />
                     </div>

                    )}
                </div> : null }
               
            </div>)
    }
}
export default RectImage;
