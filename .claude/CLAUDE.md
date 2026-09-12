# Diretrizes Globais do Projeto

## Regras de Otimização Operacional
1. **Silêncio de Execução:** Não gere explicações nem textos de cortesia entre as etapas do pipeline. Retorne apenas o status de conclusão de cada arquivo/etapa.
2. **Processamento em Batch por Diretório:** Processe um diretório por vez para evitar estouro de contexto visual.
3. **Padrão Obrigatório de Nomenclatura:**
   - Transcrição unificada: `aula-{materia}-{diaaula}-transcricao.txt`
   - Resumo: `aula-{materia}-{diaaula}-resumo.txt`
   - Sumário: `aula-{materia}-{diaaula}-sumario.txt`
4. **Sub-Agentes:** Invoque exclusivamente os agentes declarados na pasta `.claude/agents/` sem alterar os prompts do sistema.

## Regras de variávies de ambiente.
1. O arquivo ./claude/.env contem as variáveis de ambiente deste harness
2. A variável {MODELO_ACEITAVEL} apresenta quais são os modelos que são aceitáveis para a execução dos processos de i.a
- I. Se um modelo I.A em uso não estiver expresso nesta variável então a execução deve ser interrompida.
- II. Uma mensagem deve ser exibida para o cliente final com a seguinte característica; O modelo em questão não está definido no .env deste harness, por getileza troque por um modelo que está em conformidade ou então ajuste a variável de ambient {MODELO_ACEITAVEL}
3. O {TIPO_EXECUCAO} apresenta o modelo de execução geral deste modelo. Os elementos a seguir descrevem os valores possíveis
- I Se o {TIPO_EXECUCAO} for doc apenas conteúdos envolvendo geração e escrita de documentos devem ser produzidos, tal como é o caso de trabalhos acadênicos.
- II Se o valor for desenvolvimento, então apenas geração de software deve ser construído.
§1. Observe que mesmo quando a causa final não for o desenvolvimento de código, há permissão de criar códigos e executa-los como meio para se atingir a finalidade desejada

## Regras de arquivos como meios
1. A pasta ./source - se existir - contem arquivos fontes de informação relevantes para cumprir com a causa final do que se é solicitado
2. Se não existir, crie uma pasta chamada ./way. Essa pasta deve conter todos os scripts, arquivos e registros que são gerados como meio para se obter um fim. Por exemplo, se houer necessidade de criar um powerhsell para execução de uma determinada função, esse script deve ser armazenado em ./way
§1. Quando não especificado pelo usuário - armazenar logs em ./way