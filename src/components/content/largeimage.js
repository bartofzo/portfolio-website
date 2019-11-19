import React from 'react';
import { throttle } from '../../util/throttle.js';
import YouTube from 'react-youtube';

class LargeImage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = { image : null };
        this.onScroll = throttle(this.onScroll, 250);
        this.ref = React.createRef();
    }

    componentWillReceiveProps(nextProps)
    {

        if (this.props !== nextProps && nextProps.image)
        {

            this.setState({ image : nextProps.image });
           
        }
    }


    renderImage(image)
    {
        return (<img 
            src={require(`../../assets/${image.src}`)}
            className={`large-image rect-outer`} />)
    }


  renderYoutube = (id) => {
    const opts = {

        playerVars: { // https://developers.google.com/youtube/player_parameters
          //autoplay: !this.props.onlyVideo,
          autoplay : 1,
          showinfo: 0,
          controls: 0,
          loop: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          //mute: this.props.onlyVideo ? 0 : 1
        }
      };
   
      return (
        <YouTube
            containerClassName="large-image rect-outer"
            videoId={id}
            opts={opts}
        />
      );
    }


    render()
    {
        const { image } = this.props;
        const youtubeId = image ? image.youtube : null;
        const largeClass = image ? 'show' : '';
        const triangleClass = image ? 'rect-outer' : '';

        return (
            <div className={`large-image-container ${largeClass}`} onClick={this.props.onClose}>
                    { youtubeId ? this.renderYoutube(youtubeId) : image ? this.renderImage(image) : null }
            </div>)
    }
}
export default LargeImage;