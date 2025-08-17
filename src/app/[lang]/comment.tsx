"use client";

import Giscus from "@giscus/react";

export default function Comment() {
  return (
    <section className="mx-4 md:max-w-4xl md:mx-auto my-8">
      <Giscus
        id="comments"
        repo="codinasion/.github"
        repoId="R_kgDOMV2twg"
        category="General"
        categoryId="DIC_kwDOMV2tws4CuIXF"
        mapping="specific"
        term="BG Remover"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
