import React, { useState, useEffect, useRef, createRef } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import getPost from '../data/postdata.js';
import RectImage from './rectimage.js';

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

    return (

    <div className="post-container" ref={props.setRef}>

            <PostTitle title={post.title} mobile={true} alignClass={alignClass} aboveImage={post.images && post.images.length > 0} />
         

            { post.images ? 
            <div className={`post-images-container ${alignClass} rect-outer`}>
                <PostLinks links={post.links} mobile={false} />
                <RectImage images={post.images} onLargeImage={props.onLargeImage} />
            </div> : null }

    

            <div className={`post-content-container ${alignClass} rect-outer`} >

                <PostTitle title={post.title} mobile={false} />

                <div className="post-content">

                    <PostLinks links={post.links} mobile={true} />

                    {paragraphs.map((paragraph, index) => <React.Fragment key={index}>
                        {paragraph.title ? <h2>{paragraph.title}</h2> : null}
                        <p>
                        {paragraph.text}
                        </p>
                    </React.Fragment>)}
                </div>

            </div>

          

    </div>)
}

export default Post;

const PostTitle = (props) => {
    const { title, alignClass, aboveImage, mobile } = props;
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
    const mobileClass = props.mobile ? 'mobile' : '';

    return (
        <div className={`box-small post-links ${mobileClass}`}>
        {links.map((link, index) => 
                <React.Fragment key={index}>
                {index !== 0 ? ' / ' : '' }
                <a   href={link.url} target="_blank">
                     {link.title}
                </a>
                </React.Fragment>)}
    </div>)
}

