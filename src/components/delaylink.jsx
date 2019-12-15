import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

/**
 * Wraps the React Router Link component and creates a delay after the link is clicked.
 */
export default withRouter(class DelayLink extends React.Component {
  static propTypes = {
    /**
     * Milliseconds to wait before registering the click.
     */
    delay:        PropTypes.number,
    /**
     * Called after the link is clicked and before the delay timer starts.
     */
    onDelayStart: PropTypes.func,
    /**
     * Called after the delay timer ends.
     */
    onDelayEnd:   PropTypes.func
  };

  static defaultProps = {
    delay:        0,
    onDelayStart: () => {},
    onDelayEnd:   () => {}
  };

  static contextTypes = Link.contextTypes;

  constructor(props) {
    super(props);
    this.timeout = null;
    this.pathnameBeforeTimeout = null;
  }

  componentWillUnmount = () => {
    /*

      Note: if we clear the timeout here we run into problems with the pageIndex navigation

      because the pageindex is cleared on a fadeout, the component that contains the delaylink gets unmounted
      which will clear the timeout

      to circumvent this, we check if the current location is still the same
      when we unmount. if it is, we assume we still want to navigate and don't clear the timeout

    */
   const { history } = this.props;
   if (this.timeout &&
       this.pathnameBeforeTimeout !== history.location.pathname)
   {
      //console.log('t2: ' + this.pathnameBeforeTimeout);
      clearTimeout(this.timeout);
   }
   //else
   //{
   //  console.log(this);
   //}

    //if (this.timeout) {
    //  clearTimeout(this.timeout);
    //}
  }

  /**
   * Called when the link is clicked
   *
   * @param {Event} e
   */
  handleClick = (e) => {
    const { replace, to, delay, onDelayStart, onDelayEnd } = this.props;
    const { history } = this.props;

    // prevent navigating to the same path
    /*
    if (to === history.location.pathname)
    {
      e.preventDefault();
      return;
    }
    */
   
    onDelayStart(e, to);
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
   
    this.pathnameBeforeTimeout = history.location.pathname;
    
    //console.log('set pathnamebef: ' + this.pathnameBeforeTimeout);
    //console.log(this);

    this.timeout = setTimeout(() => {
      if (replace) {
        history.replace(to);
      } else {
        history.push(to);
      }
      onDelayEnd(e, to);
    }, delay);
  };

  render() {
    const props = Object.assign({}, this.props);
    delete props.delay;
    delete props.onDelayStart;
    delete props.onDelayEnd;
    delete props.staticContext;

    return (
      <Link {...props} onClick={this.handleClick} />
    );
  }
})