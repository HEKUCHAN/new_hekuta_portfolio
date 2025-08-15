import dayjs from 'dayjs';
import Parser from 'rss-parser';

const MY_ZENN_USERNAME = "hekuchandao"

interface Post {
    title: string;
    date: string;
    slug: string;
}

export const getZennRssFeed = async (): Promise<Post[]> => {
    const parser = new Parser();
    const feed = await parser.parseURL('https://zenn.dev/' + MY_ZENN_USERNAME + '/feed?all=1');

    const posts: Post[] = feed.items.slice(0, 3).map(item => ({
        title: item.title ?? '',
        date: item.pubDate ? dayjs(item.pubDate).format('YYYY-MM-DD') : '',
        slug: item.link ?? 'https://zenn.dev/' + MY_ZENN_USERNAME,
    }));

    return posts;
};