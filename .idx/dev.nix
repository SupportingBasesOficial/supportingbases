{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ 
    pkgs.nodejs_20,
    pkgs.firebase-tools # Adiciona a CLI do Firebase ao ambiente
  ];

  # Variáveis de ambiente para as configurações do Firebase
  env = {
    FIREBASE_API_KEY = "AIzaSyD5jRAKuSwthbmTApCO1NIXq31Z9PagMf8";
    FIREBASE_AUTH_DOMAIN = "supportingbases-94551271-9f34b.firebaseapp.com";
    FIREBASE_PROJECT_ID = "supportingbases-94551271-9f34b";
    FIREBASE_STORAGE_BUCKET = "supportingbases-94551271-9f34b.appspot.com";
    FIREBASE_MESSAGING_SENDER_ID = "688483394625";
    FIREBASE_APP_ID = "1:688483394625:web:c03f6dffb1c24b7337d2c0";
  };

  # Definições do IDX (VS Code Extensions, etc.)
  idx = {
    extensions = [ 
      "dbaeumer.vscode-eslint",
      "google.gemini-cli-vscode-ide-companion"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm", "start"];
          manager = "web";
        };
      };
    };
  };
}
