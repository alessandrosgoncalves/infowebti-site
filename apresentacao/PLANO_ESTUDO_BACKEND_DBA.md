\  \\# Plano de Estudo — Back End + DBA (PHP + MySQL)

Objetivo: sistema de **login de cliente + envio de depoimento** no site InfoWebTI, usando PHP + MySQL no cPanel.
Motivação: prática real de back end e DBA + caminho CLT → CNPJ (depoimento = prova social = venda).

## 📌 Status atual

- **F0** ✓ ambiente (XAMPP 8.2.12)
- **F1** ✓ fundamentos PHP (variáveis, arrays, foreach, ==/===, $_POST)
- **F2** ✓ MySQL/modelagem (banco + tabelas + FK + UPDATE/JOIN)
- **F0.5** ✓ 3 defeitos do site antigo resolvidos (a conferir)
- **F3** ✓ PHP + MySQL + prepared statements (conexão mysqli, SELECT/JOIN, moderação aprovado, SQL Injection vista e parada) — 14/09/2026
- **Próxima:** FASE 4 — Autenticação (login)
- **Diário detalhado:** `LIVRO_DE_ESTUDOS.md` (Capítulos 0, 1, 2 e 3 escritos)

---

## Regra de ouro do curso

> **Eu sou o revisor, NÃO o autor.** Você escreve, debuga, quebra e conserta. Eu só aponto erros e conceitos.

---

## Seu ponto de partida (declarado por você: do zero)

No plano de estudos, **você se considera do zero** — e assim tratamos o curso. Não assume conhecimento prévio: cada fase se lê e se pratica como se fosse a primeira vez.

**Contexto que você trouxe (vira material de apoio, não atalho):**
- Faculdade de Ciência da Computação: C, Java, um pouco de SQL Server e PostgreSQL
- Trabalho atual: manutenção de computadores em geral
- Ponto real: essa é sua **primeira experiência web/backend** — e é aqui que o plano começa

**Como usamos isso:**
- Se alguma fase te lembrar C/Java ou SQL, ótimo — vira tração. Mas o plano **não** conta com isso: cada conceito será ensinado por completo, com exercício do zero.
- A régua é única e simples: **você escreve, executa e confere**. Se algo parecer familiar, pratique mesmo assim — familiar não é saber.

> O bom de começar do zero aqui: você não traz vícios de web. Só cuidado com o senso comum de que "PHP é fácil" — ele engana. Nós vamos pelo método, que é o que importa.

---

## FASE 0 — Ambiente (não pule!)

Nunca mais vá do zero para o servidor. **Local primeiro:**

