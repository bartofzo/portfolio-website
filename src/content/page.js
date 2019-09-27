import React, { useState, useEffect, useRef } from 'react';
import Posts from './posts.js';
import PageIndex from './pageindex.js';
import getPage from '../data/pagedata.js';
import SmoothScrollWindow from '../util/smoothscrollwindow.js';
import LargeImage from './largeimage.js';
import { Helmet } from 'react-helmet';
import Footer from './footer.js';

function Page(props)
{

    const { pageId } = props;
    const [page, setPage] = useState({});
    const [largeImage, setLargeImage] = useState(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const postRefs = useRef({});
    const pageRef = useRef(null);


    const setPostRef = (element, index) => {
        postRefs.current[index] = element;
    }

    const onIndexClick = (postId) => {
        if (postId && postRefs.current[postId])
        {
            SmoothScrollWindow.scrollTo(postRefs.current[postId], 500);
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
		async function fetchPage() {
            const loadedPage = await getPage(pageId);
            setPage(loadedPage);
            setIsLoaded(true);
            props.onPageLoaded(loadedPage);
		}
		fetchPage();
    }, [pageId]); // second [] argument only executes this effect after mounting and not on updates
    
    if (!isLoaded)
    {
        return null;
    }

    const style = props.hoverIndexPostId ? { cursor : 'pointer' } : null;

    return (
        <React.Fragment>
            <Helmet>
                <title>{`${page.title} | Bart van de Sande`}</title>
            </Helmet>
            <div className="page" ref={pageRef} style={style} onClick={() => onIndexClick(props.hoverIndexPostId)}>

                <PageIndex pageIndexElements={page.index} indexStyles={props.indexStyles} onClick={onIndexClick} />

                <Posts posts={page.posts} setRef={setPostRef} onLargeImage={onThumbnailClick} hide={largeImage} />
                <LargeImage image={largeImage} onClose={() => onThumnailClose()} onOpen={props.onPoke} />

                <Footer onRandomize={props.onRandomize} />

            </div>
        </React.Fragment>
    )
}

export default Page;