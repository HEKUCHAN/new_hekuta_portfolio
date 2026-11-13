/**
 * Registry of every indexable page, plus the content of the trust pages
 * (/about, /contact, /privacy). Used by the HTML pages, the Markdown
 * variants, llms.txt and sitemap.xml.
 */
import { LINUXCLUB_URL, profileEn, profileJa, socialLinks, ZENN_URL } from "./profile.ts";

export interface SitePage {
  /** Canonical path of the HTML page (no trailing slash except root). */
  path: string;
  /** Path of the Markdown variant served for `Accept: text/markdown`. */
  markdownPath: string;
  title: string;
  description: string;
  lang: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful content change. */
  lastmod: string;
}

export interface ContentBlock {
  heading: string;
  paragraphs?: string[];
  items?: { text: string; url?: string }[];
}

export interface InfoPage extends SitePage {
  slug: "about" | "contact" | "privacy";
  heading: string;
  ja: ContentBlock[];
  en: ContentBlock[];
}

const socialItems = socialLinks.map((link) => ({ text: link.label, url: link.url }));

export const aboutPage: InfoPage = {
  slug: "about",
  path: "/about",
  markdownPath: "/about.md",
  title: "About - Heitor Hirose",
  heading: "About / プロフィール",
  description:
    "Who Heitor Hirose (広瀬 エイトル) is: a student software engineer at Tokyo University of Technology working on data engineering, LLMOps, and full-stack development.",
  lang: "ja",
  lastmod: "2026-11-13",
  ja: [
    {
      heading: "広瀬 エイトルについて",
      paragraphs: [
        "このサイト (hekuta.net) は、広瀬 エイトル (Heitor Hirose) 個人のポートフォリオサイトです。企業や団体のサイトではなく、本人が運営しています。",
        ...profileJa.about,
      ],
    },
    {
      heading: "経歴の概要",
      items: profileJa.careers.map((c) => ({
        text: `${c.startDate} ~ ${c.endDate}: ${c.company} - ${c.position}`,
      })),
    },
    {
      heading: "関心領域",
      items: profileJa.interests.map((text) => ({ text })),
    },
    {
      heading: "所属・活動",
      items: [
        { text: "東京工科大学 コンピュータサイエンス学部 コンピュータサイエンス学科 (学部生)" },
        { text: "LinuxClub メンバー", url: LINUXCLUB_URL },
        { text: "Zenn で技術記事を執筆", url: ZENN_URL },
      ],
    },
  ],
  en: [
    {
      heading: "About Heitor Hirose",
      paragraphs: [
        "This site (hekuta.net) is the personal portfolio of Heitor Hirose (広瀬 エイトル). It is run by Heitor personally and does not represent any company or organization.",
        ...profileEn.about,
      ],
    },
    {
      heading: "Experience at a glance",
      items: profileEn.careers.map((c) => ({
        text: `${c.startDate} - ${c.endDate}: ${c.company}, ${c.position}`,
      })),
    },
    {
      heading: "Interests",
      items: profileEn.interests.map((text) => ({ text })),
    },
    {
      heading: "Affiliations",
      items: [
        {
          text: "Undergraduate, Department of Computer Science, School of Computer Science, Tokyo University of Technology",
        },
        { text: "Member of LinuxClub", url: LINUXCLUB_URL },
        { text: "Writes technical articles on Zenn", url: ZENN_URL },
      ],
    },
  ],
};

export const contactPage: InfoPage = {
  slug: "contact",
  path: "/contact",
  markdownPath: "/contact.md",
  title: "Contact - Heitor Hirose",
  heading: "Contact / お問い合わせ",
  description:
    "How to contact Heitor Hirose (広瀬 エイトル): direct messages on X or Instagram, GitHub for code-related topics, and Zenn for article feedback.",
  lang: "ja",
  lastmod: "2026-11-13",
  ja: [
    {
      heading: "連絡方法",
      paragraphs: [
        "広瀬 エイトルへのご連絡は、以下のSNSアカウントへのダイレクトメッセージでお願いします。このサイトにはお問い合わせフォームはなく、メールアドレスも公開していません。",
        "インターンや業務委託のご相談、記事の内容に関するご質問、プロジェクトでの協業のお誘いなど、どのようなご連絡でも歓迎します。内容によっては返信までにお時間をいただく場合があります。",
      ],
      items: socialItems,
    },
    {
      heading: "用途別の連絡先",
      items: [
        { text: "お仕事・インターンのご相談: X または Instagram のダイレクトメッセージ" },
        { text: "公開リポジトリのバグ報告や改善提案: 該当する GitHub リポジトリの Issue", url: "https://github.com/HEKUCHAN" },
        { text: "記事へのご意見・ご質問: Zenn の各記事のコメント欄", url: ZENN_URL },
      ],
    },
  ],
  en: [
    {
      heading: "How to reach me",
      paragraphs: [
        "The best way to contact Heitor Hirose is a direct message on one of the social accounts below. This site has no contact form and no public email address.",
        "Messages about internships, contract work, questions about articles, or collaboration on projects are all welcome. Replies may take some time depending on the topic.",
      ],
      items: socialItems,
    },
    {
      heading: "Which channel to use",
      items: [
        { text: "Work or internship inquiries: a direct message on X or Instagram" },
        { text: "Bug reports or suggestions for public code: an issue on the relevant GitHub repository", url: "https://github.com/HEKUCHAN" },
        { text: "Feedback or questions about an article: the comments on that Zenn article", url: ZENN_URL },
      ],
    },
  ],
};

