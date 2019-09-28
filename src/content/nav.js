import React from 'react';
import DelayLink from '../components/delaylink.jsx';

const linkDelayMs = 300; // make sure this matches background fadeout ms and footer fadeoutms

class Nav extends React.Component
{
    constructor(props)
    {
        super(props);
        this.prevScrollY = window.scrollY;
        this.state = { visible : true };
    }

    componentDidMount()
    {
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount()
    {
        window.removeEventListener('scroll', this.onScroll);
    }

    onScroll = () => {

        if (window.scrollY > this.prevScrollY && 
            window.scrollY > window.innerHeight)
        {
            // scrolled down
            if (this.state.visible)
            {
                this.setState({ visible : false });
            }
        }
        else
        {
            // scrolled up
            if (!this.state.visible)
            {
                this.setState({ visible : true });
            }
        }

        this.prevScrollY = window.scrollY;
    }

    render ()
    {
        const { routes } = this.props;
        const className = this.state.visible ? 'nav-onscreen' : 'nav-offscreen';

        return <div id="nav" className={`box-small z-top ${className}`}>
            {routes.map((route, index) => {
                return(
                    <React.Fragment key={index}>
                    {index !== 0 ? ' / ' : '' }
                    <DelayLink 
                        to={route.path} 
                        delay={linkDelayMs} 
                        onDelayStart={()=>this.props.onFadeOut( {to : route.path }) } >
                            
                         {route.title}
                    </DelayLink>
                   
                    </React.Fragment>)

            })}
        </div>
    }
}

export default Nav;
