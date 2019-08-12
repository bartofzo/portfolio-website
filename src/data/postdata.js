import notFound from './json/posts/404.json';

async function getPost(postId)
{
    try {
        const post = await import(`./json/posts/${postId}.json`);
        return post;
    }
    catch
    {
        return notFound;
    }
}

export default getPost;