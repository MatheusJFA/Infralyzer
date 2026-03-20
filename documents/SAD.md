🏗️ SAD - Project Infralyzer

Documento de Arquitetura de Software Versão: 1.1 (Next.js Edition)
Status: Em Desenvolvimento

1. Visão Geral

O Infralyzer é uma ferramenta de suporte à decisão para arquitetos de sistemas. Ele transforma métricas de negócio (DAU, comportamento do usuário) em previsões técnicas de infraestrutura e custos financeiros reais, consumindo APIs públicas de provedores de Cloud.

2. Requisitos do Sistema
2.1 Funcionais (FR)
ID	Requisito	Descrição
- FR1	Cálculo de Carga	Converter DAU e Requests/User em QPSavg​ e QPSpeak​.
- FR2	Estimativa de Rede	Calcular Ingress/Egress mensal baseado no tamanho médio do payload.
- FR3	Projeção de Storage	Calcular acúmulo de dados considerando fator de replicação e retenção.
- FR4	Integração de Preços	Consultar APIs da Azure Retail Prices e AWS Pricing.
- FR5	Comparativo de Clouds	Exibir tabela comparativa de custos entre AWS, Azure e GCP.

2.2 Não Funcionais (NFR)
    Performance: Tempo de resposta para recálculos inferior a 100ms.
    SSR/SSG: Utilizar Next.js para pré-renderização de componentes estáticos.
    Segurança: Proxy de API Routes para ocultar chaves de API e evitar CORS.
    Responsividade: Design mobile-first para consultas rápidas em dispositivos móveis.

3. Pilha Tecnológica (Tech Stack)
    Framework: Next.js 14+ (App Router)
    Linguagem: TypeScript (Strict Mode)
    Estilização: Tailwind CSS + Shadcn/UI
    Estado & Cache: TanStack Query (React Query) para gerenciar chamadas de API de preços.
    Gráficos: Recharts (para séries temporais de custo) e Lucide React (ícones).
    Matemática: Decimal.js (para evitar erros de precisão de ponto flutuante em cálculos financeiros).

4. Arquitetura de Dados e Lógica Core
4.1 Fórmulas Fundamentais
A lógica reside em src/lib/core. As equações principais são:
    Queries Per Second:
    QPS=86400DAU×RequestPerUser

    Onde RequestPerUser é o número de requisições por usuário.

    Vamos validar também a quantidade de escritas (writes) e leituras (reads).

    Também será utilizado nas contas o Replication Factory

    Custo de Armazenamento:
    Costs​=(Sdaily​×Tdays​)×Pgb​

    Onde Pgb​ é o preço por GB retornado pela API da Cloud.

5. Estrutura de Pastas (Next.js App Router)
Plaintext

src/
├── app/                    # Next.js App Router (Páginas e API Routes)
│   ├── api/                # Proxy para Cloud Pricing APIs (Bypass CORS)
│   │   ├── azure/route.ts
│   │   └── aws/route.ts
│   ├── dashboard/          # View principal
│   └── layout.tsx
├── components/             # UI Components (Shadcn)
│   ├── charts/             # Gráficos de custo e tráfego
│   ├── forms/              # Sliders e Inputs de métricas
│   └── ui/                 # Componentes base (button, card, etc)
├── hooks/                  # Custom hooks (ex: useCalculation)
├── lib/
│   ├── core/               # Engine de cálculo (TS puro)
│   │   ├── engine.ts       # Centralizador de lógica
│   │   ├── formulas.ts     # Fórmulas matemáticas
│   │   └── constants.ts    # Valores default e limites
│   └── utils.ts            # Helpers de formatação (moeda, bytes)
├── services/               # Clientes de API (Axios/Fetch)
└── types/                  # Definições de interfaces globais

6. Estratégia de API de Terceiros

Para evitar que o cliente (browser) faça requisições diretas para a AWS/Azure, utilizaremos Next.js API Routes como um middleware.

    O cliente envia uma query: GET /api/prices?provider=azure&service=storage.

    O servidor Next.js faz o fetch na Azure Retail Prices API.

    O servidor aplica um cache (ex: 24 horas) para não estourar o limite de rate limit das nuvens.

    O resultado limpo retorna para o gráfico do usuário.