# RA Evaluation API

API de avaliação para o website da **RA Instalações Elétricas**. Permite criar, consultar, atualizar e deletar avaliações de usuários autenticados, além de consultar dados públicos de usuários e realizar health check.

---

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via **JWT Bearer Token** no header `Authorization`:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

Tokens inválidos ou ausentes resultarão em erro 401.

---

## 🛣️ Endpoints

### Avaliações (`/evaluation`)

#### `GET /evaluation`
- **Descrição:** Lista todas as avaliações ou retorna a avaliação do usuário autenticado.
- **Query params:**
  - `page` (opcional, default: 1)
  - `pageSize` (opcional, default: 10, min: 1, max: 20)
  - `minValue` (opcional, default: 1, min: 1, max: 5)
  - `maxValue` (opcional, default: 5, min: 1, max: 5)
  - `randomized` (opcional, default: false)
- **Headers:** `Authorization` (opcional)
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Avaliações encontradas!",
      "evaluations": [ ... ],
      "authors": [ ... ]
    }
    ```
    ou, se autenticado:
    ```json
    {
      "message": "Sucesso ao pegar sua avaliação!",
      "evaluation": { ... }
    }
    ```
  - `400 Bad Request`: Parâmetros inválidos.
  - `404 Not Found`: Nenhuma avaliação encontrada.
  - `500 Internal Server Error`: Erro interno do servidor.

#### `POST /evaluation`
- **Descrição:** Cria uma nova avaliação (usuário autenticado pode ter apenas uma).
- **Headers:** `Authorization` (obrigatório)
- **Body:**
    ```json
    {
      "value": 5,
      "content": "Ótimo serviço!"
    }
    ```
- **Respostas:**
  - `201 Created`:
    ```json
    {
      "message": "Avaliação criada com sucesso!",
      "evaluation": { ... }
    }
    ```
  - `400 Bad Request`: Dados inválidos.
  - `401 Unauthorized`: Token ausente ou inválido.
  - `409 Conflict`: Usuário já possui uma avaliação.

#### `PUT /evaluation`
- **Descrição:** Atualiza a avaliação do usuário autenticado.
- **Headers:** `Authorization` (obrigatório)
- **Body:**
    ```json
    {
      "value": 4,
      "content": "Atualizei minha avaliação."
    }
    ```
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Avaliação atualizada com sucesso!",
      "evaluation": { ... }
    }
    ```
  - `401 Unauthorized`: Token ausente ou inválido.

#### `DELETE /evaluation`
- **Descrição:** Deleta a avaliação do usuário autenticado.
- **Headers:** `Authorization` (obrigatório)
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Avaliação deletada com sucesso!"
    }
    ```
  - `401 Unauthorized`: Token ausente ou inválido.
  - `404 Not Found`: Nenhuma avaliação encontrada para o usuário.

---

### Usuário (`/user/:userId`)

#### `GET /user/:userId`
- **Descrição:** Retorna dados públicos de um usuário pelo UUID.
- **Params:** `userId` (UUID)
- **Respostas:**
  - `200 OK`:
    ```json
    {
      "message": "Busca realizada com sucesso!",
      "user": {
        "uid": "uuid",
        "displayName": "Nome",
        "photoURL": "url"
      }
    }
    ```
  - `404 Not Found`: Usuário não encontrado.

---

### Ping (`/ping`)

#### `GET /ping`
- **Descrição:** Health check da API.
- **Respostas:**
  - `200 OK`:
    ```json
    { "message": "Pong!" }
    ```

---

## 📋 Resumo dos Endpoints

| Método | Rota                  | Autenticação | Descrição                        | Status Possíveis                      |
|--------|-----------------------|--------------|----------------------------------|---------------------------------------|
| GET    | /evaluation           | Opcional     | Lista avaliações ou do usuário   | 200, 400, 404, 500                    |
| POST   | /evaluation           | Obrigatória  | Cria avaliação                   | 201, 400, 401, 409                    |
| PUT    | /evaluation           | Obrigatória  | Atualiza avaliação               | 200, 401                              |
| DELETE | /evaluation           | Obrigatória  | Deleta avaliação                 | 200, 401, 404                         |
| GET    | /user/:userId         | Não          | Dados públicos do usuário        | 200, 404                              |
| GET    | /ping                 | Não          | Health check                     | 200                                   |

---

## 📝 Observações

- Todos os endpoints retornam mensagens claras de erro em caso de falha.
- O usuário autenticado pode ter apenas uma avaliação.

<p align="center"><a href="https://github.com/d3veduardo"><img src="https://github.com/D3vEduardo/D3vEduardo/blob/main/github_readme.png?raw=true" /></a></p>

---

## 📫 Contato

Dúvidas ou sugestões? Entre em contato com a equipe da RA Instalações Elétricas.

<p align="center"><a href="https://github.com/d3veduardo"><img src="https://github.com/D3vEduardo/D3vEduardo/blob/main/github_readme.png?raw=true" /></a></p>