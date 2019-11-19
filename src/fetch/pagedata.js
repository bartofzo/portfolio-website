import notFound from '../data/pages/404.json';

/*
async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}
*/

async function getPage(pageId)
{
    try {
        const page = await import(`../data/pages/${pageId}.json`);
        return page;
    }
    catch
    {
        return notFound;
    }
}

export default getPage;