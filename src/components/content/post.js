import React, { useState, useEffect, useRef, createRef } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import getPost from '../../fetch/postdata.js';
import RectImage from './rectimage.js';
import DelayLink from '../delaylink.jsx';

const linkDelayMs = 300; // make sure this matches background fadeout ms and footer fadeoutms, post

const Post = (props) =>
{
    const { postId } = props;
    const [post, setPost] = useState({});
    
    const paragraphs = post.paragraphs || [];
    const [isLoaded, setIsLoaded] = useState(false);
 
	useEffect(() => {
		async function fetchPost() {
            const page = await getPost(postId);
            setPost(page);
            setIsLoaded(true);
		}
		fetchPost();
    }, [postId]); // second [] argument only executes this effect after mounting and not on updates
    
   
    if (!isLoaded)
    {
        return <div>Loading...</div>
    }


    const alignClass = props.index % 2 == 0 ? 'left' : 'right';
    const smallImagesClass = post.smallImages ? 'small' : '';
    const triangleClass = props.hide ? '' : 'rect-outer';

    return (

    <div id={postId} className={`post-container ${alignClass}`}  ref={props.setRef}>

            <PostTitle title={post.title} mobile={true} alignClass={alignClass} aboveImage={post.images && post.images.length > 0} />
         

            { post.images ? 
            <div className={`post-images-container ${alignClass} ${smallImagesClass} ${triangleClass}`}>
                { /* <PostLinks links={post.links} mobile={false} /> */ }
                <RectImage images={post.images} onLargeImage={props.onLargeImage} small={props.smallImages} />
            </div> : null }

    

            <div className={`post-content-container ${alignClass} ${triangleClass}`} >

                <PostTitle title={post.title} mobile={false} triangleClass={triangleClass} />
 
                <div className={`post-content`}>

                    {paragraphs.map((paragraph, index) => <React.Fragment key={index}>
                        <ParagraphTitle paragraph={paragraph} />
                        { paragraph.html ? <p dangerouslySetInnerHTML={{ __html: paragraph.html }} /> :
                        <p>
                        {paragraph.text}
                        </p> }
                    </React.Fragment>)}

                    {post.keywords? 
                    <p className="keywords">
                        {post.keywords}
                    </p> : null }
                </div>

                <PostLinks links={post.links} onFadeOut={props.onFadeOut} />

            </div>

           

    </div>)
}

export default Post;

const ParagraphTitle = (props) => {
    const { paragraph } = props;
    if (!paragraph.title) return null;
   
    if (paragraph.url)
    {
        return paragraph.small ? 
            <h3><a href={paragraph.url} className="link-black" target="_blank" rel="noreferrer noopener">{paragraph.title}</a></h3> : 
            <h2><a href={paragraph.url} className="link-black" target="_blank" rel="noreferrer noopener">{paragraph.title}</a></h2>;
    }
    else
    {
        return paragraph.small ? <h3>{paragraph.title}</h3> : <h2>{paragraph.title}</h2>;
    }
}

const PostTitle = (props) => {
    const { title, alignClass, aboveImage, mobile, triangleClass } = props;
    const mobileClass = mobile ? 'mobile' : '';
    const aboveImageClass = aboveImage ? 'aboveimage' : '';

    return <div className={`rect-outer post-title-container ${mobileClass} ${alignClass} ${aboveImageClass}`}>
        { title ? <h1>{title}</h1> : null }
    </div>
}

const PostLinks = (props) => {
    if (!props.links)
        return null;

    const links = props.links;

    return (
            <div className={`box-small post-links`}>
            {links.map((link, index) => 
                    <React.Fragment key={index}>
                    {index !== 0 ? ' / ' : '' }
                    
                    {link.to ?
                    <DelayLink 
                        to={link.to} 
                        delay={linkDelayMs} 
                        onDelayStart={()=>props.onFadeOut( {to : link.to }) } >
                        {link.title}
                    </DelayLink>
                    :
                    <a href={link.url} target="_blank">{link.title}</a>}

                    </React.Fragment>)}
            </div>)
}

const SeeMore = (props) => {
    return (
        <React.Fragment>
            <div className={`box-small seemore`}>
                <Link to={props.page}>See more...</Link>
            </div>
        </React.Fragment>)
}

