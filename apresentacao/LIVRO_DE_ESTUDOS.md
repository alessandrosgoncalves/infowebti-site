# LIVRO DE ESTUDOS — Back End + DBA (PHP + MySQL)

> Diário de aprendizado do Alessandro. Cada fase vira um capítulo novo neste documento.
> Live de progresso: registrar data, o que foi feito, o que deu erro e a lição aprendida.
> Regra do curso: **eu escrevo, executo e confiro. O revisor (opencode) só corrige.**

---

## CAPÍTULO 0 — Ambiente (Fase 0)

**Data:** 09/09/2026

### O que foi feito
- XAMPP 8.2.12 instalado (já existia no PC)
- Apache e MySQL iniciados no XAMPP Control Panel
- Teste: `http://localhost/` abriu a página padrão do XAMPP

### Pasta de estudos
`C:\xampp\htdocs\infowebti\`

### Exercícios
- `ola.php` → `<?php echo "Olá, mundo!"; ?>`
- Abertura direta: `http://localhost/infowebti/ola.php` = "Olá, mundo!"

### Erro provocado de propósito (lição)
Removendo `<?php` da abertura, o arquivo mostra o **texto cru** (`echo "Olá, mundo"; ?>`).

**Lição:** tudo que está fora de `<?php ... ?>` é OUTPUT direto (HTML/texto). O interpretador PHP só processa dentro da tag.

---

## CAPÍTULO 1 — Fundamentos de PHP (Fase 1)

**Data:** 09/09/2026

### 1.1 Variável e interpolação
```php
<?php
$nome = "Alessandro";
echo "Bem-vindo, $nome!";   // Bem-vindo, Alessandro!
?>
```

**Aspas duplas** (`"..."`) interpolam a variável dentro da string.

### 1.2 Aspas simples = literal (a lição da semântica)
```php
echo 'Bem-vindo, $nome!';   // Bem-vindo, $nome!  (não substitui!)
```
Com aspas simples o PHP **não** interpola. Para juntar, usa concatenação com `.`:

```php
echo 'Bem-vindo, ' . $nome . '!'; // Bem-vindo, Alessandro!
```
**Dica de ouro:** Aspas simples, o echo imprime tudo em texto (precisa concatenar com .), aspas duplas o echo imprime texto mais a variavel (concatena).

**Regra:** aspas duplas interpolam; aspas simples são textos puros.

### 1.3 Arrays e foreach
```php
<?php
$clientes = ["Maria", "João", "Carlos"];
foreach ($clientes as $cliente) {
    echo $cliente . "<br>";
}
?>
```
Saída: Maria / João / Carlos (um por linha).

### 1.4 Array indexado × associativo (o insight do índice 0)
- `["Maria", "João", "Carlos"]` → PHP auto-indexa: `0, 1, 2`
- `["Maria" => 1, "João" => 2]` → chave definida por mim (string)

```php
foreach ($clientes as $chave => $valor) {
    echo "$chave = $valor<br>";   // "Maria = 1" etc. (sem 0 na frente)
}
```

### 1.5 Comparação `==` vs `===` (a diferença que não dá erro)
- `==` compara **valor** (converte tipos): `"1" == 1` → true
- `===` compara **valor E tipo**: `"1" === 1` → **false** (sem erro! vira else)

```php
<?php
$valor = "1";
if ($valor === 1) {
    echo "estrito? sim";
} else {
    echo "estrito? nao";   // <- foi o que apareceu
}
?>
```

**Lição que vale pro projeto:** comparar tipos diferentes não quebra o PHP — devolve `false`. Tipos diferentes ≠ erro.

### 1.6 Formulários e `$_POST` (o coração do depoimento)
```php
<?php
if ($_POST) {
    $nome  = $_POST['nome'];
    $texto = $_POST['texto'];
    echo "Recebido de $nome: $texto<br>";
}
?>
<form method="POST">
    Nome: <input type="text" name="nome"><br>
    Depoimento: <textarea name="texto"></textarea><br>
    <button type="submit">Enviar</button>
</form>
```

