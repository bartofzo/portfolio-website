import React, { useState, useEffect, useRef } from 'react';
import Posts from './posts.js';
import PageIndex from './pageindex.js';
import getPage from '../../fetch/pagedata.js';
import SmoothScrollWindow from '../../util/smoothscrollwindow.js';
import LargeImage from './largeimage.js';
import { Helmet } from 'react-helmet';
import Footer from './footer.js';
import { withRouter } from "react-router-dom";


function Page(props)
{
    const { pageId } = props;
    const [page, setPage] = useState({});
    const [largeImage, setLargeImage] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const postRefs = useRef({});
    const pageRef = useRef(null);

    const setPostRef = (element, postId) => {
        postRefs.current[postId] = element;
    }

    const onIndexClick = (pageIndexElement) => {
        // this will only fire when a page index element with a postId is clicked
        // but do check if the post actually exists
        if (pageIndexElement.postId !== undefined && postRefs.current[pageIndexElement.postId])
        {
            SmoothScrollWindow.scrollTo(postRefs.current[pageIndexElement.postId], 500);
        }
        else
        {
            console.error(`pageIndexElement click postId does not exist ${pageIndexElement.postId}`);
        }
    }
    
    const onThumbnailClick = (image) => {

        props.onPoke(performance.now());
        setLargeImage(image);
    }

    const onThumnailClose = () => {

        props.onPoke(performance.now());
        setLargeImage(null);
    }

	useEffect(() => {

        let isMounted = true;
        //console.log('loadPage: ' + pageId);

		async function fetchPage() {
            // Make a 'copy' of the page in memory so
            // the page is always different on comparisons
            const loadedPage = {...await getPage(pageId) };

           
            if (isMounted)
            {
                setPage(loadedPage);
                setIsLoaded(true);
                props.onPageLoaded(loadedPage);
            }

        }

        fetchPage();
        
        return () => { 
            isMounted = false; 
        }
        
    }, [pageId]); // second [] argument only executes this effect after mounting and not on updates
    
    if (!isLoaded)
    {
        return null;
    }

    const style = props.hoverIndexPostId ? { cursor : 'pointer' } : null;
    const hasIndex = page.index && page.index.length > 0;

    return (
        <React.Fragment>
            <Helmet>
                <title>{`${page.title} | Bart van de Sande`}</title>
            </Helmet>
            {/* <div className="page" ref={pageRef} style={style} onClick={() => onIndexClick(props.hoverIndexPostId)}> */ }
            <div className="page" ref={pageRef} style={style} >
                { hasIndex ? 
                <PageIndex 
                    page={page} 
                    indexStyles={props.indexStyles} 
                    onClick={onIndexClick}
                    onFadeOut={props.onFadeOut}
                    
                    /> : null }

                <Posts 
                    posts={page.posts} 
                    setRef={setPostRef} 
                    onLargeImage={onThumbnailClick} 
                    hide={largeImage} 
                    onRandomize={props.onRandomize} 
                    onFadeOut={props.onFadeOut}
                    />
                <LargeImage image={largeImage} onClose={() => onThumnailClose()} onOpen={props.onPoke} />

                <Footer onRandomize={props.onRandomize} onFadeOut={props.onFadeOut} multiplier={props.multiplier} onMultiplier={props.onMultiplier} />
                
            </div>
        </React.Fragment>
    )
}

export default withRouter(Page);