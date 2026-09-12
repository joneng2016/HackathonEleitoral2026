### Agente Caderno Resumo

---

# Resumo do agente
**Nome**: Agente de Transcrição e Resumo de Notas Manuscritas  
**Objetivo**: Receber imagens ou arquivos que contenham imagens (fotos de caderno, PDFs, ZIPs), extrair texto manuscrito (letra cursiva, frequentemente ilegível), estruturar o conteúdo e gerar um **resumo acionável** com metadados e níveis de confiança.  
**Saída esperada**: JSON com transcrição por página/linha, confidências, entidades extraídas, resumo em bullets e imagens recortadas para revisão.

---

# Entradas e saídas

## Entradas aceitas
- **Formatos de arquivo**: JPEG; PNG; HEIC; TIFF; PDF; ZIP contendo imagens.  
- **Upload**: multipart/form-data via API; captura por câmera via UI.  
- **Metadados opcionais**: `author_hint`, `date_hint`, `language_hint`, `profile_id`.

## Saídas principais
- **Transcrição**: texto por página e por linha com **confidence** por linha.  
- **Resumo estruturado**: 3–8 bullets com tópicos principais, ações, prazos e responsáveis.  
- **Entidades**: lista de entidades normalizadas (TIME, DATE, PERSON, TASK, NUMBER, FORMULA).  
- **Imagens recortadas**: referências a crops por linha/bloco.  
- **Relatório de qualidade**: CER, WER estimados, média de confiança.  
- **Formatos de exportação**: Markdown sob demanda.

# Pipeline de processamento

## Etapas principais
1. **Ingestão**
   - Validar tipo e tamanho do arquivo.
   - Extrair imagens de PDFs e ZIPs em alta resolução (recomendar 300–600 DPI).

2. **Pré-processamento**
   - **Correção de perspectiva** e alinhamento de página.
   - **Remoção de sombras** e equalização de contraste (CLAHE).
   - **Denoising** e binarização adaptativa.
   - Normalização de DPI e redimensionamento.

3. **Segmentação**
   - Detectar blocos manuscritos; gerar bounding boxes por bloco, linha e palavra.
   - Heurísticas para linhas de caderno (alinhamento horizontal).

4. **Reconhecimento de escrita (HTR)**
   - Inferência linha a linha com modelo HTR; retornar texto + score.
   - Fallback para modelo alternativo se confiança baixa.

5. **Pós-processamento**
   - Correção ortográfica contextual com language model.
   - Normalização de datas, horas, números e unidades.
   - Reconhecimento de entidades (NER) e classificação de sentenças.

6. **Resumo e estruturação**
   - Classificação por tipo: tarefas, definições, fórmulas, listas.
   - Geração de resumo extractive; opção de resumo abstractive curto.
   - Produção de lista de ações com prazos e responsáveis quando detectados.

7. **Feedback e aprendizado**
   - Registrar correções do usuário para fine-tuning incremental.
   - Atualizar perfil de escrita por `profile_id`.

## Regras de confiança e fallback
- **Linha com confidence < 0.60**: marcar `low_confidence` e incluir crop para revisão humana.  
- **Página com CER acima do threshold**: sinalizar revisão manual e sugerir fine-tuning com amostras do autor.  
- **Fallback**: tentar modelo alternativo ou solicitar revisão humana via UI.

---