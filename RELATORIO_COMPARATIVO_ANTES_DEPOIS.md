# Relatório Comparativo — Antes x Depois (Otimização de Performance)

**Site:** infowebti.com.br | **Data:** 23/09/2026
**Fonte ANTES:** produção publicada (git HEAD) — validada por download FTP (SHA-256 idêntico em 17/17 arquivos)
**Fonte DEPOIS:** pasta otimizada `infowebtipages` (pronta para deploy)

> **Fora do escopo (conforme orientação):** `login.html`, `js/jquery.js` (em trabalho em outra aba), `teste/`, `jmess/`, `velha.*`.

---

## 1. Resumo executivo

| Métrica | Antes | Depois | Ganho |
|---|---|---|---|
| Peso das imagens de conteúdo | 17.156,6 KB (JPG) | 830,6 KB (WebP) | **-95%** |
| Payload que o navegador baixa (site todo, sem cache) | 17.618,1 KB | 1.422,6 KB | **-92%** (8% do original) |
| Requestes por página (Font Awesome) | +2 (~100 KB) | 0 | removidos |
| Herói / LCP (`computador-hero`) | 1.079,8 KB | 86,4 KB | **-92%** |
| Compressão gzip (Apache) | não havia | `.htaccess` (mod_deflate) | ativada |
| Cache HTTP | não havia | 1 ano (estáticos) / 1 h (HTML) | ativado |

---

## 2. Comparação arquivo por arquivo

(Site deployável, excluindo login/jquery.)

### 2.1 Arquivos com mudança de conteúdo (11)

| Arquivo | Antes | Depois | Δ |
|---|---|---|---|
| blog.html | 11,1 KB | 24,3 KB | +13,1 |
| contato.html | 13,4 KB | 27,0 KB | +13,5 |
| index.html | 18,4 KB | 40,4 KB | +22,0 |
| politica.html | 10,7 KB | 23,5 KB | +12,8 |
| projetos.html | 9,3 KB | 18,2 KB | +8,9 |
| servicos.html | 13,1 KB | 26,8 KB | +13,6 |
| sitemap.html | 12,1 KB | 32,4 KB | +20,3 |
| sobre.html | 10,9 KB | 23,4 KB | +12,5 |
| blog/artigo-ciberseguranca.html | 14,0 KB | 19,4 KB | +5,4 |
| blog/artigo-data-centers.html | 14,4 KB | 19,8 KB | +5,4 |
| blog/artigo-migracao-nuvem.html | 14,5 KB | 19,9 KB | +5,4 |

> **Git:** 456 inserções / 265 deleções. O HTML **cresceu em bytes** porque os ícones do Font Awesome passaram a SVG **inline** (self-hosted) e as imagens ganharam `<picture>`. Esse aumento é compensado em muito: **-2 requests externos de ~100 KB** e gzip sobre o HTML.

### 2.2 Arquivos novos

| Arquivo | Tamanho | Papel |
|---|---|---|
| .htaccess | 2,6 KB | gzip + cache + MIME webp (novo; produção não tinha) |
| img/computador-hero.webp | 86,4 KB | herói LCP |
| img/technology.webp | 154,6 KB | - |
| img/tecnologia.webp | 151,2 KB | - |
| img/datacenter.webp | 214,7 KB | - |
| img/analytics.webp | 73,6 KB | - |
| img/nuvem.webp | 65,5 KB | - |
| img/cloud.webp | 84,5 KB | - |

### 2.3 Sem alteração de conteúdo (14)

`css/style.css`, `js/script.js`, `robots.txt`, `sitemap.xml`, `site.webmanifest` e todas as imagens `.jpg`/`.png` (mantidas como fallback/enlaces PWA).

> Nota: alguns arquivos mostram pequena diferença de bytes por **fim de linha (CRLF)**; o `git diff` confirma conteúdo idêntico.

---

## 3. Payload efetivo (o que o navegador baixa — sem cache)

| Componente | Antes (KB) | Depois (KB) |
|---|---|---|
| HTML + xml/txt/webmanifest (12 páginas) | 142,0 | 274,9 |
| CSS | 45,7 | 43,6 |
| JS | 6,2 | 6,0 |
| Imagens de conteúdo (7) | 17.156,6 | 830,6 |
| Ícones PWA/favicons | 267,5 | 267,5 |
| Font Awesome (externo) | ≈ 100 (por página) | 0 |
| **Total efetivo** | **17.618,1** | **1.422,6** |

**Economia: 16.195,5 KB (−92%)** — o navegador moderno baixa só o WebP; os JPGs ficam apenas como fallback.

---

## 4. Mudanças por página

| Página | Ícones SVG | `<picture>` | lazy | fetchpriority | FA removido |
|---|---|---|---|---|---|
| index.html | 35 | 1 (hero) | 0 | 1 (hero) | ✓ |
| blog.html | 20 | 3 | 3 | - | ✓ |
| projetos.html | 11 | 3 | 3 | - | ✓ |
| servicos.html | 21 | 1 | 1 | - | ✓ |
| sobre.html | 19 | 0 | 0 | - | ✓ |
| contato.html | 21 | 0 | 0 | - | ✓ |
| politica.html | 18 | 0 | 0 | - | ✓ |
| sitemap.html | 36 | 0 | 0 | - | ✓ |
| blog/artigo-ciberseguranca.html | 9 | 1 | 1 | - | ✓ |
| blog/artigo-data-centers.html | 9 | 1 | 1 | - | ✓ |
| blog/artigo-migracao-nuvem.html | 9 | 1 | 1 | - | ✓ |

- **200 ícones** convertidos FA→SVG inline (51 distintos), link do `all.min.css` removido das **11 páginas publicáveis**.
- **11 imagens** em `<picture>`; herói com `fetchpriority="high"` + dimensões explícitas; 9 com `loading="lazy" decoding="async"`.
- **`defer`** em `script.js` e `vlibras-plugin.js` nas 8 páginas principais + init VLibras protegido (aguarda `DOMContentLoaded`).

---

## 5. Ganhos de serviço (`.htaccess` novo)

| Diretiva | Efeito |
|---|---|
| mod_deflate | gzip em html/css/js/json/svg |
| mod_expires | css/js/img/fontes: 1 ano; html: 1 h |
| mod_headers | `Cache-Control: public, max-age=31536000, immutable` |
| mod_mime | `image/webp` reconhecido pelo Apache |

---

## 6. Projeção de PageSpeed (estimativa)

- **LCP:** o herói ia de 1.079,8 → 86,4 KB; antes **10,5 s** → expectativa de queda forte (fonte bloqueante removida + imagem ~12× menor).
- **Render-blocking:** CSS do FA (≈100 KB) eliminado — "2.940 ms de recursos bloqueantes" deve cair.
- **Cache:** visita repetida quase zero de rede para estáticos.

> Vale refazer o PageSpeed **após deploy** para números reais.

---

*Comparação gerada em 23/09/2026 — nada foi publicado.*