**GET × POST:**
- Abrir URL direto = **GET** → `$_POST` vazio → `if` falso → só mostra o form
- Clicar Enviar = **POST** → `$_POST` cheio → processa

**`if ($_POST)`** verifica se houve envio. O `name` do HTML vira a chave do PHP: `name="texto"` → `$_POST['texto']`.

**Alerta de ouro:** acessar `$_POST['texto']` sem o `if` e com GET → "Undefined array key" (warning). Por isso o `if` vem primeiro.

---

## CAPÍTULO 2 — MySQL e modelagem (Fase 2)

**Data:** 09/09/2026

### 2.1 Definição do problema
Cliente loga, deixa depoimento, admin aprova, público vê.

### 2.2 Modelagem (erros meus corrigidos)
- ~~repetir `nome` na depoimentos~~ → erro de duplicidade. Guarda só `cliente_id`.
- ~~tabela de relacionamento~~ → só existe para N:N. Aqui é 1:N (um cliente → vários depoimentos), então a FK fica DENTRO de depoimentos.

**Regra de ouro:** tabela guarda o que é dela; o resto, se relaciona pela chave.

### 2.3 Criação do banco e tabelas
```sql
CREATE DATABASE infowebti_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```sql
CREATE TABLE clientes (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefone VARCHAR(20) NULL,
  endereco VARCHAR(255) NULL,
  senha_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
```

```sql
CREATE TABLE depoimentos (
  id INT NOT NULL AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  texto TEXT NOT NULL,
  aprovado TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
) ENGINE=InnoDB;
```

### 2.4 Chave estrangeira na prática (os dois erros vistos)
**Inserir filho sem pai:** `INSERT` com `cliente_id = 999` → `#1452` (Cannot add or update a child row).

**Apagar pai com filho:** `DELETE FROM clientes WHERE id = 1` → `#1451` (Cannot delete or update a parent row).

**Ordem correta para apagar:** primeiro o filho, depois o pai.
```sql
DELETE FROM depoimentos WHERE id = 2;
DELETE FROM clientes WHERE id = 1;
```

### 2.5 Aprovação (UPDATE)
```sql
UPDATE depoimentos SET aprovado = 1 WHERE id = 2;
```
`WHERE ... = 1` é o que faz o depoimento aparecer no SELECT do site.

### 2.6 JOIN (reconstruindo o vínculo na leitura)
```sql
SELECT clientes.nome, depoimentos.texto, depoimentos.criado_em
FROM depoimentos
JOIN clientes ON clientes.id = depoimentos.cliente_id
WHERE depoimentos.aprovado = 1
ORDER BY depoimentos.criado_em DESC;
```

**Casar errado** (`clientes.id = depoimentos.id`) = vazio, porque `depoimentos.id` é número de série do próprio depoimento, não do dono.

**Regra:** `JOIN ... ON tabela_pai.chave = tabela_filho.referencia`.

### 2.7 Menor privilégio (pensamento de DBA)
- App usa usuário próprio (`infowebti_app`), NUNCA `root`
- Privilégios globais: só `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Sem `DROP/CREATE/ALTER`: se houver brecha no app, o invasor mexe em dados mas não destrói a estrutura

**Por que não dar root:** com root, a mesma brecha apagaria bancos, tabelas e usuários.

---

## CAPÍTULO 3 — PHP + MySQL + prepared statements (Fase 3)

**Data:** 14/09/2026

### 3.1 Usuário do banco (menor privilégio, o grito 1142)
- Criado `infowebti_app`@`localhost` com **só** `SELECT, INSERT, UPDATE, DELETE` (sem `CREATE/DROP/ALTER`)
- Privilégios concedidos em `*.*` — seguro (só 4 comandos), mas refinável para `infowebti_db.*` depois

**Teste do erro negado (via CLI):**
```sql
CREATE TABLE teste_f3 (id INT);
-- ERROR 1142 (42000): CREATE command denied to user 'infowebti_app'@'localhost'
```
- `SHOW TABLES` confirmou: `teste_f3` **não** foi criada → o filtro funcionou
- **Lição 1:** usário sem privilégio não cria/derruba/alterara estruturas — se o app for invadido, o estrago fica nos dados
- **Lição 2:** CLI não mente (o phpMyAdmin com acesso livre esconderia a negativa)
- **Lição 3:** erro 1046 apareceu antes do 1142 — falta de `USE banco` → MySQL resolve um erro por vez

### 3.2 Conexão PHP (`mysqli` OO)
```php
<?php
$servidor = 'localhost';
$usuario  = 'infowebti_app';
$senha    = 'SUA_SENHA';
$banco    = 'infowebti_db';

$conn = new mysqli($servidor, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die('Falha na conexão: ' . $conn->connect_error);
}
```
- `new mysqli(servidor, usuario, senha, banco)` = "liga o telefone"
- `connect_error` = bilhete de aviso do objeto quando falha
- `die(...)` = botão de emergência: morre o script ali, o que vem depois nem roda
- **`require 'conectar.php'`** = "cola o arquivo aqui" → um único ponto de credenciais, reutilizado em todas as páginas (centralizar, não repetir)
- **Lição:** o `echo 'Conectado com sucesso'` foi removido — conexão em produção é **silenciosa** (o cliente não vê "logado com sucesso")

### 3.3 AUTO_INCREMENT: a memória que nunca recua
- Banco tinha sido zerado na F2 (Maria apagada, id 1 consumido)
- Previ "José vai ser id 1" — **errei com glória**: José virou **id=2**
- `INSERT` que falha (o #1452) **também queima id** (vimos ids 1, 2, 3 desperdiçados; a linha boa virou id=4)
- INSERT seguinte (penção pendente) virou **id=5**, porque o maior era 4

**Regra de ouro:** `AUTO_INCREMENT` = **maior id que já existiu + 1**. Apagar linha não devolve id. Nunca chute o próximo id — pergunte (SELECT) ou deixe o banco cuidar.

### 3.4 Inserção e leitura (ciclo completo)
```sql
INSERT INTO clientes (nome, email, senha_hash) VALUES ('José Silva', 'jose@teste.com', 'aaa');
INSERT INTO depoimentos (cliente_id, texto, aprovado) VALUES (2, 'Atendimento excelente, recomendo!', 1);
```
- 1º INSERT: `senha_hash` é NOT NULL → placeholder `'aaa'` (hash de verdade é da Fase 4)
- 2º INSERT com `cliente_id=2`: **obrigatório** — o banco não adivinha dono; quem decide o id é o PHP (ou você), o banco só verifica a FK
- `cliente_id=1` → **#1452** (não existe cliente 1 — foi a Maria)

**Leitura com JOIN (o `listar.php`):**
```php
$sql = "SELECT clientes.nome, depoimentos.texto, depoimentos.criado_em
        FROM depoimentos
        JOIN clientes ON clientes.id = depoimentos.cliente_id
        WHERE depoimentos.aprovado = 1
        ORDER BY depoimentos.criado_em DESC";

$stmt = $conn->prepare($sql);
$stmt->execute();
$resultado = $stmt->get_result();

while ($linha = $resultado->fetch_assoc()) {
    echo $linha['nome'] . ' — ' . $linha['texto'] . ' (' . $linha['criado_em'] . ")<br>\n";
}
```
- **Ordem:** `prepare` (banco compila a SQL) → `execute` (o banco ROda) → `get_result` (o PHP recebe a tabela)
- `fetch_assoc()` = puxa **uma linha por vez** como array associativo; `null` quando acaba → `while` para
- **JOIN:** nome mora em `clientes`, depoimento em `depoimentos`; o `cliente_id=2` é o endereço que o MySQL usa pra achar o nome. `SELECT * FROM depoimentos` NÃO mostra nome — ele não mora ali

### 3.5 Moderação: aprovado = 0 (escondido no site)
- Inserido `'Segundo teste pendente'` com `aprovado = 0`
- `listar.php` mostrou **só o aprovado** → o pendente **existe no banco mas não vaza pro site**
- `UPDATE depoimentos SET aprovado = 1 WHERE id = 5;` → passou a aparecer (e por cima, por ser o mais recente)

**Regra de negócio provada:** cliente envia → `aprovado=0` (invisível) → admin aprova → `aprovado=1` → público vê.

### 3.6 `criado_em` é carimbo fixo
- Valor gravado **uma vez**, no INSERT (`DEFAULT CURRENT_TIMESTAMP`)
- A página não recalcula "agora" — lê o número gravado no passado. Recarregar mil vezes não muda o horário

### 3.7 Busca com prepared statement (o `buscar.php`)
```php
$q = isset($_GET['q']) ? $_GET['q'] : '';

$sql = "SELECT clientes.nome, depoimentos.texto, depoimentos.criado_em
        FROM depoimentos
        JOIN clientes ON clientes.id = depoimentos.cliente_id
        WHERE depoimentos.aprovado = 1
        AND depoimentos.texto LIKE ?
        ORDER BY depoimentos.criado_em DESC";

$stmt = $conn->prepare($sql);

$termo = '%' . $q . '%';
$stmt->bind_param('s', $termo);

$stmt->execute();
$resultado = $stmt->get_result();
```
- `bind_param('s', $v)` — `s` = string (existem `i`=int, `d`=double, `b`=blob): avisa o MySQL o tipo que entra no `?`
- Testado: `?q=excelente`, `?q=Atendimento`, `?q=xyz` → filtro correto (inclui só quem casa)
- `$_GET['q']` nasce como **dado** — quem decide se vira comando é o código PHP

### 3.8 SQL Injection: a teoria virou espetáculo (o ápice da F3)
**Url do ataque no arquivo vulnerável:**
```
buscar_vulneravel.php?q=x' OR 1=1 --
```
(codificado: `?q=x%27%20OR%201%3D1%20--%20`)

**Como o golpe funciona:**
- `'` quebra a string `'%x'` do LIKE
- `OR 1=1` = condição sempre verdadeira → o filtro morre
- `-- ` (com espaço!) comenta o resto da linha → o `%'` final é engolido

**O que vimos:**
- `buscar.php` (com `?`): `?q=x' OR 1=1 --` → **nada** (o `?` tratou como string literal; "x' OR 1=1 --" não existe em depoimento nenhum)
- `buscar_vulneravel.php` (concatenação `.`): mesma URL → **os 2 depoimentos** vazaram (filtro anulado)

**As falhas de payload (lição de atacante):**
- `x' OR '1'='1` → nada: `'1'='1%'` é falso (o `%` a mais) — payload desbalanceado
- `x' OR 1=1 --` sem espaço final → `Fatal error` de sintaxe (`-- %` não é comentário sem espaço)
- **Atacante ajusta até a aspa fechar** — nunca chuta uma vez só

**Regra de ouro gravada:**
> **NUNCA concatene valor em SQL.** `$q` é dado, `?` é a moldura, `prepare` é a garantia de que dado nunca vira comando.

**Destruição final:** `buscar_vulneravel.php` foi **apagado** (arma vulnerável não fica em casa) → URL devolve **404**.

### 3.9 Conclusão da F3
Fluxo completo dominado: `conectar.php` (usuário limitado) → `SELECT` + `JOIN` + `WHERE` + `ORDER BY` → `prepare`/`bind_param`/`execute`/`get_result` → moderação `aprovado` comprovada → injeção vista (vulnerável vaza) e parada (prepare segura). Regras: menor privilégio, sem concat em SQL, dados no jogo eu escrevo e o revisor corrige.

### 3.10 Fechando o cofre: senha no root + phpMyAdmin com login (14/09/2026)
- Descobrimento: o XAMPP vinha com `auth_type='config'`, user `root`, password vazio, `AllowNoPassword=true` → **qualquer um abrindo o phpMyAdmin era root direto**, o oposto do menor privilégio estudado na F3
- **root tem 3 identidades** em `mysql.user`: `localhost`, `127.0.0.1`, `::1` — cada **par (usuário, host)** é autenticado separado. O teste `mysql -h 127.0.0.1` provou: **todas fechadas** (1045 fora da senha)
- Aplicado `ALTER USER 'root'@'localhost'/'127.0.0.1'/'::1' IDENTIFIED BY 'senha'`
- phpMyAdmin trocado para `auth_type='cookie'` em `config.inc.php` → **tela de login**
- Entraram: `root` (poder total) e `infowebti_app` (só dados) — cada um com **sua** senha
- **Lição de arquitetura:** `cookie` = o navegador guarda sua sessão; `new mysqli(usuario, senha)` = o PHP autentica **direto no MySQL**, sem navegador. Por isso o site (`conectar.php`) não quebrou com a troca pro cookie — ele nem participa da tela de login
- **Frase-mãe:** *Navegador autentica por SESSÃO (cookie). Programa/conexão autentica por CREDENCIAL (senha no código).*

### 3.11 A porta que ficou aberta: `::1` sem senha (14/09/2026)
- Ao revisar o painel, achei `root@::1` com **`Não` em senha** → brecha que eu tinha dito "fechada" baseado só no teste de `127.0.0.1` (errei ao generalizar; só afirmo o que vi)
- `::1` = o `localhost` em **IPv6** — mesma porta da frente, outro protocolo. Conexões por IPv6 entrariam como root livre
- **Por que não travou antes:** o `ALTER USER` tranca a porta **que recebeu ordem** — `::1` nunca foi endereçada no comando anterior
- Confirmado com `SELECT password FROM mysql.user` → `::1` vazio → `ALTER USER 'root'@'::1' IDENTIFIED BY ...` → **PROTEGIDO**
- **Hábito que nasceu:** conferir **todas** as portas com um SELECT antes de encerrar o dia — fechar uma não fecha as outras
- **Lição de camadas:** `ALTER USER` mexe na **conta global** (não precisa de `USE`); `INSERT` mexe **dentro de um banco** (precisa do `USE` para apontar a gaveta)

### 3.12 O anônimo `''@'%'` (14/09/2026)
- No painel apareceu a linha **`Qualquer` @ `%`** = usuário **anônimo** (`''@'%'`): host `%` = aceita conexão de **qualquer origem**, sem senha, privilégio `USAGE` (só conecta, sem poderes)
- **Risco:** porta de entrada sem chave — conecta sem credencial (em rede aberta, alvo de marteladas)
- **Armadilha do teste no Windows:** `mysql` **sem `-u` envia o usuário do sistema** (`lab`), não o vazio → o `Access denied` do teste mostrou a conta `lab`, **não** o anônimo. Lição: teste bem desenhado, senão prova a coisa errada
- phpMyAdmin recusou usuário em branco, mas a prova final veio do banco: `DROP USER ''@'%';` → `Query OK` → `SELECT ... WHERE user = ''` → **Empty set**
- **Depois do DROP:** conexão sem usuário não casa conta nenhuma → `Access denied` (ninguém entra sem credencial)
- **`pma`** @`localhost` (usuário de controle do próprio phpMyAdmin) ficou intacto — removê-lo quebraria painel, sem ganho

---

## CAPÍTULO 4 — Frases de guarda (Dev + DBA)

> Coleção viva das frases que resumem uma lição. Cada fase alimenta esta seção.
> Toda vez que aparecer uma frase que condensa aprendizado, ela entra aqui.

### Fase 0 (ambiente)
- "Aprendizado de hoje, erro ontem."
- "Erro 500? Primeira pergunta: o que o meu código está fazendo de diferente do que eu testei local?"
- "Tudo fora de `<?php ... ?>` é output direto: sem a tag, o PHP vira texto cru e desnuda teu `echo`."
- "Quebre o código de propósito e leia o erro — a mensagem te ensina mais que mil tutoriais."

### Fase 1 (fundamentos PHP)
- "Aspas duplas interpolam; aspas simples são texto puro."
- "Comparar tipos diferentes não quebra o PHP — devolve false. Erro de tipo não é erro de sintaxe."
- "Abrir URL direto é GET; clicar Enviar é POST — o `if ($_POST)` vem ANTES do acesso, senão 'Undefined array key'."
- "O `name` do HTML vira a chave do PHP: `name="texto"` → `$_POST['texto']`."

### Fase 2 (MySQL e modelagem)
- "Tabela guarda o que é dela; o resto se relaciona pela chave."
- "FK inversa: apagar pai com filho = erro; apagar filho depois pai = funciona."
- "JOIN: ON chave_do_pai = referencia_do_filho. Sem os dois lados, o MySQL chora."
- "Casar chave errada = resultado vazio, sem erro — o MySQL não te avisa, teu teste tem que pegar."
- "Menor privilégio: app usa usuário próprio, nunca root."
- "Se o app for invadido, o menor privilégio limita o estrago aos dados, não à estrutura."
- "Modelagem: repetir `nome` em duas tabelas = duplicidade. O resto vem pela chave."

### Fase 3 (PHP + MySQL + prepared statements)
- "Usuário sem privilégio não cria tabela: 1142. O MySQL te corrige sem piedade."
- "CLI não mente; o phpMyAdmin com acesso livre esconde o erro."
- "MySQL resolve um erro por vez — primeiro o USE, depois o privilégio."
- "Conexão em produção é silenciosa: o cliente não vê 'Conectado com sucesso'."
- "Centralize, não repita: um `conectar.php`, todas as páginas usam o mesmo."
- "AUTO_INCREMENT é memória que nunca recua: maior id já criado + 1. Apagar linha não devolve id."
- "Nunca chute o próximo id — pergunte (SELECT) ou deixe o banco resolver."
- "INSERT que falha também queima id — até o erro desperdiça."
- "O nome mora na outra tabela; o JOIN é a ponte. Sem JOIN, o número não é nome."
- "`criado_em` é carimbo do passado, não relógio ao vivo."
- "Moderação: existe no banco, invisível na página (até aprovar)."
- "Prepare nasce primeiro, antes de qualquer valor. A moldura vem antes do dado."
- "Dado é dado; `?` é a moldura; `prepare` é a garantia de que dado nunca vira comando."
- "NUNCA concatene valor em SQL."
- "Atacante não chuta uma vez — ajusta até a aspa fechar."
- "Sem espaço depois do `--`, não é comentário: sintaxe quebra."
- "Armas vulneráveis não ficam em casa: `buscar_vulneravel.php` virou 404."
- "`config` = segredo no arquivo (chave pendurada na porta); `cookie` = segredo digitado por você a cada sessão."
- "Navegador autentica por SESSÃO (cookie); programa/conexão autentica por CREDENCIAL (senha no código)."
- "Root tem 3 portas (localhost, 127.0.0.1, ::1) — fecha as 3, ou uma fica aberta sem você saber."
- "Fechar uma porta não fecha as outras; conferir todas antes de encerrar."
- "`ALTER USER` mexe na conta global (sem `USE`); `INSERT` mexe dentro do banco (precisa de `USE`)."
- "No Windows, `mysql` sem `-u` envia o usuário do sistema — teste mal desenhado prova a coisa errada."
- "Conta anônima (`''@'%'`) é porta sem chave: qualquer origem conecta sem credencial. `DROP USER ''@'%';`"
- "Painel pode mentir (erro #1046 no comando que passou); o CLI mostra a verdade."

### Fase 4 (autenticação — hash, sessão e login)
- "Hash não é criptografia: tritura em pó e não devolve — verifica, não recupera."
- "O sal mora dentro do hash: `$2y$10$` guarda custo + sal + resultado — por isso dá para verificar sem guardar a senha."
- "`password_verify` não guarda nada (sem buffer): relê o sal de dentro do hash, retritura o digitado e compara pó com pó."
- "O que grava no banco é o hash pronto — senha crua nunca entra na tabela."
- "`type="password"` esconde a digitação na tela (privacidade), mas NÃO criptografa o caminho — isso é papel do HTTPS."
- "`$_POST` vazio ainda é POST: o `REQUEST_METHOD === 'POST'` confirma o verbo; os `empty()` conferem a carga."
- "O método confirma o veículo; a validação confere a carga."
- "Sem o `else`, o `$erro` não bloqueia nada: o INSERT rodaria mesmo com campo vazio. Erro informa; o `else` impede."
- "Checagem de duplicado é sua, no PHP: SELECT antes do INSERT. O banco é o último guardião, nunca o único."
- "Porta tripla do formulário: form → validação → banco."
- "Erro cru do banco (Duplicate entry) é o último véu te salvando; a mensagem amigável é você salvando antes."
- "Mensagem genérica: 'E-mail ou senha incorretos' nos dois casos — não entrega mapa ao atacante (anti-enumeração)."
- "`session_start()` antes de qualquer saída: o cookie vai no header, e header só existe antes do corpo (senão: headers already sent)."
- "Sessão guarda a PK (`cliente_id`), não o e-mail — identidade que nunca muda."
- "Texto puro no banco é passivo: um dia a verificação falha e você apaga o dado (o José `'aaa'`)."
- "Comentário não é código: plano com números no lugar do código = parse error na linha 5."
- "Apagar pai com filho = FK grita #1451; filho morre primeiro, o pai depois."
- "Segredo dentro da raiz web vaza: o Apache serviu o `.env` (200). Block com `.htaccess` = 403. Em produção, segredo mora FORA do `public_html`."
- "Quem nunca entrou não tem o que destruir: a porteira manda sem sessão para o LOGIN, não para o logout."
- "Isolamento por dono: `WHERE cliente_id = ?` + `$_SESSION['cliente_id']` — cada usuário vê só o que é dele."
- "`bind_param('i')` no INT: o tipo do `?` importa — id é número, não string."
- "A coluna é `cliente_id`; 'FK' é o papel (a constraint). MySQL filtra pelo NOME da coluna."

### Regra de ouro do curso (vale para todas as fases)
- "Eu escrevo, executo e confiro. O revisor só corrige."
- "Passo aberto, nunca oculto: eu afirmo o que a tela mostrou, mostrando a tela."
- "A mensagem de erro é sua professora — leia até o fim, ela diz exatamente o que bloqueou."
- "Se não sei, declaro não saber. Honestidade vale mais que qualquer código."

---

## CAPÍTULO 5 — Autenticação: hash, sessão e login (Fase 4)

**Data:** 27/09/2026

> Fase ainda em andamento: cadastro e login 100% provados; faltam o logout e a página protegida (portaria).

### 5.1 Teoria: hash, sal e o proveito de verificar sem guardar
- **Hash ≠ criptografia:** tritura a senha em pó **irreversível**. Criptografia devolve o original; hash só **verifica** (compara o pó), nunca recupera
- **Sal = pitada aleatória** por usuário: mesma senha → hashes **diferentes** (mata o padrão/aproveitamento de hashes)
- **O sal mora dentro do próprio hash:** `$2y$10$` + custo + sal + resultado. Não existe arquivo separado de sais
- **`password_verify($senha, $hash)`:** lê o sal de dentro do hash, retritura o digitado na hora e **compara pó com pó** — sem armazenar nada (correção: removeu a palavra "buffer")
- **No banco vai o hash pronto**, coluna `senha_hash`: `password_hash($senha, PASSWORD_DEFAULT)`

### 5.2 O `cadastro.php` — a porta tripla na prática
1. **Parse error linha 5** — o plano foi escrito como código: `1. $nome = ...` não é PHP válido (o número no meio = sintaxe quebrada). Comentário real é `//`
2. **Sem `else` = bug:** o `$erro` **informa** mas não **bloqueia** — sem o `else`, o hash+INSERT rodava mesmo com campo vazio. O `else` **impede** o fluxo
3. **Checagem de duplicado no PHP:** `SELECT id FROM clientes WHERE email = ?` preparado → `num_rows > 0` → `$erro`. Teste provou: e-mail repetido agora mostra **"Este e-mail já está cadastrado"** (antes: `Duplicate entry ... for key 'email'` cru no execute)
4. **Cascata aninhada** (estrutura nova dominada):
```
if (vazio) erro
else → SELECT email
   → num_rows>0: erro "já cadastrado"
   → senão: hash → INSERT → redirect
```

### 5.3 O banco que ficou limpo
- `DELETE FROM depoimentos WHERE cliente_id = 2;` então `DELETE FROM clientes WHERE id = 2;` — **filho→pai** (FK, F2 revisitada)
- Sobraram só os ids 3, 6, 7 com `$2y$10$...` — **zero texto puro**. O José (`'aaa'`) era passivo: sem hash, login nunca funcionaria

### 5.4 O `login.php` — os dois casos provados
```php
// fluxo central
$stmt = $conn->prepare("SELECT id, nome, senha_hash FROM clientes WHERE email = ?");
$stmt->bind_param('s', $email);
// ...
if ($result->num_rows === 0) {
    $erro = 'E-mail ou senha incorretos';          // anti-enumeração
} else {
    if (password_verify($senha, $row['senha_hash'])) {
        $_SESSION['cliente_id'] = $row['id'];
        $_SESSION['cliente_nome'] = $row['nome'];
        header('Location: listar.php');
        exit;
    } else {
        $erro = 'E-mail ou senha incorretos';      // MESMA frase
    }
}
```
- **`session_start()` no topo**, antes de qualquer HTML: o cookie vai no header, e header só existe antes do corpo (senão `headers already sent`)
- **Mensagem genérica** nos dois casos (e-mail não existe / senha errada) — não vaza quais e-mails são válidos (anti-enumeração)
- **Teste feliz:** `teste@teste.com` + `1234` → `listar.php` (pó bateu). **Teste negativo:** senha errada → "E-mail ou senha incorretos", sem vazar nada
- `if ($_POST)` vs `REQUEST_METHOD === 'POST'`: o método confirma o **veículo**; os `empty()` conferem a **carga** (POST vazio ainda é POST)

### 5.6 Segredo fora do alcance: o `.env` e o `.htaccess` (teste local, 27/09/2026)
- Criado `C:\xampp\htdocs\infowebti\.env` com as credenciais do banco (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`) — o mesmo que o `conectar.php` já usa
- **Teste curioso (a aula):** abri `http://localhost/infowebti/.env` no navegador → **STATUS 200** = o Apache **servia a senha do banco publicamente**. Segredo dentro da raiz web vaza sem pedir licença
- **Correção provada:** criado `.htaccess` na pasta com `Require all denied` para `^\.env|\.env$|^\.git` → mesma URL agora responde **403** (bloqueado). Reprovado: 200 → 403
- **Escopo consciente:** **por enquanto é teste local.** O `.htaccess` bloqueia, mas não é onde o segredo deve morar. Na **Fase 8 (publicação no cPanel)** o `.env`/secrets vão para **fora do `public_html`** — nunca confiar o segredo só a um bloqueio de servidor

### 5.7 Fechamento da F4 (logout, página protegida e o isolamento por sessão)
- Descoberta no código (teste 200/302): a porteira apontava para `logout.php` — funcionava, mas era caminho torto (quem não logou não tem o que destruir). Corrigido: **sem sessão → `login.php`**; logout só para quem está dentro
- **Login feliz provado com cookies:** `Invoke-WebRequest` seguiu a cadeia login → `perfil.php` (status 200) e a porta trancada para quem não tem `cliente_id` — acessar `perfil.php` direto sem sessão cai no login
- **Teste dos 2 usuários (o fechamento da F4):** com depoimentos reais para `cliente_id` 3 e 6, logar como cada um mostrou **só o próprio** depoimento, em telas separadas — o `WHERE depoimentos.cliente_id = ?` + `$_SESSION['cliente_id']` filtraram por dono
- **`bind_param('i', ...)` = `i`**: `cliente_id` é inteiro (id), não string — tipo importa no `?`
- **Nomenclatura que valeu aula:** a coluna se chama `cliente_id`; "FK" é o **papel** (a constraint). MySQL filtra pelo **nome da coluna**, não pelo rótulo — confundir os dois leva a `WHERE fk` que não existe
- `htmlspecialchars()` no texto do depoimento — é a primeira ficha da F6 (anti-XSS): dado do usuário sai como texto, não como HTML executável

### 5.8 Pendências da F4
- [x] `logout.php` — `session_unset()` + `session_destroy()` + redirect
- [x] `perfil.php` — **porteira:** `if (!isset($_SESSION['cliente_id'])) { header('Location: login.php'); exit; }`
- [x] Provar acesso direto a `perfil.php` sem logar → expulsão para o login
- [x] Teste dos 2 usuários (isolamento por `cliente_id`)
- [x] **F4 FECHADA (27/09/2026)**

---

_Continua..._