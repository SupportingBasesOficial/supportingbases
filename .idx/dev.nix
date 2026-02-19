
{ pkgs, ... }: {
  # O canal Nixpkgs a ser usado. "stable-24.05" é o padrão.
  channel = "stable-24.05";
  
  # Lista de pacotes para instalar no ambiente de desenvolvimento.
  packages = [
    pkgs.nodejs_20  # Necessário para o Firebase e outras ferramentas JS
    pkgs.pnpm       # Gerenciador de pacotes para monorepo
  ];
  
  # Variáveis de ambiente a serem definidas.
  env = {};

  # Configurações específicas do IDE (IDX).
  idx = {
    # Lista de extensões do VS Code para instalar.
    extensions = [
      "vscode.git"
      "firebase.firebase-vscode"
    ];

    # Configuração do ambiente de trabalho e ciclo de vida.
    workspace = {
      # Comandos a serem executados na criação do workspace.
      onCreate = {
        # Instala as dependências do monorepo com pnpm.
        pnpm-install = "pnpm install";
      };
      
      # Comandos a serem executados na inicialização do workspace.
      onStart = {};
    };

    # Configuração da pré-visualização (preview).
    previews = {
      enable = true;
      previews = {
        # Define um preview para a aplicação web (Next.js).
        web = {
          # Comando para iniciar o servidor de desenvolvimento do Next.js.
          # O pnpm --filter web dev executa o script 'dev' do app 'web'.
          command = ["pnpm", "--filter", "web", "run", "dev", "--", "--port", "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
