# 🏛️ Qualificador Registral & Conferidor de Minuta
### Cartório de Registro de Imóveis de Rondônia (CRI RO)

Sistema inteligente de apoio à qualificação registral imobiliária e conferência minuciosa de minutas antes da impressão, com conformidade às diretrizes do TJRO (DGE TJRO nº 21/2023), Provimento CNJ nº 149/2023, Lei 6.015/73 e Provimento CNJ nº 61/2017.

---

## 📥 Como Baixar o Sistema

Você pode baixar todo o projeto compilado e pronto em formato `.zip`:

👉 **[CLIQUE AQUI PARA BAIXAR O SISTEMA (.ZIP)](https://github.com/richerdellatorreadv/qualificador-ri/archive/refs/heads/main.zip)**

---

## 🚀 Como Executar no seu Computador (Super Fácil)

Não é necessário digitar nenhum comando técnico no terminal. Tudo é feito por duplo clique:

1. **Baixe e extraia** o arquivo `.zip` acima em qualquer pasta do seu computador.
2. *(Apenas na primeira vez que for rodar)*: Dê dois cliques no arquivo **`INSTALAR_PRIMEIRA_VEZ.bat`** e aguarde ele finalizar.
3. **Para abrir o programa no dia a dia**: Basta dar dois cliques no arquivo **`INICIAR_SISTEMA.bat`**.
   - O sistema vai iniciar e **abrir automaticamente a tela do programa no seu navegador** (`http://localhost:3000`).
   - Para encerrar o programa quando terminar o trabalho, basta fechar a janela preta.

---

## 🌐 Acesso Online Direto (Sem Instalação)

O sistema também está disponível online na nuvem:
👉 **[qualificador-ri.onrender.com](https://qualificador-ri.onrender.com)**

---

## ⚙️ Configuração de Chave (.env.local)

Para a inteligência artificial funcionar localmente, garanta que o arquivo `.env.local` na pasta do sistema contenha sua chave:
```env
GEMINI_API_KEY=sua_chave_aqui
```

---

## 📋 Módulos Principais

1. **Qualificador Registral**: Análise de PDFs e imagens de títulos e matrículas, verificação de continuidade, desmembramento, ITBI/ITCMD, áreas rurais (CCIR, ITR, CAR, VTI/VTN) e valor venal urbano (> 1 ano).
2. **Conferidor de Minuta**: Confronto linha a linha do texto da minuta com os documentos de referência, sequência e blocos de selos digitais, Art. 655 DGE/RO para pessoas jurídicas e análise de múltiplas avaliações.
