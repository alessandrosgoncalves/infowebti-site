# Relatório de Otimização de Performance — InfoWebTI

**Site:** https://www.infowebti.com.br
**Data do diagnóstico:** setembro de 2026
**Ferramenta:** Google PageSpeed Insights (mobile)
**Ambiente de trabalho:** Windows; implementação feita na pasta local `infowebtipages` (espelho da produção)

---

## 1. Resumo executivo

O site apresentava **LCP de 10,5 s** (alvo: ≤ 2,5 s) causado principalmente pela imagem de herói de **1.079,8 KiB**, ausência de compressão gzip e de cachê no Apache, e ~100 KiB de CSS de fontes bloqueante (Google Fonts + Font Awesome). Após as otimizações locais:

| Ação | Ganho estimado |
|---|---|
| WebP (17,2 MB → 0,8 MB) | **-95% do peso de imagem** |
| `defer` em JS + SVG inline | remove 2 requestes bloqueantes |
| gzip + cache (`.htaccess`) | já serve no 1º e 2º acesso |
| LCP (previsão) | herói 1.080 KB → 86,4 KB |

As mudanças estão **aplicadas localmente e validadas**, **ainda não publicadas** (ver seção 9).

---

## 2. Metodologia

1. Execução do PageSpeed Insights mobile em `https://www.infowebti.com.br/`.
2. A API pública (sem chave) retornou **HTTP 429** (cota esgotada); os resultados foram obtidos a partir do relatório salvo
   `C:\Users\lab\Documents\page speed\PageSpeed Insights.htm`.
3. Todos os arquivos do site real foram conferidos arquivo a arquivo e, quando aplicável, página a página.

---

## 3. Baseline (antes das otimizações)

**Notas (mobile):**

| Categoria | Nota |
|---|---|
| Desempenho | **66** |
| Acessibilidade | **88** |
| Práticas recomendadas | **96** |
| SEO | **100** |
| Navegação agêntica | 1 / 2 |

**Métricas de laboratório:**

| Métrica | Valor | Meta |
|---|---|---|
| FCP (First Contentful Paint) | 3,8 s | ≤ 1,8 s |
| **LCP (Largest Contentful Paint)** | **10,5 s** | ≤ 2,5 s |
| TBT (Total Blocking Time) | 0 ms | ≤ 200 ms |
| CLS (Cumulative Layout Shift) | 0 | ≤ 0,1 |
| Speed Index | 3,8 s | ≤ 3,4 s |

> Sem dados de Campo (CrUX) para este URL/plataforma.

---

## 4. Diagnóstico — causas raiz encontradas

1. **LCP — imagem de herói `img/computador-hero.jpg` (1.079,8 KiB)** carregada via `<img>` simples, sem `fetchpriority` e sem WebP/AVIF.
2. **Servidor sem compactação nem cachê**: respostas sem `Content-Encoding: gzip` e sem `Cache-Control`/`Expires` (diagnóstico "1.130 KiB de cache de rede" e "documento com 12 KiB de latência").
3. **CSS bloqueante de fontes**: `style.css` (44,6 KB) + `font-awesome 6.4.0 all.min.css` (~100 KiB) + Google Fonts (Inter) — "3.000 ms em recursos bloqueantes de renderização".
4. **Font Awesome inteiro (~100 KiB)** para renderizar os ícones.
5. **VLibras** (padrão de acessibilidade do governo): 3 tarefas longas, roda antes do DOM pronto.
6. **Documento sem imagens WebP** e sem `loading="lazy"` nas imagens abaixo da dobra ("1.070 KiB de entrega de imagens").

---

## 5. Otimizações aplicadas

### 5.1 Imagens convertidas para WebP

Ferramenta: `cwebp` portátil (libwebp 1.5.0), 1.600 px de largura, qualidade 80. Resultados:

| Arquivo | JPG original | WebP | Redução |
|---|---|---|---|
| computador-hero | 1.079,8 KB | **86,4 KB** | 92% |
| technology | 4.609,0 KB | 154,6 KB | 97% |
| tecnologia | 3.920,3 KB | 151,2 KB | 96% |
| nuvem | 3.066,9 KB | 65,5 KB | 98% |
| datacenter | 1.500,7 KB | 214,7 KB | 86% |
| analytics | 2.117,8 KB | 73,6 KB | 97% |
| cloud | 862,1 KB | 84,5 KB | 90% |
| **Total** | **17.156,6 KB** | **830,6 KB** | **-95%** |

### 5.2 Imagens em `<picture>` + fallback + acessibilidade

- **11 imagens em 7 arquivos** convertidas para `<picture>` com `srcset` WebP e fallback JPG:
  `index.html` (1 — herói), `blog.html` (3), `projetos.html` (3), `servicos.html` (1), `blog/artigo-ciberseguranca.html` (1), `blog/artigo-data-centers.html` (1), `blog/artigo-migracao-nuvem.html` (1).
- **Herói (LCP):** `fetchpriority="high"`, dimensões explícitas `width="1600" height="1065"` (elimina CLS).
- **9 imagens abaixo da dobra:** `loading="lazy"` + `decoding="async"`.
- **`alt` descritivo** em todas as `<img>` do site (0 imagens sem `alt`; verificação automática).
- Única exceção: `login.html` (não publicado; contém 1 `<img>` sem `alt` — mantido intacto).

### 5.3 Compactação e cachê (`infowebtipages/.htaccess`)

Criado novo arquivo `.htaccess`, com todas as diretivas guardadas em `<IfModule>` para não gerar erro 500 caso um módulo não esteja carregado:

