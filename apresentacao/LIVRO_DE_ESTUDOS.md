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
echo 'Bem-vindo, ' . $nome . '!';
```

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

### Regra de ouro do curso (vale para todas as fases)
- "Eu escrevo, executo e confiro. O revisor só corrige."
- "Passo aberto, nunca oculto: eu afirmo o que a tela mostrou, mostrando a tela."
- "A mensagem de erro é sua professora — leia até o fim, ela diz exatamente o que bloqueou."
- "Se não sei, declaro não saber. Honestidade vale mais que qualquer código."

---

_Continua..._