import{_ as a,c as n,a as e,o as t}from"./app.ab56574e.js";const k='{"title":"esbuild-plugin-sfx-wasm","description":"","frontmatter":{},"headers":[{"level":2,"title":"Installation","slug":"installation"},{"level":2,"title":"Use-cases","slug":"use-cases"},{"level":2,"title":"Usage","slug":"usage"},{"level":3,"title":"Build Config","slug":"build-config"},{"level":3,"title":"Usage in your code","slug":"usage-in-your-code"}],"relativePath":"packages/esbuild-plugins/README.md"}',o={};function p(l,s,i,c,u,d){return t(),n("div",null,s[0]||(s[0]=[e(`<h1 id="esbuild-plugin-sfx-wasm" tabindex="-1">esbuild-plugin-sfx-wasm <a class="header-anchor" href="#esbuild-plugin-sfx-wasm" aria-hidden="true">#</a></h1><h2 id="installation" tabindex="-1">Installation <a class="header-anchor" href="#installation" aria-hidden="true">#</a></h2><p>With npm:</p><div class="language-sh"><pre><code><span class="token function">npm</span> i <span class="token parameter variable">-D</span> esbuild-plugin-sfx-wasm
</code></pre></div><h2 id="use-cases" tabindex="-1">Use-cases <a class="header-anchor" href="#use-cases" aria-hidden="true">#</a></h2><p><strong>The primary motivation for this plugin is to simplify the bundling and distribution of web assembly modules</strong></p><ul><li>Compresses the wasm module using Zstd</li><li>Encodes the compressed wasm module as a base91 string</li><li>Generates a standalone module that decodes and instantiates the wasm module on demand</li></ul><h2 id="usage" tabindex="-1">Usage <a class="header-anchor" href="#usage" aria-hidden="true">#</a></h2><h3 id="build-config" tabindex="-1">Build Config <a class="header-anchor" href="#build-config" aria-hidden="true">#</a></h3><div class="language-ts"><pre><code><span class="token keyword">import</span> esbuild <span class="token keyword">from</span> <span class="token string">&quot;esbuild&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> sfxWasm <span class="token keyword">from</span> <span class="token string">&quot;esbuild-plugin-sfx-wasm&quot;</span><span class="token punctuation">;</span>

esbuild<span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token comment">/* ... */</span>
  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token function">sfxWasm</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token comment">/* ... */</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><h3 id="usage-in-your-code" tabindex="-1">Usage in your code <a class="header-anchor" href="#usage-in-your-code" aria-hidden="true">#</a></h3><div class="language-js"><pre><code><span class="token keyword">import</span> loadCalculator <span class="token keyword">from</span> <span class="token string">&quot;../build/calculator.wasm&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token parameter">a<span class="token punctuation">,</span> b</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> calc <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">loadCalculator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> calc<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div>`,12)]))}var h=a(o,[["render",p]]);export{k as __pageData,h as default};