1. Instalar **XAMPP** (Apache + PHP + MySQL + phpMyAdmin) no seu PC
2. Alvo: abrir `http://localhost/` e ver a página do XAMPP
3. Criar `C:\xampp\htdocs\infowebti\` — essa pasta será seu "site de estudos"

**Exercício:**
- Crie `ola.php` com `<?php echo "Olá, mundo"; ?>` e abra no navegador
- Quebre o PHP sem `<?php` e leia o erro — se acostume com a mensagem de erro

**Regra valiosa da vida:**
- Aprendizado de hoje, erro ontem: quando ver erro 500 no cPanel no futuro, a primeira pergunta é "que carpete vaza?" — **eu programo local, eu subo configurado.**

---

## FASE 0.5 — Primeira tarefa prática (seu site antigo)

Você tem 3 defeitos reais no site antigo (`public_html/bkpinfowebtiale-29-08-2026/`, já baixado em cópia local). Corrija-os você mesmo, à mão, usando a Fase 0 (local). **Eu não corrijo — eu só confiro quando você terminar.**

1. **CSS — `padding-top` não aceita valor negativo.**
   Em `css/style.css` (linhas ~178, 184, 207, 212) há `padding-top: -30px;` e `padding-top: -10px;`. Corrija usando `margin-top` negativo (ou remova). Dica: negative `margin` "puxa" o elemento; negative `padding` é ignorado. **resolvido**

2. **HTML — bloco `<h3>` dentro de `<p>` é inválido.**
   Em `index.html`, `sobre.html`, `servicos.html` etc. existe `<p><h3>...</h3></p>`. Como corrigir: deixar o `<h3>` **fora** do `<p>` — `</p><h3>...</h3><p>` (ou simplesmente `<h3>` solto, sem o `<p>`). **resolvido**

3. **JS — código morto.**
   Em `js/main.js` (linha 15), a linha `button.removeEventListener('click', this.onClick);` faz nada (o parâmetro é `undefined`). Remova essa linha. Depois disso, o menu hambúrguer deve continuar funcionando — teste. **resolvido**

**Entrega esperada (para eu conferir):**
- Arquivo(s) corrigido(s) com `git diff` limpo e sem quebrar nada
- O menu mobile ainda abre/fecha no navegador
- A página renderiza sem erros de validação óbvios

**Status: 3 defeitos resolvidos (a conferir na próxima revisão).**

---

## FASE 1 — Fundamentos de PHP (sem banco ainda)

Núcleo mínimo para andar com as próprias pernas:

- Variáveis, tipos, concatenação e `echo`
- Arrays (indexados e associativos) — `foreach`
- Funções — parâmetros e `return`
- Condições `if/else`, `switch`, operadores de comparação
- Formulário: `<form method="POST">` e `$_POST`, `$_GET`, `$_SERVER`
- Redirect: `header('Location: ...')`

**Exercício (dificuldade progressiva):**
1. Contador de cliques com `$_GET['qtd']`
2. Formulário que recebe nome e imprime "Bem-vindo, X"
3. Valide os campos: se vazio, redirecione com erro
4. Dois campos → **verifique se o e-mail é válido** (`filter_var`)

**Não estude:** classes/POO nesta fase. Primeiro ande, depois corra.

---

## FASE 2 — MySQL e modelagem (papel e caneta primeiro!)

Aqui entra o **DBA**. Antes de digitar `CREATE TABLE`, desenhe.

**Teoria obrigatória (50% do valor desta fase):**
- BD relacional × arquivo (por que não usar JSON?)
- Tabela, linha, coluna, chave primária (PK), chave estrangeira (FK)
- Tipos: `INT`, `VARCHAR`, `TEXT`, `DATETIME`, `BOOLEAN` (TINYINT)
- **Normalização 1ª até 3ª forma** — em palavras simples:
  - 1FN: cada célula = um único valor
  - 2FN: coluna depende da chave INTEIRA
  - 3FN: coluna depende só da chave (nada escondido)

**Modelagem do nosso problema:**

```
clientes     (id, nome, email UNIQUE, telefone, endereco, senha_hash)
depoimentos  (id, cliente_id FK, texto, aprovado (0/1), criado_em)
```

*(Schema real já criado no phpMyAdmin em 09/09/2026 — veja LIVRO_DE_ESTUDOS.md, Capítulo 2.)*

- Um cliente pode ter **vários** depoimentos? Decide você (1:N ou N:N? justifique)
- Precisamos de tabela `admin`? Ou admin é um `cliente` com flag?

**Exercício:**
- Crie o BD `infowebti_db` no phpMyAdmin
- Crie as 2 tabelas SEM FK primeiro, depois **com FK** — veja a diferença
- Faça insert/select/update/delete **pelo phpMyAdmin** (perca o medo de SQL)

**Exercício de normalização (10 min, na prática):**
*Você já aplicou 3FN instintivamente ao modelar; agora demos o nome. Responda no phpMyAdmin, verificando com INSERT/SELECT de verdade:*

1. **1FN** — Suponha `clientes` com `telefones` preenchido assim: `(12) 98245-4379,(12) 3641-0000` (dois números numa célula). Isso viola a 1ª forma? Como corrigir? *(cada célula = um único valor → vira tabela `telefones` com `cliente_id`)*
2. **2FN** — Em `depoimentos(id, texto, cliente_nome)`, o `cliente_nome` precisaria existir ali? *(não — redundante, já vem de `clientes`; coluna não-chave depende da chave INTEIRA → viola)*
3. **3FN** — Se `depoimentos` tivesse `cliente_cidade`, isso guardaria o que? *(cidade pertence ao cliente, não à chave do depoimento → viola a 3ª)*

**Regra que resume as 3:**
- **1FN** célula com 1 valor só
- **2FN** coluna depende da chave INTEIRA
- **3FN** coluna depende só da chave, nada de verbos escondidos

---

## FASE 3 — Ligando PHP ao MySQL (a parte que mais dá pesadelo) — ✓ CONCLUÍDA (14/09/2026)

Triagem de três formas de conectar:
1. `mysqli` procedural → simples mas verboso
2. `mysqli` OO → **recomendado** (usamos este)
3. `PDO` → mais moderno, recomendado para futuro (Laravel usa)

**NORMA INEGOCIÁVEL: PREPARED STATEMENTS.**
- NUNCA monte query com string concat: `"SELECT * FROM x WHERE email='$email'"` = **SQL Injection**
- Sempre: `$stmt = $conn->prepare(...); $stmt->bind_param(...)`

**Exercício** (feito em 14/09/2026, detalhes no LIVRO Capítulo 3):
1. Página que lista depoimentos do banco num loop → `listar.php` funcionando
2. Formulário/busca com `?` e `bind_param` → `buscar.php` filtrou correto
3. Injeção manual testada: sem `?` (concat) **vazou tudo**; com `?` (prepare) **segurou nada** — e o arquivo vulnerável foi apagado

---

## FASE 4 — Autenticação (o "login")

Quatro blocos:

1. **Cadastro**: `password_hash($senha, PASSWORD_DEFAULT)` — NUNCA senha em texto puro
2. **Login**: `password_verify()` + `session_start()` + `$_SESSION['cliente_id']`
3. **Logout**: `session_destroy()` + `session_unset()`
4. **Proteção de página**: no topo de toda tela restrita, `if (!isset($_SESSION['cliente_id'])) { header('Location: login.php'); exit; }`

**Exercício:**
- Cadastro → login → tela "Área do Cliente" → logout
- Teste: dois usuários, cada um vê SÓ os próprios dados (dica: `WHERE cliente_id = ?`)

---

## FASE 5 — O depoimento com fluxo de aprovação

Regra de negócio (igual ao mundo real): **cliente envia → admin aprova → público vê**.

- `depoimentos.aprovado`: 0 = pendente, 1 = aprovado
- Tela pública SÓ mostra `WHERE aprovado = 1`
- Tela admin (você) lista pendentes e tem botão aprovar/reprovar
- Após aprovar: `UPDATE depoimentos SET aprovado = 1 WHERE id = ?`

**Já provado na F3 (não repetir):** inserir com `aprovado=0` e ver a página pública NÃO mudar → `UPDATE ... SET aprovado = 1` → aparecer (e com data, ordenado por `criado_em DESC`). LIVRO Capítulo 3, seções 3.5-3.6.

**Falta para a F5:** montar a **tela do admin** (lista de pendentes com botão aprovar/reprovar) sobre a base que já existe, e o **formulário público** de inserção (F3 fez via SQL/CLI; aqui o depoimento virá do HTML com `$_POST` e `prepare`).

---

## FASE 6 — Segurança (esta fase vale o seu CNPJ)

Checklist final obrigatório:
- [ ] Prepared statements em **toda** query (sem exceções)
- [ ] `htmlspecialchars()` em **toda** saída (`<?= htmlspecialchars($nome) ?>`) — contra XSS
- [ ] `password_hash` no cadastro, `password_verify` no login
- [ ] Limite de tentativas de login (ex.: 5 → bloqueia 15 min) — contra força bruta
- [ ] CSRF token no formulário — contra falsificação
- [ ] Nunca exibir erro interno ao público (mostrar apenas "Algo deu errado" e log detalhado em arquivo)

---

## FASE 7 — DBA de verdade (sua assinatura "DBA")

Aprofunde o que a FASE 2 introduziu:

1. **Índices**: criar `INDEX` em `depoimentos(cliente_id)` e `depoimentos(aprovado)`.
   Compare com `EXPLAIN SELECT ...` ANTES e DEPOIS — veja `rows` cair.
2. **EXPLAIN**: aprenda a ler `type`, `key`, `rows`, `Extra`
3. **Transactions**: `BEGIN` / `COMMIT` / `ROLLBACK` — ex.: cadastrar cliente + primeiro depoimento é atômico
4. **Backup**: `mysqldump` + **restauração** (treine restaurar, não só exportar!)
5. **Segurança de BD**: usuário MySQL próprio do app com menor privilégio (`SELECT, INSERT, UPDATE, DELETE` — sem `DROP`)

---

## FASE 8 — Integração com o site + deploy no cPanel

Depois de dominar local, sobe:

1. **Exportar BD** do phpMyAdmin local → importar no cPanel (phpMyAdmin do host)
2. `secrets.php` fora de `public_html` (ou acima de `public_html`) com credenciais do BD
3. Ajustar `mysqli` para `localhost` (nome certinho do host, quase sempre é `localhost`)
4. A página pública de depoimentos: trocar os cards estáticos atuais por um `depoimentos.php` que lê do banco (`aprovado=1`)
5. Testar em produção: cadastro → login → envio → aprovação → aparece no site

**IMPORTANTE (lição da nossa sessão):** nunca edite/duplique arquivos com PowerShell no servidor sem conferir encoding — já vimos mojibake acontecer. Edite no phpMyAdmin, use FileZilla/WinSCP, e sempre valide antes.

---

## FASE 9 — Refinamentos (para o "diferencial")

- Paginação nos depoimentos (`LIMIT 10 OFFSET n`)
- Foto do cliente (upload) — **cuidado**: upload de imagem = risco de malware; valide extensão/MIME/tamanho
- "Média de satisfação" ou contador (`COUNT(*)`, `AVG(aprovado=1)`)
- Enviar e-mail ao admin quando chegar depoimento (`mail()` ou PHPMailer)
- Comparar com o seu site antigo (backup no host): como você resolvia X antes, e como resolvia agora? **documente a evolução**

---

## Linha da prática (resumo executável)

1. XAMPP + `ola.php` → **DOMINADO** (09/09/2026)
2. Arrays + formulários POST → **DOMINADO** (09/09/2026)
3. modelar no papel + 3FN → **DOMINADO** (09/09/2026)
4. `mysqli` + prepared statement (INSERT/SELECT) → **DOMINADO** (14/09/2026)
5. login com hash + sessão → a fazer (Fase 4)
6. aprovação (UPDATE) → a fazer (Fase 5)
7. segurança (XSS/senha/CSRF) → a fazer (Fase 6)
8. backup/restore + EXPLAIN + índices → a fazer (Fase 7)
9. deploy cPanel + integração → a fazer (Fase 8)

Ao final você terá o **depoimento de verdade no site** + **back end real** + **fundamento de DBA** — tudo feito com suas mãos.

---

## O que NÃO fazer (antirrecetário)

- ❌ Concat de variável em SQL (injeção)
- ❌ Senha em texto puro no banco
- ❌ Codar direto no servidor sem teste local
- ❌ Mostrar `mysqli_error()` ao visitante
- ❌ Dar `root`/`ALL PRIVILEGES` ao app
- ❌ Ignorar a mensagem de erro — ela é sua professora

---

## Referência: site antigo no host

Existe uma pasta de backup de um site antigo escrito por você: **`public_html/bkpinfowebtiale-29-08-2026/`** (confirmado no host). Uso planejado: **material de estudo/contraste** na Fase 9. Não será modificado nem movido — só lido quando você pedir.