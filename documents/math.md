# Cálculos de Dimensionamento e Custos (Infralyzer)

Este documento detalha as fórmulas matemáticas, algoritmos e lógicas de cálculo que o Infralyzer utiliza para converter métricas de negócio em requisitos de infraestrutura e projeções de custos, conforme definido na arquitetura principal (SAD).

---

## 1. Cálculo de Carga (Throughput)

A métrica base do sistema é entender quantas requisições o software precisará suportar, derivadas do comportamento dos usuários.

### 1.1. Requisições por Segundo (QPS - Queries Per Second)
Para encontrar a carga média, distribuímos o total de requisições diárias pelos segundos de um dia.

**Fórmula de QPS Médio:**
`QPS_avg = (DAU * RequestsPerUser) / 86400`

Onde:
*   **DAU**: Daily Active Users (Usuários Ativos Diários).
*   **RequestsPerUser**: Número médio de requisições que cada usuário faz por dia.
*   **86400**: Quantidade de segundos em um dia (24 horas * 60 minutos * 60 segundos).

**Fórmula de QPS de Pico (Peak QPS):**
O tráfego na internet não é constante. Usa-se um multiplicador temporal para estimar o momento de maior utilização do dia.
`QPS_peak = QPS_avg * PeakFactor`
*(O `PeakFactor` geralmente varia entre 1.5 a 3.0 para aplicações normais).*

### 1.2. Proporção de Leitura e Escrita (Read/Write Ratio)
A separação das requisições em leituras e escritas define o provisionamento de recursos de banco de dados e cache.

`Read_QPS = QPS_avg * ReadPercentage`
`Write_QPS = QPS_avg * WritePercentage`
*(Sendo `ReadPercentage + WritePercentage = 1` ou `100%`)*

---

## 2. Estimativa de Rede (Network Bandwidth)

A banda (throughput de rede) estima a transferência de dados e é vital para calcular os custos de transferência (Data Transfer).

### 2.1 Banda de Entrada (Ingress)
Representa os dados enviados do usuário para o servidor (Geralmente Write QPS multiplicados pelo tamanho do payload). Em muitos provedores Cloud, o *Ingress* é gratuito, mas o dimensionamento é importante.

`Ingress_Monthly_Bytes = Write_QPS * AvgPayloadSize_Bytes * 86400 * 30`
*(Pode ser convertido para GB dividindo por `1024^3`)*

### 2.2 Banda de Saída (Egress)
Representa a resposta retornada pela plataforma aos usuários (Download de HTML, JSON, Imagens). **Geralmente é a métrica cobrada pelas Clouds.**

`Egress_Monthly_Bytes = Read_QPS * AvgResponseSize_Bytes * 86400 * 30`
*(Convertido para GB dividindo por `1024^3`)*

---

## 3. Projeção de Armazenamento (Storage)

### 3.1 Acúmulo Diário de Dados
Calculado a partir do volume de escritas de dados processados em um dia.

`Storage_Daily = Write_QPS * 86400 * AvgPayloadSize_Bytes`

### 3.2 Armazenamento Definitivo e Retenção
Para dimensionar o disco necessário em um período futuro, considera-se a retenção dos dados e o fator de resiliência.

`Storage_Total = Storage_Daily * RetentionDays * ReplicationFactor`

Onde:
*   **RetentionDays**: Tempo que os dados serão retidos (ex: 30 dias para logs temporários, 1825 dias para conformidade legal (5 anos)).
*   **ReplicationFactor**: Quantidade de cópias replicadas em diferentes nós ou Availability Zones (o padrão comum de clusters de BD como o MongoDB/Cassandra é `3`).

---

## 4. Integração Financeira (Pricing & Cost Formulas)

Uma vez obtidos os volumes brutos de GBs, Tráfego e Processamento necessários, o motor aplica os preços obtidos via integrações com as APIs (ex: Azure Retail Prices).

Nota: Para garantir precisão com as finanças, será utilizada a biblioteca `Decimal.js`. Isso evita o famoso erro de arredondamento de ponto flutuante (ex: `0.1 + 0.2 = 0.30000000000000004`).

### 4.1. Custos de Armazenamento Mensal
Preço multiplicado pelos dados totais acumulados.
`Storage_Cost_Monthly = (Storage_Total_in_GB) * P_gb`
*(Onde `P_gb` é o Preço por GB cobrado pela Nuvem).*

### 4.2. Custos de Transferência de Dados (Egress Cost)
Volume total de rede sainte no mês.
`Network_Cost_Monthly = Egress_Monthly_GB * P_gb_egress`

### 4.3. Custos de Processamento
Com base no QPS de pico, é estimado quantas CPUs/Instâncias serão necessárias para suprir a demanda sem engasgos.
`Compute_Cost_Monthly = Number_of_Instances * PricePerHour * 730`
*(A constante `730` é comumente utilizada em Cloud Providers como a média de horas de um mês: `24 horas * 30.41 dias`).*
