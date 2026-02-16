{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ 
    pkgs.nodejs_20. ,
    pkgs.firebase-tools # Adiciona a CLI do Firebase ao ambiente
  ];

  # Definições do IDX (VS Code Extensions, etc.)
  idx = {
    extensions = [ "dbaeumer.vscode-eslint" ];
    workspace = {
      onStart = {
        dev-server = "npm start";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "start" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
