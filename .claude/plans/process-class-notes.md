# Plano de Execução: Processamento Sequencial de Aulas

## Parâmetros de Entrada
- `lista_diretorios`: Array de caminhos de pasta (ex: `["/aulas/direito/2026-03-10", "/aulas/historia/2026-03-11"]`)
- `materia`: Nome da matéria associada.
- `diaaula`: Data/Identificador da aula (ex: `20260310`).

## Workflow Loop (Para cada diretório na lista):

1. **Etapa 1: Leitura e OCR**
   - Invocar `@ocr-transcriber` para ler as imagens da pasta do diretório atual.
   - Gerar o texto bruto unificado na memória.

2. **Etapa 2: Uniformização**
   - Invocar `@uniformizador-texto` no texto bruto.
   - Salvar o resultado no arquivo: `aula-{materia}-{diaaula}-transcricao.txt`.

3. **Etapa 3: Sumarização e Síntese**
   - Invocar `@sumarizador-conteudo` usando o arquivo de transcrição como entrada.
   - Gerar os dois arquivos finais:
     - `aula-{materia}-{diaaula}-resumo.txt`
     - `aula-{materia}-{diaaula}-sumario.txt`

4. **Etapa 4: Validação de Qualidade**
   - Executar `@validador-coerencia` para assegurar fidelidade total.
   - Finalizar o diretório e avançar para o próximo.