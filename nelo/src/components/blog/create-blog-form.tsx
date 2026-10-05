"use client";

import BlogForm from "@/components/blog/blog-form";

type CreateBlogFormProps = {
  userId: string;
};

export default function CreateBlogForm({ userId }: CreateBlogFormProps) {
  return <BlogForm mode="create" userId={userId} />;
}
