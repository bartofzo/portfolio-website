import React, { Component } from "react";
import YouTube from 'react-youtube';

class VideoItem extends Component {
  constructor(props) {
      super(props);

      this.state = {
        display : props.onlyVideo || false,
        playing : false,
        pause : false
      };


  }

  onVideoPlay = () => {
    this.setState({playing: true, pause : false});
    if (this.props.onPlay)
    {
        this.props.onPlay();
    }
  }

  onVideoEnd = () => {
    this.setState({display: false, playing: false, pause : false});
    if (this.props.onEnd)
    {
      this.props.onEnd();
    }
  }

  onVideoPause = () => {
    this.setState({pause: true});
    if (this.props.onEnd)
    {
      this.props.onEnd();
    }
  }

  renderYoutube = (videoId) => {


    const opts = {

        width: '100%',
        height: '100%',

        playerVars: { // https://developers.google.com/youtube/player_parameters
          //autoplay: !this.props.onlyVideo,
          autoplay : 0,
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
            containerClassName={this.props.fixed ? "video2" :  "video"}
            videoId={videoId}
            opts={opts}
            onPlay={this.onVideoPlay}
            onEnd={this.onVideoEnd}    
            onPause={this.onVideoPause}
            onReady={this.onReady}
        />
      );
}

  /*
  renderImage = (fluid) => {
      return (
        <Img
        style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%"
        }}
        className={this.state.display ? 'imageWhilePlaying' : null}
        fluid={fluid}
    />);
  }
  */

  onPlayButtonClick = () => {
    this.setState ( { display : true });
  }

  // Autoplay hack so that it works on mobile
  onReady = (event) => {
    // dont when only video is contained
    if (!this.props.onlyVideo)
    {
      event.target.playVideo();
    }
  }

  renderPlayButton = () => {
      return (
        <div className="playButton">
            <button onClick={this.onPlayButtonClick} className="invisible">
              <svg width="96px" height="96px" viewBox="0 0 96 96" version="1.1">
                  <g id="Website" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <g id="4-copy-5" transform="translate(-672.000000, -402.000000)">
                          <g id="Group-5" transform="translate(672.000000, 402.000000)">
                              <circle id="Oval" fill="red" cx="48" cy="48" r="48"></circle>
                              <path d="M27.4002083,37.3145933 L60.3324924,28.632965 C61.9346113,28.2106134 63.5757689,29.1670039 63.9981205,30.7691228 C64.1302632,31.2703837 64.1302632,31.7973323 63.9981205,32.2985931 L55.3164922,65.2308772 C54.8941406,66.8329961 53.252983,67.7893866 51.650864,67.367035 C51.1376732,67.2317474 50.6695571,66.9627406 50.2942788,66.5874624 L26.0436231,42.3368067 C24.8720502,41.1652338 24.8720502,39.2657388 26.0436231,38.094166 C26.4189014,37.7188877 26.8870175,37.449881 27.4002083,37.3145933 Z" id="Rectangle" fill="#FFFFFF" transform="translate(44.631085, 48.000000) rotate(-315.000000) translate(-44.631085, -48.000000) "></path>
                          </g>
                      </g>
                  </g>
              </svg>
            </button>
        </div>
      );
  }

  render() {

    const { fluid, videoId, onlyVideo } = this.props;
    const style = this.props.style || {};
    const { crop } = this.props;
    
    style.backgroundPosition = crop ? `${crop.focal_left}% ${crop.focal_top}%` : '50% 50%';

    if (!videoId)
    {
      return (
        <div className={this.props.fixed ? "videoItem2" : "videoItem"} style={style}>
            { this.renderImage(fluid) }
        </div>
      );
    }

    const { display } = this.state;
   

    return (
        <div className={this.props.fixed ? "videoItem2" : "videoItem"} style={style}>
            { onlyVideo || display || !videoId ? this.renderYoutube(videoId) : null}
            { !onlyVideo ? this.renderImage(fluid) : null }
            { !onlyVideo && !display && videoId ? this.renderPlayButton() : null }
        </div>
        )
  }

}

export default VideoItem;
