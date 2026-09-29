import BlogEditor from "@/components/blog/blog-editor";

export default function CreateBlogPage() {
  return (
    <section className="mx-auto max-w-4xl">

      <h1 className="text-3xl font-bold">
        Write a Blog
      </h1>

      <p className="theme-text-secondary mt-2">
        Share your thoughts with NELO.
      </p>

      <input
        type="text"
        placeholder="Blog title"
        className="theme-bg theme-text theme-border mt-8 w-full rounded-xl border px-4 py-3 text-xl font-semibold outline-none"
      />

      <div className="mt-5">
        <BlogEditor />
      </div>

    </section>
  );
}