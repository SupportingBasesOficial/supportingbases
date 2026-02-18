
{ pkgs, ... }: {
  # O canal Nixpkgs a ser usado. "stable-24.05" é o padrão.
  channel = "stable-24.05";
  
  # Lista de pacotes para instalar no ambiente de desenvolvimento.
  packages = [
    pkgs.nodejs_20  # Necessário para o Firebase e outras ferramentas JS
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
        # Instala as dependências do npm.
        npm-install = "npm install";
      };
      
      # Comandos a serem executados na inicialização do workspace.
      onStart = {};
    };

    # Configuração da pré-visualização (preview).
    previews = {
      enable = true;
      previews = {
        # Define um preview para a aplicação web.
        web = {
          # Comando para iniciar um servidor web estático.
          # O 'pkgs.nodePackages.http-server' nos dá um servidor simples.
          # Ele servirá o conteúdo da pasta 'public' na porta definida pela variável $PORT.
          command = ["${pkgs.nodePackages.http-server}/bin/http-server" "public" "-p" "$PORT" "-c-1"];
          manager = "web";
        };
      };
    };
  };
}
