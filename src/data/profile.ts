/**
 * Single source of truth for profile content.
 *
 * The HTML pages (Astro components) and the machine-readable outputs
 * (Markdown negotiation, llms.txt, JSON-LD, sitemap) all read from here so
 * they never drift apart.
 */

export type Lang = "ja" | "en";

export const SITE_URL = "https://hekuta.net";

export interface CareerEntry {
  startDate: string;
  endDate: string;
  company: string;
  position: string;
  descriptions: string[];
  blogUrl?: string;
  blogTitle?: string;
}

export interface WorkEntry {
  projectName: string;
  projectDescription: string;
  projectLink: string;
  githubLink?: string;
  technologies: string[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export const socialLinks: SocialLink[] = [
  { label: "X", url: "https://x.com/Heitor_Hirose" },
  { label: "Instagram", url: "https://www.instagram.com/hirose_heitor/" },
  { label: "GitHub", url: "https://github.com/HEKUCHAN" },
  { label: "Zenn", url: "https://zenn.dev/hekuchandao" },
];

export const ZENN_URL = "https://zenn.dev/hekuchandao";
export const LINUXCLUB_URL = "https://lcn.ad.jp/";

export interface ProfileContent {
  lang: Lang;
  /** Path of the HTML page for this language. */
  path: string;
  name: string;
  nameAlt: string;
  role: string;
  title: string;
  description: string;
  affiliation: string;
  /** About section, one entry per paragraph. */
  about: string[];
  interests: string[];
  careers: CareerEntry[];
  works: WorkEntry[];
  worksFooter: string;
  socialIntro: string;
  moreArticles: string;
}

const tutBusTechnologies = ["Next.js", "TypeScript", "Go", "TypeSpec"];

export const profileJa: ProfileContent = {
  lang: "ja",
  path: "/",
  name: "広瀬 エイトル",
  nameAlt: "Heitor Hirose",
  role: "学生エンジニア",
  title: "About HeitorHirose",
  description: "広瀬エイトル (Heitor Hirose) のプロフィール",
  affiliation: "東京工科大学 コンピュータサイエンス学部",
  about: [
    "東京工科大学 コンピュータサインエス学部 コンピュータサイエンス学科 学部生",
    "愛知県西尾市出身。高校在学時からスタートアップや業務委託案件に参画し、バックエンド・フロントエンド問わず幅広い開発に携わってきました。Python や TypeScript を中心に、API開発、UI改善、外部サービス連携などの実務を経験しました。",
    "Snowflakeやデータパイプラインの設計・運用にも強い関心を持っていて、将来はデータエンジニア、またはフルスタックエンジニアとしてのキャリアも視野に入れています。 エンジニアとしてのモットーは「未知の領域でも臆せず挑戦し、糧にすること」です。",
  ],
  interests: [
    "ログ収集、分析基盤の設計・構築・運用",
    "データパイプラインの設計・運用",
    "Snowflakeを活用したデータ分析基盤の構築",
    "LLMやRAG、ワークフローなどの生成AI技術の活用・応用",
    "セマンティックレイヤーを用いたAI Agentの性能評価",
  ],
  careers: [
    {
      startDate: "2026年8月",
      endDate: "2026年9月",
      company: "株式会社サイバーエージェント",
      position: "バックエンドエンジニア（インターン）",
      descriptions: [
        "チーム内を主導し、社内ナレッジのニーズを整理してKnowledge Catalogの方向性を策定",
        "AIエージェントに社内ナレッジを提供する基盤を設計・開発",
        "仕様書や議事メモなどのナレッジを体系的に管理する仕組みを構築",
        "LLMを活用した知識検索・連携プロトタイプを開発・検証",
      ],
      blogUrl: "https://developers.cyberagent.co.jp/blog/archives/67259/",
      blogTitle:
        "CyberAgent - Knowledge CatalogでAIエージェントに社内の知識を渡す基盤づくり",
    },
    {
      startDate: "2026年5月",
      endDate: "2026年8月",
      company: "株式会社メルカリ",
      position: "データエンジニア（インターン）",
      descriptions: [
        "社内プロダクト「Socrates」の改善および新機能開発に従事",
        "LLMOpsにおける評価データセットの作成・評価プロセスの整備",
        "LLMによるデータ活用精度向上に向けたセマンティックレイヤーの整備・改善",
        "AI Agentを用いたセマンティックレイヤーの自動構築・保守に関する複数のPoCを実施",
      ],
    },
    {
      startDate: "2024年8月",
      endDate: "2026年5月",
      company: "株式会社AIdeaLab",
      position: "フルスタックエンジニア（業務委託）",
      descriptions: [
        "TypeScript (Next.js, etc...), Go, Pythonを使用した新機能開発・UI改善・バグ修正",
        "RAGの精度改善やLangChainを用いたワークフロー開発",
        "受託開発における要件定義・設計・実装",
      ],
    },
    {
      startDate: "2026年2月",
      endDate: "2026年3月",
      company: "Sansan株式会社",
      position: "データエンジニア（インターン）",
      descriptions: [
        "Bill Oneのデータプラットフォームを活用した分析支援AIエージェントを設計・開発",
        "dbtを用いてデータをモデリングしてBigQueryデータを用いたデータ分析を実現",
        "社内分析モデルのナレッジ管理とAIエージェント統合による分析ワークフローを構築",
      ],
      blogUrl: "https://buildersbox.corp-sansan.com/entry/2026/04/09/100000",
      blogTitle:
        "Sansan Tech Blog - Bill Oneのデータ分析エージェントをインターンで開発した話",
    },
    {
      startDate: "2025年8月",
      endDate: "2025年9月",
      company: "株式会社サイバーエージェント",
      position: "バックエンドエンジニア（インターン）",
      descriptions: [
        "AI事業本部にてLLMを活用したプロダクト「AI POS」の開発に参画",
        "LLM Observability基盤（Langfuse）の技術選定からアーキテクチャ設計、GKE上での構築まで",
        "Otel Collectorを用いたログ収集アーキテクチャを設計し、Cloud Runのサイドカー構成で実装",
        "複数のLLMフレームワーク（SmolAgents, LangGraph等）に対応した統合監視基盤を構築",
      ],
      blogUrl: "https://developers.cyberagent.co.jp/blog/archives/59703/",
      blogTitle: "CyberAgent - LLM Ops/Observability基盤の選定とLangfuseの構築",
    },
    {
      startDate: "2025年2月",
      endDate: "2025年3月",
      company: "株式会社サイバーエージェント（Go College）",
      position: "短期インターン参加",
      descriptions: [
        "Goの基礎・Web実装、DB・Redis、テスト・パフォーマンスの集中学習",
        "発展課題でクリーンアーキテクチャ導入 / OpenTelemetry・pprof・SigNozで計測環境を構築",
        "コード品質やパフォーマンス改善の重要性を体感",
      ],
      blogUrl: "https://zenn.dev/hekuchandao/articles/31b5bd1f8ca1d2",
      blogTitle:
        "Zenn - サイバーエージェント主催のGo Collegeで2週間かけて成長した話。",
    },
    {
      startDate: "2024年5月",
      endDate: "2024年5月",
      company: "株式会社ゆめみ（1Dayインターン）",
      position: "ワークショップ参加",
      descriptions: [
        "要件定義に基づくAPI設計・DB設計のグループワーク",
        "議論・役割分担・チェックリスト運用などチーム設計プロセスを学習",
        "短時間での要件整理と設計ドキュメント化のスキルを強化",
      ],
      blogUrl: "https://zenn.dev/hekuchandao/articles/e65daebaa22742",
      blogTitle: "Zenn - 株式会社ゆめみの 1Dayインターン に参加してみた。",
    },
    {
      startDate: "2023年9月",
      endDate: "2024年8月",
      company: "株式会社Unicode",
      position: "バックエンドエンジニア（業務委託）",
      descriptions: [
        "配送会社APIとの連携機能設計・実装（ShipOne）",
        "UI改善・デバッグ対応",
        "複数の外部API仕様差異を吸収するバックエンド設計・実装",
      ],
    },
    {
      startDate: "2021年5月",
      endDate: "2022年6月",
      company: "株式会社doot",
      position: "フルスタックエンジニア（インターン）",
      descriptions: [
        "X（旧Twitter）クローラーの開発・運用",
        "利用者フィードバックを元にしたUI改善",
        "バックエンドAPIの新機能実装・バグ修正",
      ],
    },
  ],
  works: [
    {
      projectName: "東京工科大学 - スクールバス時刻表",
      projectDescription:
        "ハッカソンで開発した非公式の東京工科大学のスクールバスの時刻表を提供するWebサイトです。日々の学生、教職員の生活を手助けすることを目的にして開発しております。（開発中）",
      projectLink: "https://tut-bus.lcn.ad.jp/",
      githubLink: "https://github.com/lc-tut/tut-bus",
      technologies: tutBusTechnologies,
    },
  ],
  worksFooter: "Will continue to add more works...",
  socialIntro: "ご気軽に以下のSNSアカウントへご連絡ください。",
  moreArticles: "Zennで他の記事も見る",
};

export const profileEn: ProfileContent = {
  lang: "en",
  path: "/en",
  name: "Heitor Hirose",
  nameAlt: "広瀬 エイトル",
  role: "Student Engineer",
  title: "About Heitor Hirose",
  description: "Heitor Hirose's portfolio and profile",
  affiliation: "Tokyo University of Technology, School of Computer Science",
  about: [
    "Undergraduate student in the Department of Computer Science, School of Computer Science, Tokyo University of Technology.",
    "Born in Nishio, Aichi, I started joining startup projects and contract development work while still in high school. Since then, I have worked across both backend and frontend development, mainly using Python and TypeScript for API development, UI improvements, and external service integrations.",
    "I am also deeply interested in designing and operating Snowflake-based analytics platforms and data pipelines. Looking ahead, I aim to grow as either a data engineer or a full-stack engineer. My core mindset as an engineer is to take on unfamiliar challenges and turn them into opportunities for growth.",
  ],
  interests: [
    "Designing, building, and operating log collection and analytics platforms",
    "Design and operations of data pipelines",
    "Building analytics platforms with Snowflake",
    "Applying generative AI technologies such as LLMs, RAG, and workflow automation",
    "Evaluating AI agent performance with semantic layers",
  ],
  careers: [
    {
      startDate: "Aug 2026",
      endDate: "Sep 2026",
      company: "CyberAgent, Inc.",
      position: "Backend Engineer Intern",
      descriptions: [
        "Led team interviews to identify internal knowledge needs and define the direction of Knowledge Catalog",
        "Designed and developed a foundation for providing internal knowledge to AI agents",
        "Built a system to organize knowledge such as specifications and meeting notes",
        "Developed and evaluated an LLM-powered knowledge search and integration prototype",
      ],
      blogUrl: "https://developers.cyberagent.co.jp/blog/archives/67259/",
      blogTitle:
        "CyberAgent - Building a foundation for providing internal knowledge to AI agents with Knowledge Catalog",
    },
    {
      startDate: "May 2026",
      endDate: "Aug 2026",
      company: "Mercari, Inc.",
      position: "Data Engineer Intern",
      descriptions: [
        'Improved and added new features to the internal product "Socrates"',
        "Built and standardized evaluation datasets and workflows for LLMOps",
        "Enhanced semantic layers to improve data utilization accuracy with LLMs",
        "Ran multiple PoCs on automated semantic layer construction and maintenance using AI agents",
      ],
    },
    {
      startDate: "Aug 2024",
      endDate: "May 2026",
      company: "AIdeaLab, Inc.",
      position: "Full-Stack Engineer (Contract)",
      descriptions: [
        "Developed new features, improved UI, and fixed bugs using TypeScript (Next.js), Go, and Python",
        "Improved RAG performance and built workflows with LangChain",
        "Handled requirement definition, architecture design, and implementation for client projects",
      ],
    },
    {
      startDate: "Feb 2026",
      endDate: "Mar 2026",
      company: "Sansan, Inc.",
      position: "Data Engineer Intern",
      descriptions: [
        "Designed and developed an analytics support AI agent on top of the Bill One data platform",
        "Modeled data with dbt and enabled analysis workflows using BigQuery datasets",
        "Built analytics workflows by combining internal model knowledge management with AI agents",
      ],
      blogUrl: "https://buildersbox.corp-sansan.com/entry/2026/04/09/100000",
      blogTitle:
        "Sansan Tech Blog - Building a Bill One analytics agent during my internship",
    },
    {
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      company: "CyberAgent, Inc.",
      position: "Backend Engineer Intern",
      descriptions: [
        'Joined development of "AI POS," an LLM-powered product, in the AI Business Division',
        "Led technical selection and architecture design of an LLM observability stack (Langfuse), then deployed it on GKE",
        "Designed a log collection architecture with OpenTelemetry Collector and implemented it with Cloud Run sidecars",
        "Built an integrated monitoring platform compatible with multiple LLM frameworks (SmolAgents, LangGraph, etc.)",
      ],
      blogUrl: "https://developers.cyberagent.co.jp/blog/archives/59703/",
      blogTitle:
        "CyberAgent - Internship report on selecting and building an LLM Ops/Observability stack with Langfuse",
    },
    {
      startDate: "Feb 2025",
      endDate: "Mar 2025",
      company: "CyberAgent, Inc. (Go College)",
      position: "Short-Term Internship",
      descriptions: [
        "Intensive training on Go fundamentals, web development, DB/Redis, testing, and performance",
        "Introduced Clean Architecture in advanced assignments and built observability with OpenTelemetry, pprof, and SigNoz",
        "Deepened understanding of code quality and performance optimization",
      ],
      blogUrl: "https://zenn.dev/hekuchandao/articles/31b5bd1f8ca1d2",
      blogTitle:
        "Zenn - How I grew through a two-week Go College program by CyberAgent",
    },
    {
      startDate: "May 2024",
      endDate: "May 2024",
      company: "YUMEMI Inc. (1-Day Internship)",
      position: "Workshop Participant",
      descriptions: [
        "Worked in a group on API and database design based on requirements",
        "Learned practical team design processes including discussion, role allocation, and checklist operation",
        "Strengthened skills in quickly organizing requirements and producing design documents",
      ],
      blogUrl: "https://zenn.dev/hekuchandao/articles/e65daebaa22742",
      blogTitle: "Zenn - My experience joining YUMEMI's 1-Day internship",
    },
    {
      startDate: "Sep 2023",
      endDate: "Aug 2024",
      company: "Unicode, Inc.",
      position: "Backend Engineer (Contract)",
      descriptions: [
        "Designed and implemented an integration with shipping carrier APIs (ShipOne)",
        "Handled UI improvements and debugging support",
        "Built backend logic to absorb specification differences across multiple external APIs",
      ],
    },
    {
      startDate: "May 2021",
      endDate: "Jun 2022",
      company: "doot, Inc.",
      position: "Full-Stack Engineer Intern",
      descriptions: [
        "Developed and operated an X (formerly Twitter) crawler",
        "Improved UI based on user feedback",
        "Implemented new backend API features and fixed bugs",
      ],
    },
  ],
  works: [
    {
      projectName: "Tokyo University of Technology - School Bus Timetable",
      projectDescription:
        "An unofficial web app that provides school bus timetables for Tokyo University of Technology, originally built at a hackathon. We are developing it to support students and staff in their daily campus life. (In development)",
      projectLink: "https://tut-bus.lcn.ad.jp/",
      githubLink: "https://github.com/lc-tut/tut-bus",
      technologies: tutBusTechnologies,
    },
  ],
  worksFooter: "More projects will be added soon...",
  socialIntro: "Feel free to reach out through any of the social accounts below.",
  moreArticles: "View more articles on Zenn",
};

export const profiles: Record<Lang, ProfileContent> = {
  ja: profileJa,
  en: profileEn,
};
