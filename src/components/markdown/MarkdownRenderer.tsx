import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export const markdownClassNames = "max-w-none prose prose-neutral font-sans";

export default function MarkdownRenderer({
  source,
  options,
  className,
  ...rest
}: MDXRemoteProps & { className?: string }) {
  return (
    <div className="">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              ...(options?.mdxOptions?.remarkPlugins ?? []),
            ],
          },
          ...options?.mdxOptions,
        }}
        {...rest}
      />
    </div>
  );
}
