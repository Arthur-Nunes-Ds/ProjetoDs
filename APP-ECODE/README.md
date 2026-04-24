# EcoMonitor (APP-ECODE) 

O **EcoMonitor** é um aplicativo móvel desenvolvido em Expo/React Native focado em sustentabilidade e consumo inteligente. O objetivo é permitir que os usuários acompanhem e reduzam o consumo de recursos naturais como água, energia e materiais, utilizando dados claros e metas conscientes para o dia a dia.

---

## Arquitetura do Projeto

O projeto segue uma arquitetura modular baseada em **Separação de Preocupações (SoC)**, garantindo que o código seja fácil de manter, testar e escalar.

### Estrutura de Pastas

```text
src/
├── assets/       # Recursos estáticos (imagens, ícones, logos)
├── components/   # Componentes visuais reutilizáveis (Botões, Inputs, Cards)
├── routes/       # Configuração de navegação (Stack, Tab, Drawer)
├── screens/      # Telas principais da aplicação
├── services/     # Integrações externas e lógica de negócios (API, Auth)
├── styles/       # Temas globais, cores e estilos compartilhados
└── utils/        # Funções utilitárias e constantes globais
```

### Decisões Arquiteturais

1.  **Centralização de API**: Utilizamos uma instância única do **Axios** em `services/api.js` para gerenciar a URL base, headers e tokens de autenticação em um só lugar.
2.  **Modularização de Serviços**: Lógicas complexas (como autenticação) foram movidas para arquivos de serviço (`authService.js`), mantendo as telas focadas apenas na Interface do Usuário (UI).
3.  **Sistema de Estilos Global**: Cores e constantes visuais estão centralizadas em `styles/theme.js`, facilitando mudanças de identidade visual em todo o app instantaneamente.
4.  **Navegação Desacoplada**: A lógica de navegação foi removida do `App.js` raiz para `routes/AppRoutes.js`, permitindo uma configuração de rotas mais robusta e dinâmica.

---

## Tecnologias Utilizadas

- **Core**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Navegação**: [React Navigation](https://reactnavigation.org/)
- **Estilização**: StyleSheet (Vanilla) + [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) + [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur/)
- **Ícones**: [Lucide React Native](https://lucide.dev/) + [Expo Vector Icons](https://icons.expo.fyi/)
- **Comunicação**: [Axios](https://axios-http.com/)
- **Persistência**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
- **UI/Charts**: [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- **Tipografia**: [Expo Google Fonts (Ubuntu)](https://docs.expo.dev/guides/using-custom-fonts/)

---

## Como Executar

1.  **Instalar dependências**:
    ```bash
    npm install
    ```

2.  **Iniciar o Expo**:
    ```bash
    npx expo start
    ```

3.  **Abrir o App**:
    - Use o **Expo Go** no seu celular escanenado o QR Code.
    - Ou pressione `a` para Android ou `i` para iOS se tiver os emuladores configurados.

---

## Contribuição

Ao adicionar novas funcionalidades, siga os padrões estabelecidos:
- Telas novas devem ir para `src/screens/`.
- Chamadas de API devem ser criadas em `src/services/`.
- Use as cores definidas em `src/styles/theme.js`.

---

Desenvolvido com foco em um futuro mais sustentável. 