export const privacyPage: InfoPage = {
  slug: "privacy",
  path: "/privacy",
  markdownPath: "/privacy.md",
  title: "Privacy Policy - Heitor Hirose",
  heading: "Privacy Policy / プライバシーポリシー",
  description:
    "Privacy policy for hekuta.net: which analytics (Google Analytics, Vercel Speed Insights) and infrastructure providers process visitor data, and how to opt out.",
  lang: "ja",
  lastmod: "2026-11-13",
  ja: [
    {
      heading: "運営者",
      paragraphs: [
        "hekuta.net は広瀬 エイトル (Heitor Hirose) が個人で運営するポートフォリオサイトです。本ポリシーは、このサイトを閲覧した際に取得・処理される情報について説明します。",
      ],
    },
    {
      heading: "取得する情報と利用目的",
      paragraphs: [
        "このサイトにはお問い合わせフォームや会員登録機能はなく、氏名やメールアドレスなどを入力していただくことはありません。ただし、閲覧状況を把握してサイトを改善するため、以下の外部サービスを利用しています。",
      ],
      items: [
        {
          text: "Google Analytics: Cookie を用いて、閲覧したページ、参照元、ブラウザやデバイスの種類、IPアドレスから推定されるおおよその地域などを収集します。データは Google のプライバシーポリシーに従って扱われます。",
          url: "https://policies.google.com/privacy",
        },
        {
          text: "Vercel Speed Insights: ページの表示速度 (Core Web Vitals) を Cookie を使わずに計測します。",
          url: "https://vercel.com/docs/speed-insights/privacy-policy",
        },
        {
          text: "Google Fonts: フォントを Google のサーバーから読み込むため、IPアドレスなどの接続情報が Google に送信されます。",
          url: "https://policies.google.com/privacy",
        },
        {
          text: "Vercel / Cloudflare: サイトの配信とセキュリティ確保のため、アクセスログ (IPアドレス、ユーザーエージェント、アクセス日時など) が各社で処理されます。",
        },
      ],
    },
    {
      heading: "オプトアウト",
      paragraphs: [
        "Google Analytics による計測は、ブラウザの Cookie を無効にするか、Google が提供する「Google アナリティクス オプトアウト アドオン」を利用することで停止できます。",
      ],
      items: [
        { text: "Google アナリティクス オプトアウト アドオン", url: "https://tools.google.com/dlpage/gaoptout" },
      ],
    },
    {
      heading: "第三者提供・お問い合わせ・改定",
      paragraphs: [
        "運営者が取得した情報を販売したり、上記のサービス提供者以外の第三者へ提供したりすることはありません。外部サイトへのリンク先での情報の取り扱いについては、各サイトのポリシーをご確認ください。",
        "本ポリシーに関するご質問は、お問い合わせページに記載した方法でご連絡ください。本ポリシーは必要に応じて改定し、改定日をこのページに記載します。",
        "制定日: 2026年11月13日",
      ],
      items: [{ text: "お問い合わせ", url: "/contact" }],
    },
  ],
  en: [
    {
      heading: "Who runs this site",
      paragraphs: [
        "hekuta.net is a personal portfolio site run by Heitor Hirose (広瀬 エイトル). This policy explains what information is collected and processed when you visit the site.",
      ],
    },
    {
      heading: "What is collected and why",
      paragraphs: [
        "This site has no contact form and no accounts, so you are never asked for your name or email address. To understand how the site is used and to improve it, the following third-party services are used.",
      ],
      items: [
        {
          text: "Google Analytics: uses cookies to collect the pages you view, the referring site, browser and device type, and an approximate location derived from your IP address. Data is handled under Google's privacy policy.",
          url: "https://policies.google.com/privacy",
        },
        {
          text: "Vercel Speed Insights: measures page performance (Core Web Vitals) without using cookies.",
          url: "https://vercel.com/docs/speed-insights/privacy-policy",
        },
        {
          text: "Google Fonts: fonts are loaded from Google's servers, so connection information such as your IP address is sent to Google.",
          url: "https://policies.google.com/privacy",
        },
        {
          text: "Vercel and Cloudflare: process access logs (IP address, user agent, time of access) to deliver and secure the site.",
        },
      ],
    },
    {
      heading: "Opting out",
      paragraphs: [
        "You can stop Google Analytics measurement by disabling cookies in your browser or by installing the Google Analytics Opt-out Browser Add-on.",
      ],
      items: [
        { text: "Google Analytics Opt-out Browser Add-on", url: "https://tools.google.com/dlpage/gaoptout" },
      ],
    },
    {
      heading: "Sharing, questions, and changes",
      paragraphs: [
        "Collected information is never sold or shared with third parties other than the service providers listed above. Linked external sites have their own policies.",
        "For questions about this policy, use one of the channels on the contact page. This policy may be updated; the effective date below will change when it is.",
        "Effective date: November 13, 2026",
      ],
      items: [{ text: "Contact", url: "/contact" }],
    },
  ],
};

export const infoPages: InfoPage[] = [aboutPage, contactPage, privacyPage];

export const homePageJa: SitePage = {
  path: "/",
  markdownPath: "/index.md",
  title: profileJa.title,
  description: profileJa.description,
  lang: "ja",
  lastmod: "2026-11-13",
};

export const homePageEn: SitePage = {
  path: "/en",
  markdownPath: "/en.md",
  title: profileEn.title,
  description: profileEn.description,
  lang: "en",
  lastmod: "2026-11-13",
};

/** Every indexable HTML page on the site. */
export const sitePages: SitePage[] = [homePageJa, homePageEn, ...infoPages];
