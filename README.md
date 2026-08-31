# InfoWebTI — Site Institucional

Reconstrução do site institucional da **InfoWebTI Soluções Tecnológicas**, empresa de infraestrutura de TI atuante desde 2006.

## Estrutura

```
infowebtipages/
├── index.html        # Página inicial
├── sobre.html        # Sobre a empresa (história, missão, visão e valores)
├── servicos.html     # Serviços (cloud, cibersegurança, software, redes, suporte, dados)
├── projetos.html     # Projetos realizados
├── blog.html         # Blog institucional
├── blog/             # 3 artigos (cibersegurança, data centers, migração em nuvem)
├── contato.html      # Contato (formulário, mapa, horário)
├── politica.html     # Política de privacidade
├── css/style.css     # Estilos
├── js/script.js      # Interações (menu, animações, formulário)
├── img/              # Imagens e ícones (favicon, apple-touch-icon, PWA)
├── sitemap.xml       # Sitemap para SEO
├── sitemap.html      # Sitemap visível
├── robots.txt        # Diretrizes de rastreamento
└── site.webmanifest  # Manifest do PWA
```

## Funcionalidades

- **SEO**: meta tags descritivas, viewport, `sitemap.xml`, `robots.txt`
- **PWA**: `site.webmanifest` + ícones em múltiplos tamanhos (16×16, 32×32, 192×192, 512×512) e `apple-touch-icon`
- **Design responsivo**: adaptável a desktop, tablet e mobile
- **Acessibilidade**: navegação por teclado, ARIA labels e contraste adequado

## Testes

O site foi submetido a testes automatizados e manuais — ver `apresentacao/RELATORIO_TESTES.pdf`:

- ✅ 11/11 páginas estruturalmente válidas
- ✅ SEO completo em todas as páginas
- ✅ 85 links internos válidos (0 quebrados)
- ✅ Âncoras e sitemap válidos
- ✅ Bug de JavaScript (observador de estatísticas) corrigido
- ✅ Ícones PWA gerados e referenciados corretamente

## Tecnologias

HTML5, CSS3, JavaScript (vanilla), JSON (manifest/sitemap).

---

**InfoWebTI Soluções Tecnológicas** · www.infowebti.com.br · contato@infowebti.com.br
