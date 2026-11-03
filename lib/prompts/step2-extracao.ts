// ============================================================
// Passo 2 — Extração estruturada dos dados de cada documento
// ============================================================

export const PROMPT_EXTRACAO = `Com base nos documentos que você já analisou, extraia todas as informações relevantes para a qualificação registral.

Retorne um JSON com o seguinte schema:

{
  "matricula": {
    "numero": "string",
    "comarca": "string",
    "cartorio": "string",
    "natureza_imovel": "URBANO" | "RURAL" | "INDEFINIDO",
    "proprietarios_atuais": [
      {
        "nome": "string",
        "cpf": "string | null",
        "rg": "string | null",
        "estado_civil": "string",
        "regime_bens": "string | null",
        "forma_aquisicao": "string"
      }
    ],
    "descricao_imovel": {
      "area": "string",
      "confrontacoes": "string",
      "localizacao": "string",
      "registro_anterior": "string | null"
    },
    "onus_gravames": ["string"],
    "restricoes": ["string"],
    "historico_desmembramentos": ["string"],
    "tem_desmembramento": boolean,
    "tem_area_remanescente_caracterizada": boolean,
    "cadastro_imobiliario": "string | null",
    "ccir": "string | null",
    "itr": "string | null",
    "car": "string | null",
    "ultima_averbacao": "string | null",
    "ultimo_registro": "string | null",
    "tem_mancomunhao": boolean,
    "obs": "string | null"
  },
  "titulo": {
    "tipo": "string",
    "livro": "string | null",
    "folha": "string | null",
    "numero_escritura": "string | null",
    "data_lavratura": "string | null",
    "tabeliao": "string | null",
    "cartorio_origem": "string | null",
    "assinatura_digital": {
      "tem_assinatura_digital": boolean,
      "forma_assinatura_consta": boolean,
      "matricula_notarial_eletronica": "string | null",
      "formato_pdfa": boolean | null,
      "todos_assinaram_fecho": boolean | null
    },
    "transmitentes": [
      {
        "nome": "string",
        "cpf": "string | null",
        "doc_identidade": "string | null",
        "nacionalidade": "string | null",
        "estado_civil": "string | null",
        "uniao_estavel_declarada": boolean | null,
        "regime_bens": "string | null",
        "filiacao": "string | null",
        "profissao": "string | null",
        "endereco": "string | null",
        "email": "string | null",
        "eh_pessoa_juridica": boolean,
        "cnpj": "string | null"
      }
    ],
    "adquirentes": [
      {
        "nome": "string",
        "cpf": "string | null",
        "doc_identidade": "string | null",
        "nacionalidade": "string | null",
        "estado_civil": "string | null",
        "uniao_estavel_declarada": boolean | null,
        "regime_bens": "string | null",
        "filiacao": "string | null",
        "profissao": "string | null",
        "endereco": "string | null",
        "email": "string | null",
        "eh_pessoa_juridica": boolean,
        "cnpj": "string | null"
      }
    ],
    "procuradores": [
      {
        "nome": "string",
        "representa": "string",
        "poderes_especificos": boolean | null,
        "validade": "string | null"
      }
    ],
    "imovel_titulo": {
      "area": "string | null",
      "confrontacoes": "string | null",
      "localizacao": "string | null",
      "matricula_referenciada": "string | null"
    },
    "forma_aquisicao_transmitente": "string | null",
    "valor_transacao": "string | null",
    "itbi": {
      "consta": boolean,
      "numero_guia": "string | null",
      "valor": "string | null",
      "data_recolhimento": "string | null",
      "municipio": "string | null"
    },
    "itcmd": {
      "consta": boolean,
      "numero_guia": "string | null",
      "valor": "string | null"
    },
    "documentos_rurais": {
      "ccir": {
        "consta": boolean,
        "area": "string | null",
        "lote_gleba_setor": "string | null",
        "compativel_matricula": boolean | null
      },
      "itr": {
        "consta": boolean,
        "qualificacao_imovel": "string | null",
        "compativel_matricula": boolean | null
      },
      "car": {
        "consta": boolean,
        "area": "string | null",
        "vinculo_imovel": "string | null",
        "compativel_matricula": boolean | null
      }
    }
  }
}

Extraia TODOS os dados visíveis. Quando uma informação não constar, use null. 
Seja fiel ao documento — não invente dados.`;
