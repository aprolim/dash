<!-- components/ui/RichContent.vue -->
<template>
  <div class="rich-content prose prose-lg max-w-none" v-html="content"></div>
</template>

<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<style scoped>
.rich-content :deep(h1) {
  @apply text-3xl font-bold mt-6 mb-4 text-gray-900;
}

.rich-content :deep(h2) {
  @apply text-2xl font-bold mt-5 mb-3 text-gray-800;
}

.rich-content :deep(h3) {
  @apply text-xl font-semibold mt-4 mb-2 text-gray-800;
}

.rich-content :deep(p) {
  @apply mb-4 leading-relaxed;
}

.rich-content :deep(ul) {
  @apply list-disc pl-5 my-3;
}

.rich-content :deep(ol) {
  @apply list-decimal pl-5 my-3;
}

.rich-content :deep(li) {
  @apply mb-1;
}

.rich-content :deep(blockquote) {
  @apply border-l-4 border-primary-300 pl-4 my-3 text-gray-600 italic;
}

.rich-content :deep(a) {
  @apply text-primary-600 underline hover:text-primary-800;
}

.rich-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-2 shadow-md;
}

.rich-content :deep(strong) {
  @apply font-bold;
}

.rich-content :deep(em) {
  @apply italic;
}

.rich-content :deep(u) {
  @apply underline;
}

.rich-content :deep(code) {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.rich-content :deep(pre) {
  @apply bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-3;
}

.rich-content :deep(pre code) {
  @apply bg-transparent text-white;
}

.rich-content :deep(hr) {
  @apply my-6 border-gray-300;
}

.rich-content :deep(table) {
  @apply w-full border-collapse my-3;
}

.rich-content :deep(th) {
  @apply border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold;
}

.rich-content :deep(td) {
  @apply border border-gray-300 px-3 py-2;
}
</style>