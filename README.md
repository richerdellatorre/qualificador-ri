# 🏛️ Qualificador Registral & Conferidor de Minuta
### Cartório de Registro de Imóveis de Rondônia (CRI RO)

Sistema inteligente de apoio à qualificação registral imobiliária e conferência minuciosa de minutas antes da impressão, com conformidade às diretrizes do TJRO (DGE TJRO nº 21/2023), Provimento CNJ nº 149/2023, Lei 6.015/73 e Provimento CNJ nº 61/2017.

---

## 📥 Downloads do Sistema

Escolha a opção mais conveniente para você:

### 🌟 Opção 1: Pacote Completo Pronto para Usar (Recomendado - Tudo Incluso)
*Já vem com todas as bibliotecas e o sistema compilado dentro. Não precisa instalar nada, é só baixar, extrair e usar!*

👉 **[BAIXAR PACOTE COMPLETO PRONTO (.ZIP - 264 MB)](https://github.com/richerdellatorreadv/qualificador-ri/releases/download/v1.0.0/qualificador-ri-completo.zip)**

---

### 📦 Opção 2: Código-Fonte Limpo (.ZIP - 700 KB)
*Apenas os códigos fontes. Exige rodar o instalador `INSTALAR_PRIMEIRA_VEZ.bat` para baixar as bibliotecas.*

👉 **[Baixar Código Fonte (.ZIP)](https://github.com/richerdellatorreadv/qualificador-ri/archive/refs/heads/main.zip)**

---

## 🚀 Como Executar no seu Computador (Super Fácil)

1. **Baixe e extraia** o arquivo `.zip` (Opção 1 acima).
2. Dê **dois cliques** no arquivo **`INICIAR_SISTEMA.bat`**.
   - O sistema vai iniciar e **abrir automaticamente a tela no seu navegador** (`http://localhost:3000`).
   - Para encerrar o programa quando terminar de usar, basta fechar a janela preta.

---

## 🌐 Acesso Online Direto (Sem Instalação)

O sistema também está disponível online na nuvem:
👉 **[qualificador-ri.onrender.com](https://qualificador-ri.onrender.com)**

---

## ⚙️ Configuração da Chave Gemini (.env.local)

Certifique-se de que o arquivo `.env.local` na pasta contenha sua chave:
```env
GEMINI_API_KEY=sua_chave_aqui
```

---

## 📋 Módulos Principais

1. **Qualificador Registral**: Análise de PDFs e imagens de títulos e matrículas, verificação de continuidade, desmembramento, ITBI/ITCMD, áreas rurais (CCIR, ITR, CAR, VTI/VTN) e valor venal urbano (> 1 ano).
2. **Conferidor de Minuta**: Confronto linha a linha do texto da minuta com os documentos de referência, sequência e blocos de selos digitais, Art. 655 DGE/RO para pessoas jurídicas e análise de múltiplas avaliações.
