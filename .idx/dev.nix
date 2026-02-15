# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  
  # A list of packages to install from the specified channel.
  # Use https://search.nixos.org/packages to find packages.
  packages = [
    # Node.js for running JavaScript and related tools.
    pkgs.nodejs_20
    # A simple, zero-configuration command-line HTTP server.
    pkgs.nodePackages.http-server
  ];

  # Sets environment variables in the workspace.
  env = {};

  idx = {
    # A list of VS Code extensions to install from the Open VSX Registry.
    # Use "publisher.id" from https://open-vsx.org/.
    extensions = [
      # An extension for linting JavaScript code.
      "dbaeumer.vscode-eslint"
    ];

    # Configure a web preview for your application.
    previews = {
      enable = true;
      previews = {
        # This configures a preview tab named "web".
        web = {
          # The command to start the development server.
          # It serves files from the "public" directory.
          # $PORT is a variable that will be replaced with a free port.
          # -c-1 disables caching, which is useful for development.
          command = ["http-server" "public" "-p" "$PORT" "-c-1"];
          # This uses the built-in web preview manager.
          manager = "web";
        };
      };
    };
  };
}
