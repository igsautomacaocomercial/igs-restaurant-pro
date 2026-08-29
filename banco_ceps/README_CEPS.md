# Base de CEPs

O arquivo `ceps_rp.sql` pode ser aproveitado pelo IGS Restaurant PRO.

Ele preenche a tabela:

```sql
public.ceps(cep, bairro, logradouro, codigo_municipio)
```

Antes de importar, rode o schema principal do sistema, pois ele cria a tabela `ceps`.

## Importar no PostgreSQL

Com o banco `igs_restaurant_pro` criado:

```bat
psql -U postgres -d igs_restaurant_pro -f C:\IGS\RestaurantPRO\database\schema.sql
psql -U postgres -d igs_restaurant_pro -f C:\IGS\RestaurantPRO\banco_ceps\ceps_rp.sql
```

Senha padrão configurada no projeto:

```text
123
```

## Como será usado

- O CEP ajuda a preencher logradouro, bairro e município no cadastro de clientes.
- A taxa de entrega fica na tabela `delivery_districts`, por bairro/região.
- No delivery, o sistema soma `valor dos produtos + taxa do bairro`.

