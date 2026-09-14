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

## CAPÍTULO 3 — (Fase 3) PHP + MySQL + prepared statements

*Em aberto — reservado para a próxima sessão de estudo.*

- Conectar PHP ao MySQL (usuário `infowebti_app`)
- Página que lista depoimentos aprovados do banco
- `mysqli` + prepared statement (NUNCA concatenar SQL)
- Teoria a revisar antes: por que o prepared statement impede SQL injection

---

_Continua..._