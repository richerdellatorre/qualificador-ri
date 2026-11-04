# 🏛️ Qualificador Registral & Conferidor de Minuta
### Cartório de Registro de Imóveis de Rondônia (CRI RO)

Sistema inteligente de apoio à qualificação registral imobiliária e conferência minuciosa de minutas antes da impressão, com conformidade às diretrizes do TJRO (DGE TJRO nº 21/2023), Provimento CNJ nº 149/2023, Lei 6.015/73 e Provimento CNJ nº 61/2017.

---

## 📥 Download do Sistema (Tudo Incluso)

O pacote completo já vem com tudo pronto: o instalador do Node.js, todas as bibliotecas e o sistema compilado dentro:

👉 **[CLIQUE AQUI PARA BAIXAR O PACOTE COMPLETO (.ZIP - 293 MB)](https://github.com/richerdellatorreadv/qualificador-ri/releases/download/v1.0.0/qualificador-ri-completo.zip)**

---

## 🚀 Como Executar em Qualquer Computador (2 Passos Simples)

Ao descompactar o arquivo `.zip` acima:

1. **Passo 1 (Apenas na 1ª vez que usar o computador)**:
   - Dê dois cliques no arquivo: **`1_INSTALAR_PRIMEIRO_node-v22-x64.msi`**
   - Clique em *Next / Avançar* até concluir a instalação do Node.js.
   - *(Você só faz isso uma única vez por computador).*

2. **Passo 2 (Abrir o programa)**:
   - Dê dois cliques no arquivo: **`INICIAR_SISTEMA.bat`**
   - O sistema vai iniciar e abrir automaticamente a tela no seu navegador (`http://localhost:3000`).
   - Nos próximos dias, basta clicar direto no `INICIAR_SISTEMA.bat`!

---

## 🌐 Acesso Online Direto (Sem Instalar Nada)

Você também pode acessar diretamente pela nuvem de qualquer dispositivo:
👉 **[qualificador-ri.onrender.com](https://qualificador-ri.onrender.com)**

---

## ⚙️ Configuração da Chave (.env.local)

Certifique-se de que o arquivo `.env.local` na pasta contenha sua chave:
```env
GEMINI_API_KEY=sua_chave_aqui
```

---

## 📋 Módulos Principais

1. **Qualificador Registral**: Análise de PDFs e imagens de títulos e matrículas, verificação de continuidade, desmembramento, ITBI/ITCMD, áreas rurais (CCIR, ITR, CAR, VTI/VTN) e valor venal urbano (> 1 ano).
2. **Conferidor de Minuta**: Confronto linha a linha do texto da minuta com os documentos de referência, sequência e blocos de selos digitais, Art. 655 DGE/RO para pessoas jurídicas e análise de múltiplas avaliações.
