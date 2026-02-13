# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    # Go (Golang) for building the core of our application
    pkgs.go
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # Official Go extension for VS Code
      "golang.go"
    ];
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Initialize the Go module for our project
        go-mod-init = "go mod init supportingbases";
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Example command to run the application
        # We will create the main.go file in the next step
        # run-app = "go run .";
      };
    };
  };
}
