import { Link } from "react-router-dom";
import { ArrowRight, Clock3 } from "lucide-react";

const articles = [
    {
        id: 1,
        title: "Getting Started with Modern Web Development",
        description: "Learn the fundamentals of modern web development and how to build better digital experiences.",
        category: "Technology",
        date: "November 18, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
        slug: "getting-started-with-modern-web-development"
    },
    {
        id: 2,
        title: "The Art of Building Better User Experiences",
        description: "See how thoughtful design and user-focused thinking create meaningful products.",
        category: "Design",
        date: "November 16, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900",
        slug: "building-better-user-experiences"
    },
    {
        id: 3,
        title: "Turning Creative Ideas Into Real Projects",
        description: "Turn your ideas into practical projects through planning and consistency.",
        category: "Productivity",
        date: "November 14, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900",
        slug: "turning-ideas-into-projects"
    }
];

const categories = [
    { name: "Technology", text: "Code, tools and the web" },
    { name: "Design", text: "Interfaces and creative work" },
    { name: "Business", text: "Ideas for work and growth" },
    { name: "Lifestyle", text: "Habits and everyday life" }
];

function Meta({ article }) {
    return (
        <p className="flex items-center gap-2 text-sm text-stone-500">
            {article.date}
            <span aria-hidden="true">•</span>
            <Clock3 size={14} /> {article.readTime}
        </p>
    );
}

function Home() {
    const [featured, ...rest] = articles;

    return (
        <div className="bg-stone-50 text-stone-900">

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                        Read and share ideas that matter.
                    </h1>

                    <p className="mt-6 text-lg text-stone-600 leading-8 max-w-md">
                        Read articles from our community, or create an account and publish your own.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="#articles"
                            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-full font-medium transition"
                        >
                            Read articles <ArrowRight size={18} />
                        </a>
                        <Link
                            to="/register"
                            className="inline-flex items-center border border-stone-300 hover:border-stone-900 px-6 py-3 rounded-full font-medium transition"
                        >
                            Start writing
                        </Link>
                    </div>
                </div>

                <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
                    alt=""
                    className="w-full h-72 md:h-[420px] object-cover rounded-3xl"
                />
            </section>

            {/* Latest articles */}
            <section id="articles" className="max-w-6xl mx-auto px-4 pb-20 scroll-mt-20">
                <div className="flex items-end justify-between border-b border-stone-200 pb-4">
                    <h2 className="font-serif text-3xl font-bold">Latest articles</h2>
                    <Link to="/blogs" className="text-sm font-medium text-indigo-700 hover:underline">
                        View all
                    </Link>
                </div>

                {/* Featured */}
                <Link
                    to={`/blogs/${featured.slug}`}
                    className="group mt-8 grid md:grid-cols-2 gap-8 items-center"
                >
                    <img
                        src={featured.image}
                        alt=""
                        className="w-full h-64 md:h-80 object-cover rounded-2xl"
                    />
                    <div>
                        <span className="text-sm font-semibold text-indigo-700">{featured.category}</span>
                        <h3 className="mt-2 font-serif text-3xl md:text-4xl font-bold leading-tight group-hover:text-indigo-700 transition">
                            {featured.title}
                        </h3>
                        <p className="mt-4 text-stone-600 leading-7">{featured.description}</p>
                        <div className="mt-5"><Meta article={featured} /></div>
                    </div>
                </Link>

                {/* Other articles */}
                <div className="mt-14 grid sm:grid-cols-2 gap-10">
                    {rest.map((article) => (
                        <Link key={article.id} to={`/blogs/${article.slug}`} className="group block">
                            <img
                                src={article.image}
                                alt=""
                                className="w-full h-52 object-cover rounded-2xl"
                            />
                            <span className="mt-5 block text-sm font-semibold text-indigo-700">
                                {article.category}
                            </span>
                            <h3 className="mt-1 font-serif text-2xl font-bold leading-snug group-hover:text-indigo-700 transition">
                                {article.title}
                            </h3>
                            <p className="mt-2 text-stone-600 leading-7">{article.description}</p>
                            <div className="mt-3"><Meta article={article} /></div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Topics */}
            <section id="categories" className="bg-white border-y border-stone-200 scroll-mt-20">
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <h2 className="font-serif text-3xl font-bold">Browse by topic</h2>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                to={`/blogs?category=${category.name.toLowerCase()}`}
                                className="block rounded-2xl bg-stone-50 hover:bg-indigo-50 border border-stone-200 hover:border-indigo-300 p-6 transition"
                            >
                                <h3 className="font-serif text-xl font-bold">{category.name}</h3>
                                <p className="mt-1 text-sm text-stone-600">{category.text}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join */}
            <section id="about" className="max-w-6xl mx-auto px-4 py-20 scroll-mt-20">
                <div className="rounded-3xl bg-indigo-700 text-white px-6 py-14 md:px-16 text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold">
                        Have something to share?
                    </h2>
                    <p className="mt-4 text-indigo-100 leading-8 max-w-xl mx-auto">
                        BlogApp is a place to read, write and connect through articles.
                        Create a free account to publish your first story.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block mt-8 bg-white text-indigo-800 hover:bg-indigo-50 px-7 py-3 rounded-full font-medium transition"
                    >
                        Create an account
                    </Link>
                </div>
            </section>

        </div>
    );
}

export default Home;