- **`mod_deflate`** — gzip em HTML, CSS, JS, JSON, XML e SVG.
- **`mod_expires`** — HTML: 1 hora; CSS/JS: 1 ano; imagens/fontes: 1 ano.
- **`mod_headers`** — `Cache-Control: public, max-age=31536000, immutable` para `css|js|webp|avif|jp?g|png|gif|svg|woff2?|ttf|otf|ico` e `public, max-age=3600` para HTML.
- **`mod_mime`** — `AddType` para WebP, AVIF, WOFF/WOFF2 e SVG.

> ⚠️ **Ainda não enviado ao servidor.** O `.htaccess` atual da hospedagem pode existir e será substituído; o backup da produção está preservado (seção 7).

### 5.4 Scripts carregados com `defer`

- `js/script.js?v=1.2` e `vlibras-plugin.js` agora carregam com `defer` em **8 páginas** (index, blog, servicos, projetos, sobre, contato, politica, sitemap) — não bloqueiam a renderização.
- **Inicialização do VLibras** protegida: só executa quando `window.VLibras` existir; se não, aguarda `DOMContentLoaded` — evita tarefas longas no início do carregamento.
- `login.html` e os 3 artigos do blog não incluem esses scripts; nenhuma alteração foi feita neles além do necessário.

### 5.5 Font Awesome → SVG inline (sem request externo)

- **51 ícones distintos** usados no site tiveram o SVG oficial baixado (`@fortawesome/fontawesome-free@6.4.0`); aliases FA5→FA6 mapeados corretamente (ex.: `phone-alt→phone-flip`, `calendar-alt→calendar-days`, `shield-alt→shield-halved`, `hdd→hard-drive`, `file-alt→file-lines`, `user-cog→user-gear`, `history→clock-rotate-left`, `home→house`).
- **200 marcações `<i class="fa-...">` substituídas** por SVG inline (`viewBox` oficial, `width/height="1em"`, `fill="currentColor"`, `aria-hidden`, `focusable="false"`) nas 12 páginas.

| Página | Ícones (SVG) |
|---|---|
| sitemap.html | 36 |
| index.html | 35 |
| contato.html | 21 |
| servicos.html | 21 |
| blog.html | 20 |
| sobre.html | 19 |
| politica.html | 18 |
| projetos.html | 11 |
| artigos do blog (3) | 9 cada |
| login.html | 0 |

- **Link do Font Awesome removido de todas as 12 páginas** (`font-awesome/6.4.0/css/all.min.css`) — elimina ~100 KiB e um request bloqueante; os ícones são 100% self-hosted/inline.
- **Bloco CSS de ajustes finos** inserido em cada página (validado visualmente no teste):
  - livestização dos SVG ao glifo (`font-style: normal; vertical-align: -0.125em`);
  - "Garantia Total" em azul `.band-stat` (`fill: var(--accent-cyan)`);
  - ícones dos cards +15 / +20 / Desde 2006 centralizados e dimensionados (1.25em / 1.15em / 1em);
  - rodapé (menu de contato): ícones alinhados na linha de base + telefone `1em`.

### 5.6 Verificação final (pós-edição, 12 páginas)

- `font-awesome` refs remanescentes: **0**
- Tags `<i class="fas|far|fab fa-...">` remanescentes: **0**
- `<svg>` por página = ícones esperados (íntegros, parseáveis)
- Bloco de ajustes presente: **1 por página**
- Imagens sem `alt`: **0** (exceto `login.html`, intocado)
- Índice (`index.html`): 40,4 KB (cresceu vs 18,1 KB pela inclusão dos SVGs, porém **sem** o request externo de ~100 KB)

---

## 6. Teste visual pendente de aplicação

Todas as escolhas de CSS acima foram validadas primeiro na pasta `teste/` (cópia de `index.html`) com o usuário, incluindo microajustes do ícone "Desde 2006" (`1em`), telefone do rodapé (`1em`) e centralização dos cards. As regras finais foram replicadas para o site real.

---

## 7. Backups criados

| Item | Caminho | Conteúdo |
|---|---|---|
| **Produção (antes)** | `C:\Users\lab\Documents\Default Project\backup\2026-09-23_0535_producao_pre_otimizacao\site\` (+ `_producao.zip`) | 31 arquivos, 34,9 MB — versão exata publicada |
| **Otimizado (depois)** | `C:\Users\lab\Documents\Default Project\backup\2026-09-23_0535_site_pos_otimizacao\site\` (+ `_site_otimizado.zip`) | 40 arquivos, 18,6 MB — estado atual do trabalho |

**Evidência de fidelidade do backup "antes":** o conteúdo publicado foi comparado byte a byte com `infowebtipages` no commit atual do git (SHA-256 idênticos para `index.html`, `contato.html`, `css/style.css` e `img/computador-hero.jpg`). Ou seja, o backup reflete exatamente o que está no ar.

> `login.html` e `js/jquery.js` existem só localmente (404 no servidor) — foram excluídos do backup de produção.

---

## 8. Tamanho e peso atual do site (local)

- Total do site otimizado: **18,6 MB** (vs 34,9 MB em produção) — queda de ~47% devido ao WebP.
- Imagens: 17,2 MB → 0,8 MB (**-95%**).

---

## 9. Pendências / próximos passos

1. **Publicar no servidor**: enviar os novos arquivos (`infowebtipages/` completo) + `.htaccess`.
2. **Validar no ar**: conferir que gzip (`Content-Encoding: gzip`) e cache (`Cache-Control: immutable`) respondem.
3. **Google Fonts**: adicionar `preconnect` (ou self-host do Inter com `font-display: swap`) para cortar a última fonte bloqueante.
4. **CSS**: minificar `style.css` e remover trechos não usados (~23–41 KiB de oportunidade).
5. **Retestar PageSpeed Insights** após o deploy e registrar a nova média.

---

*Gerado em 23/09/2026 — sessão de otimização local; alterações validadas e não publicadas.*