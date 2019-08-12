import React, { useState, useEffect, useRef, createRef } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import getPost from '../data/postdata.js';
import InnerImage from './innerimage.js';

const Post = (props) =>
{
    const { postId, index } = props;
    const [post, setPost] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const images = post.images || [];
    const sections = post.sections || [];

    //const alignStyle = index % 2 == 0 ? 'post-align-start-right' : 'post-align-start-left';
    const alignStyle = 'post-align-start-left';


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

    const alignClass = props.index % 2 === 0 ? 'post-align-right' : 'post-align-left';


    return (
    <div className={`post-outer`} ref={props.setRef}>

         <PostTitle title={post.title} mobile={true} alignClass={alignClass} />

        <div className={`post-columns ${alignClass}`}>

            <PostSide title={post.title} images={post.images} />
            
            <div className={`post-inner ${alignClass}`} >

                <div className="post-top">
                    <PostTitle title={post.title} mobile={false} />
                    <PostLinks links={post.links} />
                </div>

                <div className="post-content rect-outer">
                    {post.paragraphs.map((paragraph, index) => <React.Fragment key={index}>
                        {paragraph.title ? <h2>{paragraph.title}</h2> : null}
                        <p>
                        {paragraph.text}
                        </p>
                    </React.Fragment>)}
                </div>
            </div>
        </div>
    </div>)
}

export default Post;

const PostTitle = (props) => {
    const { title } = props;
    const className = props.mobile ? 'post-title-mobile' : 'post-title';

    return <div className={`${className} ${props.alignClass} rect-outer`}>
        { title ? <h1>{title}</h1> : null }
    </div>
}

const PostLinks = (props) => {
    const links = props.links || [];

    return (
        <div className={`box-small links`}>
        {links.map((link, index) => 
                <React.Fragment key={index}>
                {index !== 0 ? ' / ' : '' }
                <a   href={link.url} target="_blank">
                     {link.title}
                </a>
                </React.Fragment>)}
    </div>)
}

const PostSide = (props) => {
    return (
        <div className="post-side">
           
                <InnerImage images={props.images} />
           
        </div>)
}